// Socket.io ulanishi
const socket = io();

// UI elementlari
const onlineDot = document.getElementById('onlineDot');
const connectionText = document.getElementById('connectionText');
const repCounter = document.getElementById('repCounter');
const poseState = document.getElementById('poseState');
const confidence = document.getElementById('confidence');
const timerEl = document.getElementById('timer');
const matchStatus = document.getElementById('matchStatus');
const yourScore = document.getElementById('yourScore');
const enemyScore = document.getElementById('enemyScore');
const blueBar = document.getElementById('blueBar');
const redBar = document.getElementById('redBar');
const yourRepsText = document.getElementById('yourRepsText');
const enemyRepsText = document.getElementById('enemyRepsText');

let currentReps = 0;
let pushupStage = "up";
let isPlaying = false;

// Socket ulanish holati
socket.on('connect', () => {
  onlineDot.parentElement.classList.add('online');
  connectionText.innerText = "ONLINE";
});

socket.on('disconnect', () => {
  onlineDot.parentElement.classList.remove('online');
  connectionText.innerText = "OFFLINE";
});

// Profilni saqlash
document.getElementById('saveProfile').addEventListener('click', () => {
  const name = document.getElementById('playerName').value;
  const country = document.getElementById('country').value;
  socket.emit('set-profile', { name, country });
  showToast("Profil saqlandi!");
});

// Matching tugmalari
document.getElementById('findMatch').addEventListener('click', () => {
  socket.emit('find-match');
  document.getElementById('findMatch').disabled = true;
  document.getElementById('cancelSearch').disabled = false;
});

document.getElementById('cancelSearch').addEventListener('click', () => {
  socket.emit('cancel-search');
  document.getElementById('findMatch').disabled = false;
  document.getElementById('cancelSearch').disabled = true;
});

document.getElementById('createRoom').addEventListener('click', () => {
  socket.emit('create-room');
});

document.getElementById('joinRoom').addEventListener('click', () => {
  const code = document.getElementById('roomCode').value;
  socket.emit('join-room', code);
});

document.getElementById('readyBtn').addEventListener('click', () => {
  socket.emit('player-ready');
});

document.getElementById('leaveRoom').addEventListener('click', () => {
  socket.emit('leave-room');
  resetMatchUI();
});

// Xona va o'yin eventlari
socket.on('queue-status', (data) => {
  showToast(data.message);
});

socket.on('match-found', (data) => {
  setupRoomUI(data.room);
});

socket.on('room-created', (data) => {
  setupRoomUI(data.room);
  document.getElementById('roomBanner').classList.remove('hidden');
  document.getElementById('roomCodeDisplay').innerText = data.room.code;
});

socket.on('room-joined', (data) => {
  setupRoomUI(data.room);
});

socket.on('room-state', (data) => {
  updateRoomState(data);
});

socket.on('match-started', (data) => {
  isPlaying = true;
  matchStatus.innerText = "FIGHT!";
  document.getElementById('readyBtn').disabled = true;
  showToast("O'yin boshlandi! Otjimaniya qiling!");
  startTimer(data.room.duration);
});

socket.on('score-update', (data) => {
  data.players.forEach(p => {
    if (p.id === socket.id) {
      yourScore.innerText = String(p.reps).padStart(2, '0');
      yourRepsText.innerText = `${p.reps} reps`;
    } else {
      enemyScore.innerText = String(p.reps).padStart(2, '0');
      enemyRepsText.innerText = `${p.reps} reps`;
    }
  });
});

socket.on('match-finished', (data) => {
  isPlaying = false;
  matchStatus.innerText = "FINISHED";
  showMatchResult(data.room);
});

socket.on('player-left', (data) => {
  showToast(data.message);
  resetMatchUI();
});

socket.on('room-error', (data) => {
  alert(data.message);
});

function setupRoomUI(room) {
  document.getElementById('readyBtn').disabled = false;
  document.getElementById('leaveRoom').disabled = false;
  document.getElementById('roomBanner').classList.remove('hidden');
  document.getElementById('roomCodeDisplay').innerText = room.code;
  updateRoomState(room);
}

function updateRoomState(room) {
  const opponent = room.players.find(p => p.id !== socket.id);
  if (opponent) {
    document.getElementById('enemyName').innerText = opponent.name;
    document.getElementById('enemyCountry').innerText = `${opponent.country} OPPONENT`;
  }
}

function resetMatchUI() {
  isPlaying = false;
  currentReps = 0;
  repCounter.innerText = "00";
  yourScore.innerText = "00";
  enemyScore.innerText = "00";
  document.getElementById('readyBtn').disabled = true;
  document.getElementById('leaveRoom').disabled = true;
  document.getElementById('roomBanner').classList.add('hidden');
  matchStatus.innerText = "LOBBY";
}

function startTimer(duration) {
  let timeLeft = duration;
  timerEl.innerText = timeLeft;
  const interval = setInterval(() => {
    timeLeft--;
    timerEl.innerText = timeLeft;
    if (timeLeft <= 0) {
      clearInterval(interval);
      if (isPlaying) {
        socket.emit('match-finished');
      }
    }
  }, 1000);
}

function showMatchResult(room) {
  const modal = document.getElementById('resultModal');
  const resultTitle = document.getElementById('resultTitle');
  const resultText = document.getElementById('resultText');
  
  modal.classList.remove('hidden');
  const me = room.players.find(p => p.id === socket.id);
  const opponent = room.players.find(p => p.id !== socket.id);
  
  if (!opponent || me.reps > (opponent.reps || 0)) {
    resultTitle.innerText = "VICTORY 🏆";
    resultText.innerText = `Siz g'alaba qozondingiz! Jami natija: ${me.reps} ta otjimaniya.`;
  } else if (me.reps < opponent.reps) {
    resultTitle.innerText = "DEFEAT ❌";
    resultText.innerText = `Raqib g'alaba qozondi. Sizning natija: ${me.reps}, Raqib: ${opponent.reps}`;
  } else {
    resultTitle.innerText = "DRAW 筹";
    resultText.innerText = `Durrang! Ikkingiz ham ${me.reps} tadan qildingiz.`;
  }
}

document.getElementById('resultClose').addEventListener('click', () => {
  document.getElementById('resultModal').classList.add('hidden');
  resetMatchUI();
});

// --- MEDIA-PIPE POSE & SMART REP COUNTING ---

const pose = new Pose({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
});

pose.setOptions({
  modelComplexity: 1,
  smoothLandmarks: true,
  enableSegmentation: false,
  minDetectionConfidence: 0.4,
  minTrackingConfidence: 0.4
});

const canvasElement = document.getElementById('overlay');
const canvasCtx = canvasElement ? canvasElement.getContext('2d') : null;

let minY = 999; // Eng yuqori nuqta (tik turgandagi holat)
let maxY = 0;   // Eng pastki nuqta (otjimaniya qilgandagi holat)

pose.onResults((results) => {
  if (!canvasCtx || !canvasElement) return;
  
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

  if (results.poseLandmarks) {
    poseState.innerText = "TANA ANIQLANDI ✅";
    
    drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, {color: '#31e7ff', lineWidth: 3});
    drawLandmarks(canvasCtx, results.poseLandmarks, {color: '#ff3f64', radius: 4});

    const landmarks = results.poseLandmarks;
    const shoulderY = (landmarks[11].y + landmarks[12].y) / 2;

    confidence.innerText = `Y: ${shoulderY.toFixed(2)}`;

    // Dinamik ravishda eng yuqori va pastki nuqtalarni topib boramiz
    if (shoulderY < minY) minY = shoulderY;
    if (shoulderY > maxY) maxY = shoulderY;

    // Oraliq (amplitude) yetarlicha bo'lsa (masalan, 0.08 qadam)
    const threshold = 0.07;

    if (shoulderY > minY + threshold) {
      pushupStage = "down"; // Pastga tushdi
    }
    
    if (shoulderY < minY + threshold * 0.4 && pushupStage === "down") {
      pushupStage = "up"; // Qaytadan tepaga chiqdi -> 1 ta sanaymiz!
      currentReps++;
      repCounter.innerText = String(currentReps).padStart(2, '0');
      
      // Har safar bitta tugagach, maxY ni qaytadan nolga tenglaymiz
      maxY = minY;

      if (isPlaying) {
        socket.emit('rep-update', { reps: currentReps });
      }
    }

  } else {
    poseState.innerText = "TANA QIDIRILMOQDA...";
    confidence.innerText = "FORM: —";
  }
  canvasCtx.restore();
});

// Kamerani ishga tushirish
async function initCamera() {
  const videoElement = document.getElementById('video');
  const cameraPrompt = document.getElementById('cameraPrompt');
  
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 640, height: 480 }
    });
    videoElement.srcObject = stream;
    await videoElement.play();

    canvasElement.width = videoElement.videoWidth || 640;
    canvasElement.height = videoElement.videoHeight || 480;

    async function predictionLoop() {
      if (videoElement.readyState >= 2) {
        await pose.send({ image: videoElement });
      }
      requestAnimationFrame(predictionLoop);
    }
    predictionLoop();

    if (cameraPrompt) cameraPrompt.style.display = 'none';
    document.getElementById('stopCamera').disabled = false;
    document.getElementById('startCamera').disabled = true;
    document.getElementById('aiPill').innerText = "AI ACTIVE";
    document.getElementById('aiPill').classList.add("active");
  } catch (err) {
    alert("Kamerani ochishda xatolik: " + err.message);
  }
}

document.getElementById('enableCamera').addEventListener('click', initCamera);
document.getElementById('startCamera').addEventListener('click', initCamera);
document.getElementById('resetReps').addEventListener('click', () => {
  currentReps = 0;
  repCounter.innerText = "00";
  minY = 999;
  maxY = 0;
});

function showToast(text) {
  const toast = document.getElementById('toast');
  toast.innerText = text;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}
