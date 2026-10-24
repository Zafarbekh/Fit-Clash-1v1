const socket = io();

// --- 1. PROFIl VA LOCALSTORAGE ---
let userProfile = JSON.parse(localStorage.getItem('fit_user')) || null;
let currentSelectedMode = 'pushup'; // 'pushup' yoki 'squat'
let matchDuration = 40; // Standart vaqt (soniyada)
let isSoloMode = false;

window.addEventListener('DOMContentLoaded', () => {
  if (userProfile) {
    document.getElementById('landingPage').classList.add('hidden');
    document.getElementById('appContainer').classList.remove('hidden');
    initUserProfile();
  }

  document.getElementById('openAuthBtn').addEventListener('click', () => {
    document.getElementById('authModal').classList.remove('hidden');
  });

  document.getElementById('closeAuthBtn').addEventListener('click', () => {
    document.getElementById('authModal').classList.add('hidden');
  });

  document.getElementById('saveProfileBtn').addEventListener('click', () => {
    const name = document.getElementById('regName').value.trim() || "CyberFighter";
    const age = document.getElementById('regAge').value || 18;
    const country = document.getElementById('regCountry').value;

    userProfile = {
      name, age, country,
      level: 1, xp: 0,
      wins: 0, draws: 0, losses: 0
    };

    localStorage.setItem('fit_user', JSON.stringify(userProfile));
    document.getElementById('authModal').classList.add('hidden');
    document.getElementById('landingPage').classList.add('hidden');
    document.getElementById('appContainer').classList.remove('hidden');
    initUserProfile();
  });

  document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('fit_user');
    location.reload();
  });
});

function initUserProfile() {
  socket.emit('set-profile', { name: userProfile.name, country: userProfile.country });
  
  document.getElementById('navUserName').innerText = userProfile.name;
  document.getElementById('dashUserName').innerText = userProfile.name;
  document.getElementById('dashUserMeta').innerText = `${userProfile.country} · ${userProfile.age} yosh`;
  document.getElementById('youName').innerText = userProfile.name;
  document.getElementById('youCountry').innerText = `${userProfile.country} YOU`;
  
  updateStatsUI();
}

function updateStatsUI() {
  document.getElementById('navUserLevel').innerText = `LVL ${userProfile.level}`;
  document.getElementById('dashLevelTitle').innerText = `LEVEL ${userProfile.level}`;
  document.getElementById('statWinsVal').innerText = userProfile.wins;
  document.getElementById('statDrawsVal').innerText = userProfile.draws;
  document.getElementById('statLossesVal').innerText = userProfile.losses;
  document.getElementById('statHpVal').innerText = userProfile.xp;

  const xpNeeded = userProfile.level * 100;
  const pct = Math.min(100, (userProfile.xp / xpNeeded) * 100);
  document.getElementById('dashXpText').innerText = `${userProfile.xp} / ${xpNeeded} XP`;
  document.getElementById('dashXpFill').style.width = `${pct}%`;

  localStorage.setItem('fit_user', JSON.stringify(userProfile));
}

function selectGameMode(mode) {
  currentSelectedMode = mode;
  document.getElementById('modePushup').classList.toggle('active', mode === 'pushup');
  document.getElementById('modeSquat').classList.toggle('active', mode === 'squat');
  document.getElementById('currentModeBadge').innerText = `MODE: ${mode.toUpperCase()}`;
}

function setDuration(sec) {
  matchDuration = sec;
  document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');
}

// --- 2. MULTIPLAYER VA SOLO MASHQ BOSHQARUVI ---
const onlineDot = document.getElementById('onlineDot');
const connectionText = document.getElementById('connectionText');
const timerEl = document.getElementById('timer');
const matchStatus = document.getElementById('matchStatus');
const yourScore = document.getElementById('yourScore');
const enemyScore = document.getElementById('enemyScore');

let isPlaying = false;

socket.on('connect', () => {
  onlineDot.parentElement.classList.add('online');
  connectionText.innerText = "ONLINE";
});
socket.on('disconnect', () => {
  onlineDot.parentElement.classList.remove('online');
  connectionText.innerText = "OFFLINE";
});

document.getElementById('findMatchBtn').addEventListener('click', () => {
  isSoloMode = false;
  socket.emit('find-match', { mode: currentSelectedMode });
  document.getElementById('findMatchBtn').disabled = true;
  document.getElementById('soloTrainingBtn').disabled = true;
  document.getElementById('cancelSearchBtn').disabled = false;
});

// Erkin Mashq qilish (Solo Mode)
document.getElementById('soloTrainingBtn').addEventListener('click', () => {
  isSoloMode = true;
  document.getElementById('lobbySection').classList.add('hidden');
  document.getElementById('arenaSection').classList.remove('hidden');
  document.getElementById('enemyName').innerText = "SOLO TRAINING";
  document.getElementById('enemyCountry').innerText = "🎯 OFFLINE";
  document.getElementById('readyBtn').disabled = false;
  matchStatus.innerText = "SOLO LOBBY";
  showToast("Erkin mashq rejimi ochildi. Tayyor tugmasini bosing!");
});

document.getElementById('cancelSearchBtn').addEventListener('click', () => {
  socket.emit('cancel-search');
  resetMatchUI();
});

document.getElementById('createRoomBtn').addEventListener('click', () => {
  isSoloMode = false;
  socket.emit('create-room', { mode: currentSelectedMode });
});

document.getElementById('joinRoomBtn').addEventListener('click', () => {
  isSoloMode = false;
  const code = document.getElementById('roomCodeInput').value;
  socket.emit('join-room', code);
});

document.getElementById('readyBtn').addEventListener('click', () => {
  if (isSoloMode) {
    startSoloMatch();
  } else {
    socket.emit('player-ready');
  }
});

document.getElementById('leaveRoomBtn').addEventListener('click', () => {
  if (!isSoloMode) socket.emit('leave-room');
  resetMatchUI();
});

socket.on('queue-status', d => showToast(d.message));
socket.on('match-found', d => { isSoloMode = false; setupRoomUI(d.room); });
socket.on('room-created', d => {
  isSoloMode = false;
  setupRoomUI(d.room);
  document.getElementById('roomBanner').classList.remove('hidden');
  document.getElementById('roomCodeDisplay').innerText = d.room.code;
});
socket.on('room-joined', d => { isSoloMode = false; setupRoomUI(d.room); });
socket.on('room-state', d => updateRoomState(d));

socket.on('match-started', d => {
  isPlaying = true;
  matchStatus.innerText = "FIGHT!";
  document.getElementById('readyBtn').disabled = true;
  showToast("O'yin boshlandi! Harakatni boshlang!");
  startTimer(d.room.duration);
});

socket.on('score-update', d => {
  d.players.forEach(p => {
    if (p.id === socket.id) {
      yourScore.innerText = String(p.reps).padStart(2, '0');
    } else {
      enemyScore.innerText = String(p.reps).padStart(2, '0');
    }
  });
});

socket.on('match-finished', d => {
  isPlaying = false;
  matchStatus.innerText = "FINISHED";
  if (!isSoloMode) showMatchResult(d.room);
});

socket.on('player-left', d => { showToast(d.message); resetMatchUI(); });
socket.on('room-error', d => alert(d.message));

function setupRoomUI(room) {
  document.getElementById('lobbySection').classList.add('hidden');
  document.getElementById('arenaSection').classList.remove('hidden');
  document.getElementById('readyBtn').disabled = false;
  updateRoomState(room);
}

function updateRoomState(room) {
  const opponent = room.players.find(p => p.id !== socket.id);
  if (opponent) {
    document.getElementById('enemyName').innerText = opponent.name;
    document.getElementById('enemyCountry').innerText = `${opponent.country} OPPONENT`;
  }
}

function startSoloMatch() {
  isPlaying = true;
  currentReps = 0;
  document.getElementById('repCounter').innerText = "00";
  yourScore.innerText = "00";
  enemyScore.innerText = "00";
  matchStatus.innerText = "TRAINING";
  document.getElementById('readyBtn').disabled = true;
  showToast("Erkin mashq boshlandi!");
  startTimer(matchDuration);
}

function resetMatchUI() {
  isPlaying = false;
  currentReps = 0;
  isSoloMode = false;
  document.getElementById('repCounter').innerText = "00";
  yourScore.innerText = "00";
  enemyScore.innerText = "00";
  document.getElementById('arenaSection').classList.add('hidden');
  document.getElementById('lobbySection').classList.remove('hidden');
  document.getElementById('findMatchBtn').disabled = false;
  document.getElementById('soloTrainingBtn').disabled = false;
  document.getElementById('cancelSearchBtn').disabled = true;
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
        isPlaying = false;
        matchStatus.innerText = "FINISHED";
        if (isSoloMode) {
          showSoloResult();
        } else {
          socket.emit('match-finished');
        }
      }
    }
  }, 1000);
}

function showSoloResult() {
  const modal = document.getElementById('resultModal');
  document.getElementById('resultTitle').innerText = "TRAINING COMPLETE 🎯";
  document.getElementById('resultText').innerText = `Muvaffaqiyatli bajarildi: ${currentReps} ta reps! +20 XP qo'shildi.`;
  modal.classList.remove('hidden');

  userProfile.xp += 20;
  checkLevelUp();
  updateStatsUI();
}

function showMatchResult(room) {
  const modal = document.getElementById('resultModal');
  const resultTitle = document.getElementById('resultTitle');
  const resultText = document.getElementById('resultText');
  modal.classList.remove('hidden');

  const me = room.players.find(p => p.id === socket.id);
  const opponent = room.players.find(p => p.id !== socket.id);
  const oppReps = opponent ? opponent.reps : 0;

  let earnedXp = 0;
  if (!opponent || me.reps > oppReps) {
    resultTitle.innerText = "VICTORY 🏆";
    userProfile.wins++;
    earnedXp = 50;
    resultText.innerText = `G'alaba! +50 XP. Natija: ${me.reps} ta`;
  } else if (me.reps < oppReps) {
    resultTitle.innerText = "DEFEAT ❌";
    userProfile.losses++;
    earnedXp = 10;
    resultText.innerText = `Mag'lubiyat. +10 XP. Siz: ${me.reps}, Raqib: ${oppReps}`;
  } else {
    resultTitle.innerText = "DRAW 🤝";
    userProfile.draws++;
    earnedXp = 25;
    resultText.innerText = `Durrang! +25 XP. Ikkingiz ham ${me.reps} tadan qildingiz.`;
  }

  userProfile.xp += earnedXp;
  checkLevelUp();
  updateStatsUI();
}

function checkLevelUp() {
  const neededXp = userProfile.level * 100;
  if (userProfile.xp >= neededXp) {
    userProfile.xp -= neededXp;
    userProfile.level++;
    showToast(`🎉 TABRIKLAYMIZ! Siz ${userProfile.level}-darajaga chiqdingiz!`);
  }
}

document.getElementById('resultCloseBtn').addEventListener('click', () => {
  document.getElementById('resultModal').classList.add('hidden');
  resetMatchUI();
});

// --- 3. MEDIAPIPE AI POSE & COUNTING LOGIC ---
const pose = new Pose({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
});

pose.setOptions({
  modelComplexity: 1,
  smoothLandmarks: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});

function calculateAngle(a, b, c) {
  let radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs((radians * 180.0) / Math.PI);
  if (angle > 180.0) angle = 360 - angle;
  return angle;
}

const canvasElement = document.getElementById('overlay');
const canvasCtx = canvasElement ? canvasElement.getContext('2d') : null;

let currentReps = 0;
let exerciseStage = "up";

pose.onResults((results) => {
  if (!canvasCtx || !canvasElement) return;

  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

  if (results.poseLandmarks) {
    document.getElementById('poseState').innerText = "TANA ANIQLANDI ✅";

    drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, { color: '#31e7ff', lineWidth: 3 });
    drawLandmarks(canvasCtx, results.poseLandmarks, { color: '#ff3f64', radius: 4 });

    const landmarks = results.poseLandmarks;

    if (currentSelectedMode === 'pushup') {
      // OTJIMANIYA (Push-ups)
      const rShoulder = landmarks[12], rElbow = landmarks[14], rWrist = landmarks[16];
      const lShoulder = landmarks[11], lElbow = landmarks[13], lWrist = landmarks[15];

      let angle = null;
      if (rShoulder && rElbow && rWrist) angle = calculateAngle(rShoulder, rElbow, rWrist);
      else if (lShoulder && lElbow && lWrist) angle = calculateAngle(lShoulder, lElbow, lWrist);

      if (angle !== null) {
        document.getElementById('confidence').innerText = `FORM: ${Math.round(angle)}°`;

        if (angle > 150) {
          exerciseStage = "up";
        }
        if (angle < 100 && exerciseStage === "up") {
          exerciseStage = "down";
        }
        if (angle > 150 && exerciseStage === "down") {
          exerciseStage = "up";
          currentReps++;
          document.getElementById('repCounter').innerText = String(currentReps).padStart(2, '0');

          if (isPlaying && !isSoloMode) socket.emit('rep-update', { reps: currentReps });
        }
      }
    } else if (currentSelectedMode === 'squat') {
      // O'TIRIB-TURISH (Squats)
      const hip = landmarks[24], knee = landmarks[26], ankle = landmarks[28];

      if (hip && knee && ankle) {
        const squatAngle = calculateAngle(hip, knee, ankle);
        document.getElementById('confidence').innerText = `SQUAT: ${Math.round(squatAngle)}°`;

        if (squatAngle > 160) {
          exerciseStage = "up";
        }
        if (squatAngle < 105 && exerciseStage === "up") {
          exerciseStage = "down";
        }
        if (squatAngle > 160 && exerciseStage === "down") {
          exerciseStage = "up";
          currentReps++;
          document.getElementById('repCounter').innerText = String(currentReps).padStart(2, '0');

          if (isPlaying && !isSoloMode) socket.emit('rep-update', { reps: currentReps });
        }
      }
    }
  } else {
    document.getElementById('poseState').innerText = "TANA QIDIRILMOQDA...";
    document.getElementById('confidence').innerText = "FORM: —";
  }

  canvasCtx.restore();
});

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
    document.getElementById('aiPill').innerText = "AI ACTIVE";
    document.getElementById('aiPill').classList.add("active");
  } catch (err) {
    alert("Kamerani ochishda xatolik: " + err.message);
  }
}

document.getElementById('enableCameraBtn').addEventListener('click', initCamera);

function showToast(text) {
  const toast = document.getElementById('toast');
  toast.innerText = text;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}
