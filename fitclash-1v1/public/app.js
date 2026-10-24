// MediaPipe Pose modelini sozlash
const pose = new Pose({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
  }
});

pose.setOptions({
  modelComplexity: 1,
  smoothLandmarks: true,
  enableSegmentation: false,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});

// AI natijalarini qabul qilish
pose.onResults((results) => {
  const poseState = document.getElementById('poseState');
  const confidence = document.getElementById('confidence');

  if (results.poseLandmarks) {
    if (poseState) poseState.innerText = "TANA ANIQLANDI ✅";
    if (confidence) confidence.innerText = "FORM: READY";
  } else {
    if (poseState) poseState.innerText = "TANA QIDIRILMOQDA...";
    if (confidence) confidence.innerText = "FORM: —";
  }
});

// Kamerani ishga tushirish funksiyasi (Standard getUserMedia usuli)
async function initCamera() {
  const videoElement = document.getElementById('video');
  const cameraPrompt = document.getElementById('cameraPrompt');
  const stopCameraBtn = document.getElementById('stopCamera');
  const startCameraBtn = document.getElementById('startCamera');
  const aiPill = document.getElementById('aiPill');

  if (!videoElement) {
    console.error("Video elementi topilmadi!");
    return;
  }

  try {
    // Brauzer orqali to'g'ridan-to'g'ri kamera oqimini olish
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 640, height: 480 }
    });

    videoElement.srcObject = stream;
    await videoElement.play();

    // Har bir kadrni AI ga uzluksiz yuborish sikli
    async function predictionLoop() {
      if (videoElement.readyState >= 2) {
        await pose.send({ image: videoElement });
      }
      requestAnimationFrame(predictionLoop);
    }
    predictionLoop();

    console.log("Kamera va MediaPipe AI muvaffaqiyatli ishga tushdi!");

    // Ekranda elementlarni boshqarish
    if (cameraPrompt) cameraPrompt.style.display = 'none';
    if (stopCameraBtn) stopCameraBtn.disabled = false;
    if (startCameraBtn) startCameraBtn.disabled = true;
    if (aiPill) {
      aiPill.innerText = "AI ACTIVE";
      aiPill.classList.add("active");
    }

  } catch (err) {
    console.error("Kamerani ulashda xatolik yuz berdi:", err);
    alert("Kamerani yoqishda xatolik: " + err.message);
  }
}

// Sahifa yuklangandan so'ng tugmalarga hodisalarni bog'lash
document.addEventListener('DOMContentLoaded', () => {
  const enableCamBtn1 = document.getElementById('enableCamera');
  const enableCamBtn2 = document.getElementById('startCamera');

  if (enableCamBtn1) {
    enableCamBtn1.addEventListener('click', initCamera);
  }

  if (enableCamBtn2) {
    enableCamBtn2.addEventListener('click', initCamera);
  }
});