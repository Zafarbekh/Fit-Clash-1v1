const socket = io();

// --- 1. KO'P TILLILIK LUG'ATI (MULTILINGUAL DICTIONARY) ---
const translations = {
  uz: {
    heroBadge: "⚡ AI-POWERED 1V1 FITNESS ARENA",
    heroTitle: "REAL-VAQTDA BELLASHING. REPOKLARNI ENGLANG.",
    heroSub: "Kompyuter ko'rishi (AI Computer Vision) orqali harakatlaringizni aniq sanaydi. Do'stlaringiz yoki dunyo bo'ylab raqiblar bilan 1v1 multiplayer jang qiling!",
    playNow: "O'YINGA KIRISH 🚀",
    feat1Title: "Aniq AI Sanagich",
    feat1Desc: "MediaPipe Pose Detection orqali otjimaniya va o'tirib-turish harakatlarini avtomatik o'qiydi.",
    feat2Title: "1v1 Multiplayer",
    feat2Desc: "Global matchmaking yoki maxsus xona kodlari orqali do'stlar bilan bellashing.",
    feat3Title: "XP va Level Tizimi",
    feat3Desc: "Har bir g'alaba uchun XP to'plang, darajangizni oshiring va yetakchilar safidan joy oling.",
    registerTitle: "PROFIL YARATISH",
    registerSub: "Arenaga kirish uchun ma'lumotlaringizni kiriting",
    lblName: "ISM / NICKNAME",
    lblAge: "YOSH",
    lblCountry: "DAVLAT",
    btnStart: "ARENAGA O'TISH 🔥",
    btnCancel: "Orqaga",
    statsTitle: "FAOLIYAT STATISTIKASI",
    statWins: "G'ALABALAR",
    statDraws: "DURRANG",
    statLosses: "MAG'LUBIYAT",
    statTotalHp: "HP / REPOK",
    selectModeTitle: "O'YIN REJIMINI TANLANG",
    pushupDesc: "Otjimaniya qilish bo'yicha 1v1 bellashuv",
    squatDesc: "O'tirib-turish bo'yicha 1v1 bellashuv",
    btnGlobalMatch: "⚔️ GLOBAL MATCHMAKING",
    btnCancelSearch: "Qidiruvni bekor qilish",
    btnCreateRoom: "＋ Xona yaratish",
    btnJoinRoom: "Kirish",
    roomCodeLbl: "XONA KODI:",
    btnCopy: "KODNI NUSXALASH",
    validReps: "MUVAFFAQIYATLI",
    camPromptTitle: "KAMERANI ULANG",
    camPromptDesc: "Tanangiz va harakatlaringiz ko'rinishi uchun kameraga to'liq ko'rinib turing.",
    btnEnableCam: "KAMERANI YOQISH",
    btnReady: "TAYYORMAN / START",
    btnLeave: "BELLASHUVNI TARK ETISH",
    matchComplete: "BELLASHUV YAKUNLANDI",
    btnBackLobby: "LOBBYGA QAYTISH"
  },
  ru: {
    heroBadge: "⚡ AI-POWERED 1V1 FITNESS ARENA",
    heroTitle: "CОРЕВНУЙТЕСЬ В РЕАЛЬНОМ ВРЕМЕНИ.",
    heroSub: "Искусственный интеллект точно считает ваши отжимания и приседания. Сражайтесь 1 на 1 с друзьями или игроками со всего мира!",
    playNow: "ВОЙТИ В ИГРУ 🚀",
    feat1Title: "Точный ИИ-счетчик",
    feat1Desc: "MediaPipe автоматически определяет отжимания и приседания.",
    feat2Title: "1v1 Мультиплеер",
    feat2Desc: "Global matchmaking или приватные комнаты для соревнований.",
    feat3Title: "Система XP и уровней",
    feat3Desc: "Зарабатывайте XP за победы, повышайте уровень и побеждайте!",
    registerTitle: "СОЗДАНИЕ ПРОФИЛЯ",
    registerSub: "Введите данные для входа на арену",
    lblName: "ИМЯ / НИКНЕЙМ",
    lblAge: "ВОЗРАСТ",
    lblCountry: "СТРАНА",
    btnStart: "НА АРЕНУ 🔥",
    btnCancel: "Назад",
    statsTitle: "СТАТИСТИКА АКТИВНОСТИ",
    statWins: "ПОБЕДЫ",
    statDraws: "НИЧЬИ",
    statLosses: "ПОРАЖЕНИЯ",
    statTotalHp: "HP / REPOK",
    selectModeTitle: "ВЫБЕРИТЕ РЕЖИМ ИГРЫ",
    pushupDesc: "Соревнование 1v1 по отжиманиям",
    squatDesc: "Соревнование 1v1 по приседаниям",
    btnGlobalMatch: "⚔️ ГЛОБАЛЬНЫЙ МАТЧМЕЙКИНГ",
    btnCancelSearch: "Отменить поиск",
    btnCreateRoom: "＋ Создать комнату",
    btnJoinRoom: "Войти",
    roomCodeLbl: "КОД КОМНАТЫ:",
    btnCopy: "СКОПИРОВАТЬ КОД",
    validReps: "УСПЕШНО",
    camPromptTitle: "ПОДКЛЮЧИТЕ КАМЕРУ",
    camPromptDesc: "Встаньте перед камерой так, чтобы тело было полностью видно.",
    btnEnableCam: "ВКЛЮЧИТЬ КАМЕРУ",
    btnReady: "ГОТОВ / СТАРТ",
    btnLeave: "ПОКИНУТЬ МАТЧ",
    matchComplete: "МАТЧ ЗАВЕРШЕН",
    btnBackLobby: "В ЛОББИ"
  },
  en: {
    heroBadge: "⚡ AI-POWERED 1V1 FITNESS ARENA",
    heroTitle: "COMPETE IN REAL-TIME. DOMINATE REPS.",
    heroSub: "Computer vision tracks your movements accurately. Battle 1v1 with friends or players worldwide!",
    playNow: "PLAY NOW 🚀",
    feat1Title: "Accurate AI Counter",
    feat1Desc: "MediaPipe Pose Detection automatically counts push-ups & squats.",
    feat2Title: "1v1 Multiplayer",
    feat2Desc: "Compete globally via matchmaking or custom private room codes.",
    feat3Title: "XP & Level System",
    feat3Desc: "Earn XP for victories, level up your profile, and conquer the leaderboard.",
    registerTitle: "CREATE PROFILE",
    registerSub: "Enter your details to enter the arena",
    lblName: "NAME / NICKNAME",
    lblAge: "AGE",
    lblCountry: "COUNTRY",
    btnStart: "ENTER ARENA 🔥",
    btnCancel: "Back",
    statsTitle: "ACTIVITY STATS",
    statWins: "WINS",
    statDraws: "DRAWS",
    statLosses: "LOSSES",
    statTotalHp: "HP / REPOK",
    selectModeTitle: "SELECT GAME MODE",
    pushupDesc: "1v1 Push-up battle competition",
    squatDesc: "1v1 Squat battle competition",
    btnGlobalMatch: "⚔️ GLOBAL MATCHMAKING",
    btnCancelSearch: "Cancel search",
    btnCreateRoom: "＋ Create room",
    btnJoinRoom: "Join",
    roomCodeLbl: "ROOM CODE:",
    btnCopy: "COPY CODE",
    validReps: "SUCCESSFUL",
    camPromptTitle: "CONNECT CAMERA",
    camPromptDesc: "Position yourself so your body is fully visible to the camera.",
    btnEnableCam: "ENABLE CAMERA",
    btnReady: "READY / START",
    btnLeave: "LEAVE MATCH",
    matchComplete: "MATCH COMPLETE",
    btnBackLobby: "BACK TO LOBBY"
  }
};

let selectedLang = localStorage.getItem('fit_lang') || 'uz';

function changeLanguage(lang) {
  selectedLang = lang;
  localStorage.setItem('fit_lang', lang);
  
  document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
  const activeBtn = Array.from(document.querySelectorAll('.lang-btn')).find(b => b.innerText.toLowerCase().includes(lang));
  if (activeBtn) activeBtn.classList.add('active');

  const dict = translations[lang];
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) el.innerText = dict[key];
  });
}

// --- 2. FOYDALANUVCHI PROFILI & LOCALSTORAGE ---
let userProfile = JSON.parse(localStorage.getItem('fit_user')) || null;
let currentSelectedMode = 'pushup'; // 'pushup' yoki 'squat'

window.addEventListener('DOMContentLoaded', () => {
  changeLanguage(selectedLang);

  if (userProfile) {
    // Agar foydalanuvchi mavjud bo'lsa, to'g'ridan-to'g'ri Dashboard'ga o'tamiz
    document.getElementById('landingPage').classList.add('hidden');
    document.getElementById('appContainer').classList.remove('hidden');
    initUserProfile();
  }

  // Modal / Auth Tugmalari
  document.getElementById('openAuthBtn').addEventListener('click', () => {
    document.getElementById('authModal').classList.remove('hidden');
  });

  document.getElementById('closeAuthBtn').addEventListener('click', () => {
    document.getElementById('authModal').classList.add('hidden');
  });

  document.getElementById('saveProfileBtn').addEventListener('click', () => {
    const name = document.getElementById('regName').value.trim() || "Fighter";
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

// --- 3. SOCKET MULTIPLAYER & MATCHMAKING ---
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
  socket.emit('find-match', { mode: currentSelectedMode });
  document.getElementById('findMatchBtn').disabled = true;
  document.getElementById('cancelSearchBtn').disabled = false;
});

document.getElementById('cancelSearchBtn').addEventListener('click', () => {
  socket.emit('cancel-search');
  document.getElementById('findMatchBtn').disabled = false;
  document.getElementById('cancelSearchBtn').disabled = true;
});

document.getElementById('createRoomBtn').addEventListener('click', () => {
  socket.emit('create-room', { mode: currentSelectedMode });
});

document.getElementById('joinRoomBtn').addEventListener('click', () => {
  const code = document.getElementById('roomCodeInput').value;
  socket.emit('join-room', code);
});

document.getElementById('readyBtn').addEventListener('click', () => {
  socket.emit('player-ready');
});

document.getElementById('leaveRoomBtn').addEventListener('click', () => {
  socket.emit('leave-room');
  resetMatchUI();
});

socket.on('queue-status', d => showToast(d.message));
socket.on('match-found', d => setupRoomUI(d.room));
socket.on('room-created', d => {
  setupRoomUI(d.room);
  document.getElementById('roomBanner').classList.remove('hidden');
  document.getElementById('roomCodeDisplay').innerText = d.room.code;
});
socket.on('room-joined', d => setupRoomUI(d.room));
socket.on('room-state', d => updateRoomState(d));

socket.on('match-started', d => {
  isPlaying = true;
  matchStatus.innerText = "FIGHT!";
  document.getElementById('readyBtn').disabled = true;
  showToast("O'yin boshlandi! Mashqni bajaring!");
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
  showMatchResult(d.room);
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

function resetMatchUI() {
  isPlaying = false;
  currentReps = 0;
  document.getElementById('repCounter').innerText = "00";
  yourScore.innerText = "00";
  enemyScore.innerText = "00";
  document.getElementById('arenaSection').classList.add('hidden');
  document.getElementById('lobbySection').classList.remove('hidden');
  document.getElementById('findMatchBtn').disabled = false;
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

  let earnedXp = 0;
  if (!opponent || me.reps > oppReps) {
    resultTitle.innerText = "VICTORY 🏆";
    userProfile.wins++;
    earnedXp = 50;
    resultText.innerText = `Ajoyib g'alaba! +50 XP qo'shildi. Natija: ${me.reps} ta`;
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
  const neededXp = userProfile.level * 100;
  if (userProfile.xp >= neededXp) {
    userProfile.xp -= neededXp;
    userProfile.level++;
    showToast(`🎉 TABRIKLAYMIZ! Siz ${userProfile.level}-LEVELGA ERISHTINGIZ!`);
  }
  updateStatsUI();
}

document.getElementById('resultCloseBtn').addEventListener('click', () => {
  document.getElementById('resultModal').classList.add('hidden');
  resetMatchUI();
});

// --- 4. MEDIA-PIPE AI POSE DETECT & COUNTING LOGIC ---
const pose = new Pose({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
});

pose.setOptions({
  modelComplexity: 1,
  smoothLandmarks: true,
  minDetectionConfidence: 0.45,
  minTrackingConfidence: 0.45
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
let minTrackValue = 999;

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
      // --- PUSH-UP LOGIC (OTJIMANIYA) ---
      // Tirsak burchagi va yelka harakatining birgalikdagi aniq tahlili
      const rShoulder = landmarks[12], rElbow = landmarks[14], rWrist = landmarks[16];
      const lShoulder = landmarks[11], lElbow = landmarks[13], lWrist = landmarks[15];

      let angle = null;
      if (rShoulder && rElbow && rWrist) angle = calculateAngle(rShoulder, rElbow, rWrist);
      else if (lShoulder && lElbow && lWrist) angle = calculateAngle(lShoulder, lElbow, lWrist);

      if (angle !== null) {
        document.getElementById('confidence').innerText = `FORM: ${Math.round(angle)}°`;

        if (angle > 145) {
          exerciseStage = "up";
        }
        if (angle < 105 && exerciseStage === "up") {
          exerciseStage = "down";
        }
        if (angle > 145 && exerciseStage === "down") {
          exerciseStage = "up";
          currentReps++;
          document.getElementById('repCounter').innerText = String(currentReps).padStart(2, '0');

          if (isPlaying) socket.emit('rep-update', { reps: currentReps });
        }
      }
    } else if (currentSelectedMode === 'squat') {
      // --- SQUAT LOGIC (O'TIRIB-TURISH) ---
      // Chanoq/Tizza burchaklari (12-Yelka, 24-Chanoq, 26-Tizza)
      const hip = landmarks[24], knee = landmarks[26], ankle = landmarks[28];

      if (hip && knee && ankle) {
        const squatAngle = calculateAngle(hip, knee, ankle);
        document.getElementById('confidence').innerText = `SQUAT: ${Math.round(squatAngle)}°`;

        if (squatAngle > 155) {
          exerciseStage = "up";
        }
        if (squatAngle < 100 && exerciseStage === "up") {
          exerciseStage = "down";
        }
        if (squatAngle > 155 && exerciseStage === "down") {
          exerciseStage = "up";
          currentReps++;
          document.getElementById('repCounter').innerText = String(currentReps).padStart(2, '0');

          if (isPlaying) socket.emit('rep-update', { reps: currentReps });
        }
      }
    }
  } else {
    document.getElementById('poseState').innerText = "TANA QIDIRILMOQDA...";
    document.getElementById('confidence').innerText = "FORM: —";
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
