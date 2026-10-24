const socket = io();

// Ko'p tillilik lug'ati
const dict = {
  uz: { desc: "AI yordamida otjimaniya bo'yicha 1v1 musobaqa asbobi!", enterName: "Ismingizni kiriting:", enterAge: "Yoshingiz:", selectCountry: "Davlat:", enterArena: "ARENAGA KIRISH 🚀" },
  ru: { desc: "Инструмент для соревнований 1v1 по отжиманиям с ИИ!", enterName: "Введите ваше имя:", enterAge: "Ваш возраст:", selectCountry: "Страна:", enterArena: "ВОЙТИ В АРЕНУ 🚀" },
  en: { desc: "AI-powered 1v1 push-up fitness battle arena!", enterName: "Enter your name:", enterAge: "Your age:", selectCountry: "Country:", enterArena: "ENTER ARENA 🚀" }
};
let currentLang = localStorage.getItem('fit_lang') || 'uz';

function setLang(lang) {
  currentLang = lang;
  localStorage.setItem('fit_lang', lang);
  document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');
  document.querySelector('[data-i18n="desc"]').innerText = dict[lang].desc;
  document.querySelector('[data-i18n="enterName"]').innerText = dict[lang].enterName;
  document.querySelector('[data-i18n="enterAge"]').innerText = dict[lang].enterAge;
  document.querySelector('[data-i18n="selectCountry"]').innerText = dict[lang].selectCountry;
  document.querySelector('[data-i18n="enterArena"]').innerText = dict[lang].enterArena;
}

// Foydalanuvchi ma'lumotlarini LocalStorage'dan olish
let userProfile = JSON.parse(localStorage.getItem('fit_user')) || null;

window.addEventListener('DOMContentLoaded', () => {
  if (userProfile) {
    // Agar oldin kirgan bo'lsa, to'g'ridan-to'g'ri o'yinga o'tish
    document.getElementById('landingScreen').classList.add('hidden');
    document.getElementById('mainApp').classList.remove('hidden');
    initUserProfile();
  }

  document.getElementById('startAppBtn').addEventListener('click', () => {
    const name = document.getElementById('setupName').value.trim() || "Wanderer";
    const age = document.getElementById('setupAge').value || 18;
    const country = document.getElementById('setupCountry').value;

    userProfile = {
      name, age, country,
      hp: 0, wins: 0, draws: 0, losses: 0, level: 1, xp: 0
    };
    localStorage.setItem('fit_user', JSON.stringify(userProfile));

    document.getElementById('landingScreen').classList.add('hidden');
    document.getElementById('mainApp').classList.remove('hidden');
    initUserProfile();
  });

  document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('fit_user');
    location.reload();
  });
});

function initUserProfile() {
  socket.emit('set-profile', { name: userProfile.name, country: userProfile.country });
  document.getElementById('youName').innerText = userProfile.name;
  document.getElementById('youCountry').innerText = `${userProfile.country} YOU`;
  document.getElementById('welcomeUserText').innerText = `Xush kelibsiz, ${userProfile.name}!`;
  updateStatsUI();
}

function updateStatsUI() {
  document.getElementById('userLevel').innerText = String(userProfile.level).padStart(2, '0');
  document.getElementById('statHp').innerText = userProfile.xp; // HP/XP sifatida ko'rsatamiz
  document.getElementById('statWins').innerText = userProfile.wins;
  document.getElementById('statDraws').innerText = userProfile.draws;
  document.getElementById('statLosses').innerText = userProfile.losses;
  document.getElementById('levelTitle').innerText = `LEVEL ${userProfile.level}`;
  
  const xpNeeded = userProfile.level * 100;
  const pct = Math.min(100, (userProfile.xp / xpNeeded) * 100);
  document.getElementById('xpText').innerText = `${userProfile.xp} / ${xpNeeded} XP`;
  document.getElementById('xpBar').style.width = `${pct}%`;
  
  localStorage.setItem('fit_user', JSON.stringify(userProfile));
}

// UI elementlari va Socket hodisalari
const onlineDot = document.getElementById('onlineDot');
const connectionText = document.getElementById('connectionText');
const repCounter = document.getElementById('repCounter');
const poseState = document.getElementById('poseState');
const confidence = document.getElementById('confidence');
const timerEl = document.getElementById('timer');
const matchStatus = document.getElementById('matchStatus');
const yourScore = document.getElementById('yourScore');
const enemyScore = document.getElementById('enemyScore');
const yourRepsText = document.getElementById('yourRepsText');
const enemyRepsText = document.getElementById('enemyRepsText');

let currentReps = 0;
let pushupStage = "up";
let isPlaying = false;

socket.on('connect', () => {
  onlineDot.parentElement.classList.add('online');
  connectionText.innerText = "ONLINE";
});
socket.on('disconnect', () => {
  onlineDot.parentElement.classList.remove('online');
  connectionText.innerText = "OFFLINE";
});

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

document.getElementById('createRoom').addEventListener('click', () => socket.emit('create-room'));
document.getElementById('joinRoom').addEventListener('click', () => socket.emit('join-room', document.getElementById('roomCode').value));
document.getElementById('readyBtn').addEventListener('click', () => socket.emit('player-ready'));
document.getElementById('leaveRoom').addEventListener('click', () => { socket.emit('leave-room'); resetMatchUI(); });

socket.on('queue-status', d => showToast(d.message));
socket.on('match-found', d => setupRoomUI(d.room));
socket.on('room-created', d => { setupRoomUI(d.room); document.getElementById('roomBanner').classList.remove('hidden'); document.getElementById('roomCodeDisplay').innerText = d.room.code; });
socket.on('room-joined', d => setupRoomUI(d.room));
socket.on('room-state', d => updateRoomState(d));

socket.on('match-started', d => {
  isPlaying = true;
  matchStatus.innerText = "FIGHT!";
  document.getElementById('readyBtn').disabled = true;
  showToast("O'yin boshlandi! Otjimaniya qiling!");
  startTimer(d.room.duration);
});

socket.on('score-update', d => {
  d.players.forEach(p => {
    if (p.id === socket.id) {
      yourScore.innerText = String(p.reps).padStart(2, '0');
      yourRepsText.innerText = `${p.reps} reps`;
    } else {
      enemyScore.innerText = String(p.reps).padStart(2, '0');
      enemyRepsText.innerText = `${p.reps} reps`;
    }
  });
});

socket.on('match-finished', d => {
  isPlaying = false;
  matchStatus.innerText = "FINISHED";
  showMatchResult(d.room);
});

socket.on('player-left', d => { showToast(d.message); resetMatchUI(); });
socket.on('room-error', d => alert(d.message));

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
      if (isPlaying) socket.emit('match-finished');
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
  const oppReps = opponent ? opponent.reps : 0;

  // HP va XP hisoblash қоидалари
  let earnedXp = 0;
  if (!opponent || me.reps > oppReps) {
    resultTitle.innerText = "VICTORY 🏆";
    userProfile.wins++;
    earnedXp = 50; // Yutish uchun HP/XP
    resultText.innerText = `G'alaba! +50 HP qo'shildi. Natija: ${me.reps} ta`;
  } else if (me.reps < oppReps) {
    resultTitle.innerText = "DEFEAT ❌";
    userProfile.losses++;
    earnedXp = 10; // Mag'lubiyat uchun ham ozgina
    resultText.innerText = `Mag'lubiyat. +10 HP. Natija: ${me.reps} - ${oppReps}`;
  } else {
    resultTitle.innerText = "DRAW 🤝";
    userProfile.draws++;
    earnedXp = 25; // Durrang uchun
    resultText.innerText = `Durrang! +25 HP. Ikkingiz ham ${me.reps} tadan qildingiz.`;
  }

  userProfile.xp += earnedXp;
  // Level oshish logikasi (har 100 XP da level oshadi)
  const neededXp = userProfile.level * 100;
  if (userProfile.xp >= neededXp) {
    userProfile.xp -= neededXp;
    userProfile.level++;
    showToast(`🎉 Tabriklaymiz! Siz ${userProfile.level}-darajaga chiqdingiz!`);
  }
  updateStatsUI();
}

document.getElementById('resultClose').addEventListener('click', () => {
  document.getElementById('resultModal').classList.add('hidden');
  resetMatchUI();
});

// --- MEDIA-PIPE POSE & COUNTING ---
const pose = new Pose({ locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}` });
pose.setOptions({ modelComplexity: 1, smoothLandmarks: true, minDetectionConfidence: 0.4, minTrackingConfidence: 0.4 });

const canvasElement = document.getElementById('overlay');
const canvasCtx = canvasElement ? canvasElement.getContext('2d') : null;
let minY = 999;

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

    if (shoulderY < minY) minY = shoulderY;
    const threshold = 0.07;

    if (shoulderY > minY + threshold) {
      pushupStage = "down";
    }
    if (shoulderY < minY + threshold * 0.4 && pushupStage === "down") {
      pushupStage = "up";
      currentReps++;
      repCounter.innerText = String(currentReps).padStart(2, '0');
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

async function initCamera() {
  const videoElement = document.getElementById('video');
  const cameraPrompt = document.getElementById('cameraPrompt');
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
    videoElement.srcObject = stream;
    await videoElement.play();
    canvasElement.width = videoElement.videoWidth || 640;
    canvasElement.height = videoElement.videoHeight || 480;

    async function predictionLoop() {
      if (videoElement.readyState >= 2) await pose.send({ image: videoElement });
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
document.getElementById('resetReps').addEventListener('click', () => { currentReps = 0; repCounter.innerText = "00"; minY = 999; });

function showToast(text) {
  const toast = document.getElementById('toast');
  toast.innerText = text;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}
