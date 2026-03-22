/* ═══════════════════════════════════════════════════════════
   LOCALISATION  (LANG + LANG_META set by i18n.js)
═══════════════════════════════════════════════════════════ */
let currentLang = (() => {
  const saved = localStorage.getItem('appshot_lang');
  if (saved && LANG[saved]) return saved;
  const nav = (navigator.language || 'en').slice(0, 2).toLowerCase();
  return LANG[nav] ? nav : 'en';
})();

function t(key) { return (LANG[currentLang] || LANG.en)[key] || key; }

function applyLang(lang) {
  if (!LANG[lang]) return;
  currentLang = lang;
  localStorage.setItem('appshot_lang', lang);
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-html]').forEach(el => { el.innerHTML = t(el.dataset.i18nHtml); });
  document.querySelectorAll('[data-i18n-ph]').forEach(el => { el.placeholder = t(el.dataset.i18nPh); });
  const meta = LANG_META[lang];
  document.getElementById('langCode').textContent = meta.code;
  document.getElementById('langFlag').src = `https://flagcdn.com/20x15/${meta.country}.png`;
  document.getElementById('langFlag').alt = meta.code;
  document.querySelectorAll('.lang-option').forEach(o => o.classList.toggle('active', o.dataset.lang === lang));
  document.getElementById('langDropdown').classList.remove('open');
  const py = document.getElementById('phoneY');
  if (py) updatePosY(py.value);
}

function toggleLangMenu() {
  document.getElementById('langDropdown').classList.toggle('open');
}

document.addEventListener('click', e => {
  if (!e.target.closest('#langDropdown')) {
    document.getElementById('langDropdown').classList.remove('open');
  }
});

/* ═══════════════════════════════════════════════════════════
   STATE
═══════════════════════════════════════════════════════════ */
let img = null, allFiles = [], curIdx = 0;
let targetW = 1290, targetH = 2796;
let mode = 'pad';
let bgValue = '#000000';
let bgImg = null;
let phoneScale = 0.72, phonePosY = 0.5;

let layers = [], selId = null, layerSeq = 0;
let drag = null;

/* ═══════════════════════════════════════════════════════════
   GRADIENTS
═══════════════════════════════════════════════════════════ */
const GRADS = {
  grad1: ['#0f2027','#203a43','#2c5364'],
  grad2: ['#c94b4b','#4b134f'],
  grad3: ['#134e5e','#71b280'],
  grad4: ['#4a00e0','#8e2de2'],
  grad5: ['#232526','#414345'],
};

/* ═══════════════════════════════════════════════════════════
   CANVAS
═══════════════════════════════════════════════════════════ */
const canvas = document.getElementById('canvas');
const ctx    = canvas.getContext('2d');

/* ═══════════════════════════════════════════════════════════
   FILE / DROP
═══════════════════════════════════════════════════════════ */
const dz = document.getElementById('dropZone');
const fi = document.getElementById('fileInput');

dz.onclick = e => { if (e.target !== fi) fi.click(); };
fi.onchange = e => loadFiles(e.target.files);
dz.addEventListener('dragover',  e => { e.preventDefault(); dz.classList.add('drag'); });
dz.addEventListener('dragleave', () => dz.classList.remove('drag'));
dz.addEventListener('drop', e => { e.preventDefault(); dz.classList.remove('drag'); loadFiles(e.dataTransfer.files); });

document.getElementById('bgImgInput').onchange = e => {
  const f = e.target.files[0]; if (!f) return;
  const url = URL.createObjectURL(f);
  const tmp = new Image();
  tmp.onload = () => { bgImg = tmp; rerender(); URL.revokeObjectURL(url); };
  tmp.src = url;
};

function loadFiles(files) {
  allFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
  if (!allFiles.length) return;
  curIdx = 0;
  showUI();
  loadImg(allFiles[0]);
}

function showUI() {
  ['cardDevice','cardMode','cardText'].forEach(id => document.getElementById(id).classList.add('vis'));
  document.getElementById('placeholder').style.display = 'none';
  document.getElementById('canvasWrap').style.display = 'inline-block';
  document.getElementById('btm').style.display = 'flex';
}

function loadImg(file) {
  const url = URL.createObjectURL(file);
  const tmp = new Image();
  tmp.onload = () => { img = tmp; rerender(); URL.revokeObjectURL(url); };
  tmp.src = url;
}

/* ═══════════════════════════════════════════════════════════
   DEVICE
═══════════════════════════════════════════════════════════ */
function setDevice(el) {
  document.querySelectorAll('#deviceChips .chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  const w = +el.dataset.w, h = +el.dataset.h;
  const isCustom = w === 0;
  document.getElementById('customSizeRow').style.display = isCustom ? 'flex' : 'none';
  if (!isCustom) { targetW = w; targetH = h; rerender(); }
}

function applyCustomSize() {
  const w = parseInt(document.getElementById('customW').value);
  const h = parseInt(document.getElementById('customH').value);
  if (w >= 100 && h >= 100) { targetW = w; targetH = h; rerender(); }
}

/* ═══════════════════════════════════════════════════════════
   MODE
═══════════════════════════════════════════════════════════ */
function setMode(el) {
  document.querySelectorAll('#modeChips .chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  mode = el.dataset.mode;
  document.getElementById('scaleRow').style.display = mode === 'phone_on_bg' ? 'block' : 'none';
  rerender();
}

/* ═══════════════════════════════════════════════════════════
   BACKGROUND
═══════════════════════════════════════════════════════════ */
function setBgPreset(el, val) {
  document.querySelectorAll('#bgPresets .chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  bgValue = val;
  if (val.startsWith('#')) document.getElementById('bgColor').value = val;
  rerender();
}

function setBgCustom(val) {
  bgValue = val;
  document.querySelectorAll('#bgPresets .chip').forEach(c => c.classList.remove('active'));
  rerender();
}

function updateScale(v) {
  phoneScale = v / 100;
  document.getElementById('scaleVal').textContent = v + '%';
  rerender();
}

function updatePosY(v) {
  phonePosY = v / 100;
  document.getElementById('posYVal').textContent = v < 35 ? t('pos_top') : v > 65 ? t('pos_bot') : t('pos_mid');
  rerender();
}

/* ═══════════════════════════════════════════════════════════
   TEXT LAYERS
═══════════════════════════════════════════════════════════ */
function makeLayer() {
  return {
    id: ++layerSeq,
    text: t('layer_text'),
    x: 0.5, y: 0.5,
    fontSize: 0.05,
    fontFamily: 'system-ui,sans-serif',
    color: '#ffffff',
    shadowColor: '#000000',
    bold: true, italic: false,
    shadow: true, stroke: false,
    align: 'center',
    opacity: 1,
  };
}

function addLayer() {
  const l = makeLayer();
  layers.push(l);
  selId = l.id;
  renderList();
  renderEditPanel();
  rerender();
}

function deleteLayer(id) {
  layers = layers.filter(l => l.id !== id);
  if (selId === id) selId = layers.length ? layers[layers.length - 1].id : null;
  renderList();
  renderEditPanel();
  rerender();
}

function selLayer(id) {
  selId = id;
  renderList();
  renderEditPanel();
}

function getSel() { return layers.find(l => l.id === selId) || null; }

function renderList() {
  const list = document.getElementById('layerList');
  list.innerHTML = '';
  layers.forEach(l => {
    const el = document.createElement('div');
    el.className = 'layer-item' + (l.id === selId ? ' sel' : '');
    el.innerHTML =
      `<span class="lname">${esc(l.text || '(prázdný)')}</span>` +
      `<span class="ldel" data-id="${l.id}">×</span>`;
    el.querySelector('.ldel').addEventListener('click', e => { e.stopPropagation(); deleteLayer(l.id); });
    el.addEventListener('click', () => selLayer(l.id));
    list.appendChild(el);
  });
}

function esc(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function renderEditPanel() {
  const panel = document.getElementById('editPanel');
  const l = getSel();
  if (!l) { panel.classList.remove('vis'); return; }
  panel.classList.add('vis');

  document.getElementById('epText').value = l.text;
  document.getElementById('epFont').value = l.fontFamily;
  document.getElementById('epSize').value  = l.fontSize * 100;
  document.getElementById('epSizeVal').textContent = Math.round(l.fontSize * 100) + '%';
  document.getElementById('epColor').value = l.color;
  document.getElementById('epShadowColor').value = l.shadowColor || '#000000';
  document.getElementById('epOpacity').value = Math.round(l.opacity * 100);
  document.getElementById('epOpVal').textContent  = Math.round(l.opacity * 100) + '%';

  document.getElementById('btnB').classList.toggle('active',  l.bold);
  document.getElementById('btnI').classList.toggle('active',  l.italic);
  document.getElementById('btnSh').classList.toggle('active', l.shadow);
  document.getElementById('btnStr').classList.toggle('active',l.stroke);

  document.getElementById('btnAL').classList.toggle('active', l.align === 'left');
  document.getElementById('btnAC').classList.toggle('active', l.align === 'center');
  document.getElementById('btnAR').classList.toggle('active', l.align === 'right');
}

function updateLayer(prop, val) {
  const l = getSel(); if (!l) return;
  l[prop] = val;
  if (prop === 'text') renderList();
  rerender();
}

function toggleProp(prop) {
  const l = getSel(); if (!l) return;
  l[prop] = !l[prop];
  renderEditPanel();
  rerender();
}

function setAlign(a) {
  const l = getSel(); if (!l) return;
  l.align = a;
  renderEditPanel();
  rerender();
}

function setPos(el) {
  const l = getSel(); if (!l) return;
  l.x = parseFloat(el.dataset.px);
  l.y = parseFloat(el.dataset.py);
  document.querySelectorAll('.pos-cell').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  rerender();
}

/* ═══════════════════════════════════════════════════════════
   CANVAS INTERACTION (drag text)
═══════════════════════════════════════════════════════════ */
function cvCoords(e) {
  const r = canvas.getBoundingClientRect();
  const sx = targetW / r.width, sy = targetH / r.height;
  const cx = e.touches ? e.touches[0].clientX : e.clientX;
  const cy = e.touches ? e.touches[0].clientY : e.clientY;
  return { x: (cx - r.left) * sx, y: (cy - r.top) * sy };
}

function hitTest(l, mx, my) {
  const ps = l.fontSize * targetH;
  const lines = l.text.split('\n');
  const lh = ps * 1.3, th = lines.length * lh;
  const maxLen = Math.max(...lines.map(s => s.length), 1);
  const aw = maxLen * ps * 0.58;
  const cx = l.x * targetW, cy = l.y * targetH;
  const bx = l.align === 'center' ? cx - aw/2 : l.align === 'right' ? cx - aw : cx;
  return mx >= bx - 16 && mx <= bx + aw + 16 && my >= cy - th/2 - 10 && my <= cy + th/2 + 10;
}

canvas.addEventListener('mousedown',  onDown);
canvas.addEventListener('touchstart', onDown, { passive: false });

function onDown(e) {
  e.preventDefault();
  const { x: mx, y: my } = cvCoords(e);
  for (let i = layers.length - 1; i >= 0; i--) {
    if (hitTest(layers[i], mx, my)) {
      selId = layers[i].id;
      drag = { id: layers[i].id, startMX: mx, startMY: my, origX: layers[i].x, origY: layers[i].y };
      canvas.classList.add('grabbing');
      renderList();
      renderEditPanel();
      rerender();
      return;
    }
  }
  selId = null;
  renderList();
  renderEditPanel();
  rerender();
}

document.addEventListener('mousemove',  onMove);
document.addEventListener('touchmove',  onMove, { passive: false });

function onMove(e) {
  if (!drag) return;
  e.preventDefault();
  const { x: mx, y: my } = cvCoords(e);
  const l = layers.find(l => l.id === drag.id); if (!l) return;

  let nx = Math.max(0, Math.min(1, drag.origX + (mx - drag.startMX) / targetW));
  let ny = Math.max(0, Math.min(1, drag.origY + (my - drag.startMY) / targetH));

  const rect = canvas.getBoundingClientRect();
  const thX = 10 / rect.width;
  const thY = 10 / rect.height;

  const snapX = Math.abs(nx - 0.5) < thX;
  const snapY = Math.abs(ny - 0.5) < thY;
  if (snapX) nx = 0.5;
  if (snapY) ny = 0.5;

  l.x = nx; l.y = ny;

  const wrap = document.getElementById('canvasWrap');
  wrap.classList.toggle('snap-x', snapX);
  wrap.classList.toggle('snap-y', snapY);

  document.querySelectorAll('.pos-cell').forEach(c => c.classList.remove('active'));
  rerender();
}

document.addEventListener('mouseup',  onUp);
document.addEventListener('touchend', onUp);

function onUp() {
  drag = null;
  canvas.classList.remove('grabbing');
  canvas.classList.toggle('grab', layers.length > 0);
  const wrap = document.getElementById('canvasWrap');
  wrap.classList.remove('snap-x', 'snap-y');
}

canvas.addEventListener('mousemove', e => {
  if (drag) return;
  const { x: mx, y: my } = cvCoords(e);
  canvas.classList.toggle('grab', layers.some(l => hitTest(l, mx, my)));
});

/* ═══════════════════════════════════════════════════════════
   RENDER
═══════════════════════════════════════════════════════════ */
function drawBg() {
  if (bgValue === 'bgimg' && bgImg) {
    const sc = Math.max(targetW / bgImg.width, targetH / bgImg.height);
    ctx.drawImage(bgImg, (targetW - bgImg.width*sc)/2, (targetH - bgImg.height*sc)/2, bgImg.width*sc, bgImg.height*sc);
    return;
  }
  if (GRADS[bgValue]) {
    const stops = GRADS[bgValue];
    const g = ctx.createLinearGradient(0, 0, 0, targetH);
    stops.forEach((c, i) => g.addColorStop(i / (stops.length - 1), c));
    ctx.fillStyle = g;
  } else {
    ctx.fillStyle = bgValue.startsWith('#') ? bgValue : '#000';
  }
  ctx.fillRect(0, 0, targetW, targetH);
}

function rrect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x+r, y);
  ctx.lineTo(x+w-r, y);   ctx.quadraticCurveTo(x+w, y,   x+w, y+r);
  ctx.lineTo(x+w, y+h-r); ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
  ctx.lineTo(x+r, y+h);   ctx.quadraticCurveTo(x,   y+h, x, y+h-r);
  ctx.lineTo(x, y+r);     ctx.quadraticCurveTo(x,   y,   x+r, y);
  ctx.closePath();
}

function drawTextLayers() {
  for (const l of layers) {
    const ps = l.fontSize * targetH;
    const lines = l.text.split('\n');
    const lh = ps * 1.3;
    const totalH = lines.length * lh;
    const px = l.x * targetW;
    const py = l.y * targetH - totalH/2 + lh/2;

    ctx.save();
    ctx.globalAlpha = l.opacity;
    ctx.font = `${l.italic?'italic ':''}${l.bold?'bold ':''}${ps}px ${l.fontFamily}`;
    ctx.textAlign    = l.align;
    ctx.textBaseline = 'middle';

    lines.forEach((line, i) => {
      const ly = py + i * lh;

      if (l.shadow) {
        ctx.shadowColor   = l.shadowColor || 'rgba(0,0,0,0.7)';
        ctx.shadowBlur    = ps * 0.35;
        ctx.shadowOffsetY = ps * 0.04;
      } else {
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur  = 0;
      }

      ctx.fillStyle = l.color;
      ctx.fillText(line, px, ly);

      if (l.stroke) {
        ctx.shadowBlur  = 0;
        ctx.strokeStyle = l.color === '#ffffff' ? '#000' : '#fff';
        ctx.lineWidth   = ps * 0.04;
        ctx.strokeText(line, px, ly);
      }
    });
    ctx.restore();

    if (l.id === selId) {
      ctx.save();
      ctx.globalAlpha = 0.55;
      ctx.strokeStyle = '#4a90e2';
      ctx.lineWidth   = Math.max(3, targetW * 0.003);
      ctx.setLineDash([targetW * 0.012, targetW * 0.009]);
      const maxLen = Math.max(...lines.map(s => s.length), 1);
      const aw = maxLen * ps * 0.58;
      const cx = l.x * targetW;
      const cy = l.y * targetH;
      const bx = l.align === 'center' ? cx - aw/2 : l.align === 'right' ? cx - aw : cx;
      ctx.strokeRect(bx - 16, cy - totalH/2 - 12, aw + 32, totalH + 24);
      ctx.restore();
    }
  }
}

function rerender() {
  if (!img) return;
  canvas.width = targetW; canvas.height = targetH;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  drawBg();

  if (mode === 'pad') {
    const sc = Math.min(targetW / img.width, targetH / img.height);
    const w = img.width*sc, h = img.height*sc;
    ctx.drawImage(img, (targetW-w)/2, (targetH-h)/2, w, h);

  } else if (mode === 'phone_on_bg') {
    const sc = Math.min((targetW*phoneScale) / img.width, (targetH*phoneScale) / img.height);
    const w = img.width*sc, h = img.height*sc;
    const x = (targetW - w) / 2, y = (targetH - h) * phonePosY;
    ctx.save();
    ctx.shadowColor   = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur    = targetW * 0.05;
    ctx.shadowOffsetY = targetH * 0.008;
    rrect(x, y, w, h, w * 0.07); ctx.clip();
    ctx.drawImage(img, x, y, w, h);
    ctx.restore();

  } else if (mode === 'stretch') {
    ctx.drawImage(img, 0, 0, targetW, targetH);

  } else if (mode === 'crop') {
    const sc = Math.max(targetW / img.width, targetH / img.height);
    const w = img.width*sc, h = img.height*sc;
    ctx.drawImage(img, (targetW-w)/2, (targetH-h)/2, w, h);
  }

  drawTextLayers();
  updateInfo();
}

function updateInfo() {
  const multi = allFiles.length > 1;
  document.getElementById('prevBtn').style.display = multi ? '' : 'none';
  document.getElementById('nextBtn').style.display = multi ? '' : 'none';
  document.getElementById('infoTxt').textContent =
    `${targetW} × ${targetH} px${multi ? `  •  ${curIdx+1} / ${allFiles.length}` : ''}`;
  document.getElementById('dlBtn').textContent = multi
    ? t('btn_dl_all').replace('{n}', allFiles.length) : t('btn_dl');
}

/* ═══════════════════════════════════════════════════════════
   NAVIGATION
═══════════════════════════════════════════════════════════ */
function navImg(dir) {
  curIdx = (curIdx + dir + allFiles.length) % allFiles.length;
  loadImg(allFiles[curIdx]);
}

/* ═══════════════════════════════════════════════════════════
   DOWNLOAD
═══════════════════════════════════════════════════════════ */
async function download() {
  if (allFiles.length === 1) { doDownload(allFiles[0].name); return; }
  const savedIdx = curIdx, savedImg = img;
  for (let i = 0; i < allFiles.length; i++) {
    curIdx = i;
    await loadImgAsync(allFiles[i]);
    rerender();
    doDownload(allFiles[i].name);
    await sleep(120);
  }
  curIdx = savedIdx; img = savedImg;
  rerender();
}

function loadImgAsync(file) {
  return new Promise(res => {
    const url = URL.createObjectURL(file);
    const tmp = new Image();
    tmp.onload = () => { img = tmp; URL.revokeObjectURL(url); res(); };
    tmp.src = url;
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function toggleGuides() {
  const wrap = document.getElementById('canvasWrap');
  const btn  = document.getElementById('guidesBtn');
  const on   = wrap.classList.toggle('guides-on');
  btn.style.borderColor = on ? 'var(--accent)' : '';
  btn.style.color       = on ? '#fff' : '';
}

function doDownload(origName) {
  const a = document.createElement('a');
  a.download = `appshot_${targetW}x${targetH}_${origName.replace(/\.[^.]+$/, '')}.png`;
  a.href = canvas.toDataURL('image/png');
  a.click();
}

/* ═══════════════════════════════════════════════════════════
   INIT
═══════════════════════════════════════════════════════════ */
applyLang(currentLang);

// Expose to HTML event handlers
Object.assign(window, {
  applyLang, toggleLangMenu,
  setDevice, applyCustomSize,
  setMode, setBgPreset, setBgCustom, updateScale, updatePosY,
  addLayer, deleteLayer, selLayer, updateLayer, toggleProp, setAlign, setPos,
  navImg, download, toggleGuides,
});
