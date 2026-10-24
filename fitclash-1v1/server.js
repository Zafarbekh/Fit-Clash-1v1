const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "public")));
app.get("/health", (_req, res) => res.json({ ok: true, service: "FitClash 1v1" }));

// In-memory prototype state. For production, use Redis/database and authenticated accounts.
const waiting = [];
const rooms = new Map();
const playerState = new Map();

function makeCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code;
  do {
    code = Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  } while (rooms.has(code));
  return code;
}
function publicPlayer(socketId) {
  const p = playerState.get(socketId) || {};
  return { id: socketId, name: p.name || "Wanderer", country: p.country || "🌐", level: p.level || 1, reps: 0, connected: true };
}
function leaveCurrent(socket) {
  const oldCode = socket.data.roomCode;
  if (!oldCode) return;
  const room = rooms.get(oldCode);
  socket.leave(oldCode);
  socket.data.roomCode = null;
  if (!room) return;
  room.players = room.players.filter(p => p.id !== socket.id);
  if (room.players.length === 0) rooms.delete(oldCode);
  else {
    room.players.forEach(p => { p.reps = p.reps || 0; });
    io.to(oldCode).emit("player-left", { message: "Your opponent disconnected or left the room." });
    io.to(oldCode).emit("room-state", room);
    // Keep room alive for the remaining player to invite someone else.
  }
}
function emitRoom(code) {
  const room = rooms.get(code);
  if (room) io.to(code).emit("room-state", room);
}

io.on("connection", socket => {
  playerState.set(socket.id, { name: "Wanderer", country: "🇺🇿", level: 1 });
  socket.emit("server-ready", { online: true });

  socket.on("set-profile", data => {
    const prev = playerState.get(socket.id) || {};
    const name = String(data?.name || "Wanderer").trim().slice(0, 18) || "Wanderer";
    const country = String(data?.country || "🇺🇿").slice(0, 8);
    playerState.set(socket.id, { ...prev, name, country });
  });

  socket.on("find-match", () => {
    leaveCurrent(socket);
    // Drop stale sockets from queue.
    while (waiting.length && (!io.sockets.sockets.has(waiting[0]) || waiting[0] === socket.id)) waiting.shift();
    const opponentId = waiting.shift();
    if (opponentId && io.sockets.sockets.has(opponentId)) {
      const code = makeCode();
      const players = [opponentId, socket.id].map(id => ({ ...publicPlayer(id), reps: 0, ready: false }));
      const room = { code, mode: "global", status: "waiting", duration: 40, timeLeft: 40, players, createdAt: Date.now() };
      rooms.set(code, room);
      [opponentId, socket.id].forEach(id => {
        const s = io.sockets.sockets.get(id);
        s.join(code); s.data.roomCode = code;
        s.emit("match-found", { room });
      });
      emitRoom(code);
    } else {
      waiting.push(socket.id);
      socket.emit("queue-status", { queued: true, message: "Searching for an opponent…" });
    }
  });

  socket.on("cancel-search", () => {
    const i = waiting.indexOf(socket.id);
    if (i >= 0) waiting.splice(i, 1);
    socket.emit("queue-status", { queued: false, message: "Search cancelled." });
  });

  socket.on("create-room", () => {
    leaveCurrent(socket);
    const code = makeCode();
    const room = { code, mode: "private", status: "waiting", duration: 40, timeLeft: 40, players: [{ ...publicPlayer(socket.id), reps: 0, ready: false }], createdAt: Date.now() };
    rooms.set(code, room);
    socket.join(code); socket.data.roomCode = code;
    socket.emit("room-created", { room });
    emitRoom(code);
  });

  socket.on("join-room", rawCode => {
    const code = String(rawCode || "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 5);
    const room = rooms.get(code);
    if (!room) return socket.emit("room-error", { message: "Room not found. Check the code and try again." });
    if (room.players.some(p => p.id === socket.id)) return socket.emit("room-created", { room });
    if (room.players.length >= 2) return socket.emit("room-error", { message: "This room is full." });
    if (room.status === "playing") return socket.emit("room-error", { message: "This match has already started." });
    leaveCurrent(socket);
    room.players.push({ ...publicPlayer(socket.id), reps: 0, ready: false });
    socket.join(code); socket.data.roomCode = code;
    socket.emit("room-joined", { room });
    emitRoom(code);
  });

  socket.on("player-ready", () => {
    const code = socket.data.roomCode, room = rooms.get(code);
    if (!room || room.players.length !== 2) return socket.emit("room-error", { message: "Waiting for an opponent to join." });
    const p = room.players.find(p => p.id === socket.id);
    if (p) p.ready = true;
    if (room.players.every(p => p.ready)) {
      room.status = "playing"; room.startedAt = Date.now(); room.timeLeft = room.duration;
      io.to(code).emit("match-started", { room });
      emitRoom(code);
    } else {
      socket.emit("ready-status", { message: "Ready! Waiting for your opponent…" });
      emitRoom(code);
    }
  });

  socket.on("rep-update", data => {
    const code = socket.data.roomCode, room = rooms.get(code);
    if (!room || room.status !== "playing") return;
    const p = room.players.find(p => p.id === socket.id);
    if (!p) return;
    const reps = Number(data?.reps);
    if (!Number.isFinite(reps)) return;
    // Monotonic counter, bounded to discourage accidental runaway values.
    p.reps = Math.max(p.reps || 0, Math.min(500, Math.floor(reps)));
    io.to(code).emit("score-update", { players: room.players.map(x => ({ id: x.id, reps: x.reps })), by: socket.id });
  });

  socket.on("match-finished", () => {
    const code = socket.data.roomCode, room = rooms.get(code);
    if (!room || room.status !== "playing") return;
    room.status = "finished";
    io.to(code).emit("match-finished", { room });
    emitRoom(code);
  });

  socket.on("leave-room", () => leaveCurrent(socket));
  socket.on("disconnect", () => {
    const i = waiting.indexOf(socket.id);
    if (i >= 0) waiting.splice(i, 1);
    leaveCurrent(socket);
    playerState.delete(socket.id);
  });
});

server.listen(PORT, () => console.log(`FitClash 1v1 running at http://localhost:${PORT}`));
