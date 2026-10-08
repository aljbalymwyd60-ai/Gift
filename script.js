// 1. الانتقال لشاشة البطاقات
function showGifts() {
  document.getElementById('welcome-screen').style.display = 'none';
  document.getElementById('gift-screen').style.display = 'flex';

  // إخفاء وإيقاف خلفية الفيديو (توفير الأداء عند مغادرة الشاشة الأولى)
  const wallpaper = document.getElementById('wallpaper');
  if (wallpaper) {
    wallpaper.classList.add('hidden');
    wallpaper.pause();
  }
}

// 2. حركة الهرب السلسة لزر "لا"
function moveButton() {
  const btn = document.getElementById('no-btn');
  
  if (btn.style.position !== 'fixed') {
    const rect = btn.getBoundingClientRect();
    btn.style.left = `${rect.left}px`;
    btn.style.top = `${rect.top}px`;
    btn.style.position = 'fixed';
    
    requestAnimationFrame(() => {
      calculateAndMove(btn);
    });
  } else {
    calculateAndMove(btn);
  }
}

function calculateAndMove(btn) {
  const padding = 40;

  // نضمن دائماً أن يبقى الزر داخل حدود الشاشة (حتى في الشاشات الضيقة جداً)
  const maxX = Math.max(padding, window.innerWidth - btn.offsetWidth - padding);
  const maxY = Math.max(padding, window.innerHeight - btn.offsetHeight - padding);

  const randomX = padding + Math.random() * (maxX - padding);
  const randomY = padding + Math.random() * (maxY - padding);

  btn.style.left = `${Math.round(randomX)}px`;
  btn.style.top = `${Math.round(randomY)}px`;
}

// 3. النافذة المنبثقة للرسالة
// تعديل دالة فتح الرسالة لتستقبل صورة GIF
function openModal(gifSrc, text) {
  document.getElementById('modal-gif').src = gifSrc;
  document.getElementById('modal-body').innerText = text;
  document.getElementById('modal').style.display = 'flex';
}

function closeModal() {
  document.getElementById('modal').style.display = 'none';
}

// 4. نافذة باقة الورود (الصورة)
function openBouquet() {
  document.getElementById('bouquet-modal').style.display = 'flex';
}

function closeBouquet() {
  document.getElementById('bouquet-modal').style.display = 'none';
}

// 5. تشغيل/إيقاف الموسيقى
let isPlaying = false;
function toggleMusic() {
  const music = document.getElementById('bg-music');
  const btn = document.getElementById('music-btn');
  
  if (isPlaying) {
    music.pause();
    btn.innerHTML = "🎵 Play Song";
  } else {
    music.play();
    btn.innerHTML = "⏸️ Pause";
  }
  isPlaying = !isPlaying;
}

// 6. لوحة رسم الورود (بطاقة الهدية)
let canvas, ctx;
let isDrawing = false;
let currentTool = 'draw';
let lastX = 0;
let lastY = 0;

const flowerColors = ['#ff4d6d', '#ff758f', '#ffb3c1', '#c77dff', '#e0aaff'];
const minDistance = 25;

function openFlowerCanvas() {
  const modal = document.getElementById('flower-modal');
  modal.style.display = 'block';
  
  canvas = document.getElementById('flowerCanvas');
  ctx = canvas.getContext('2d');
  
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  setTool('draw');
  clearCanvas();

  // إعادة ضبط لون الخلفية الافتراضي عند كل فتح
  const picker = document.getElementById('bg-picker');
  if (picker) {
    picker.value = DEFAULT_BG;
    setBgColor(DEFAULT_BG);
    picker.oninput = (e) => setBgColor(e.target.value);
  }

  canvas.onpointerdown = startDrawing;
  canvas.onpointermove = drawOrErase;
  canvas.onpointerup = stopDrawing;
}

function closeFlowerCanvas() {
  document.getElementById('flower-modal').style.display = 'none';
}

function setTool(tool) {
  currentTool = tool;
  
  const drawBtn = document.getElementById('draw-tool-btn');
  const eraseBtn = document.getElementById('erase-tool-btn');
  
  if (drawBtn && eraseBtn) {
    if (tool === 'draw') {
      drawBtn.classList.add('active');
      eraseBtn.classList.remove('active');
      canvas.style.cursor = 'crosshair';
    } else {
      eraseBtn.classList.add('active');
      drawBtn.classList.remove('active');
      canvas.style.cursor = 'cell';
    }
  }
}

function clearCanvas() {
  if (ctx && canvas) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

function startDrawing(e) {
  isDrawing = true;
  const rect = canvas.getBoundingClientRect();
  lastX = e.clientX - rect.left;
  lastY = e.clientY - rect.top;
  
  if (currentTool === 'draw') {
    drawFlowerAt(lastX, lastY);
  } else {
    eraseAt(lastX, lastY);
  }
}

function stopDrawing() {
  isDrawing = false;
}

function drawOrErase(e) {
  if (!isDrawing) return;
  
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  if (currentTool === 'erase') {
    eraseAt(x, y);
  } else {
    const dist = Math.hypot(x - lastX, y - lastY);
    if (dist >= minDistance) {
      drawFlowerAt(x, y);
      lastX = x;
      lastY = y;
    }
  }
}

function eraseAt(x, y) {
  const eraseSize = 40;
  ctx.clearRect(x - eraseSize / 2, y - eraseSize / 2, eraseSize, eraseSize);
}

function drawFlowerAt(x, y) {
  const color = flowerColors[Math.floor(Math.random() * flowerColors.length)];
  const size = Math.random() * 8 + 14;
  drawPetalCluster(x, y, color, size);
}

function drawPetalCluster(x, y, color, size) {
  ctx.save();
  ctx.translate(x, y);
  
  const petals = 5;
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.9;

  for (let i = 0; i < petals; i++) {
    ctx.beginPath();
    ctx.rotate((Math.PI * 2) / petals);
    ctx.ellipse(0, size / 2, size / 3.5, size / 2, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  
  ctx.beginPath();
  ctx.arc(0, 0, size / 4, 0, Math.PI * 2);
  ctx.fillStyle = '#fff3b0';
  ctx.fill();
  
  ctx.restore();
}

// 7. تغيير خلفية اللوحة
const DEFAULT_BG = '#eaf2ff';

function setBgColor(color) {
  const modal = document.getElementById('flower-modal');
  if (modal) {
    modal.style.backgroundColor = color;
  }
}

// 8. القائمة المنسدلة (زر الثلاث نقاط)
function toggleMenu(e) {
  e.stopPropagation();
  const menu = document.getElementById('flower-menu');
  if (menu) menu.classList.toggle('show');
}

window.addEventListener('click', function(e) {
  const menu = document.getElementById('flower-menu');
  if (menu && menu.classList.contains('show')) {
    menu.classList.remove('show');
  }
});

function selectTool(tool) {
  setTool(tool);
  const menu = document.getElementById('flower-menu');
  if (menu) menu.classList.remove('show');
}