const COLORS = [
  { name: 'red', hex: '#e74c3c' },
  { name: 'orange', hex: '#e67e22' },
  { name: 'yellow', hex: '#f1c40f' },
  { name: 'green', hex: '#2ecc71' },
  { name: 'blue', hex: '#3498db' },
  { name: 'violet', hex: '#9b59b6' },
];

const NUM_COLORS = COLORS.length;

function getHex(index) {
  return COLORS[index].hex;
}

function getName(index) {
  return COLORS[index].name;
}

function weightedRandom(weights) {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i];
    if (r <= 0) return i;
  }
  return weights.length - 1;
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function drawLossChart(canvas, data) {
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;

  canvas.width = canvas.offsetWidth * dpr;
  canvas.height = canvas.offsetHeight * dpr;
  ctx.scale(dpr, dpr);

  const w = canvas.offsetWidth;
  const h = canvas.offsetHeight;
  const pad = { top: 20, right: 10, bottom: 25, left: 45 };

  ctx.clearRect(0, 0, w, h);

  if (data.length < 2) {
    ctx.fillStyle = '#88889a';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Waiting for training data...', w / 2, h / 2);
    return;
  }

  const plotW = w - pad.left - pad.right;
  const plotH = h - pad.top - pad.bottom;

  const maxLoss = Math.max(...data);
  const minLoss = Math.min(...data);
  const range = maxLoss - minLoss || 1;

  const points = data.map((loss, i) => ({
    x: pad.left + (i / (data.length - 1)) * plotW,
    y: pad.top + (1 - (loss - minLoss) / range) * plotH,
  }));

  // Grid lines
  ctx.strokeStyle = '#2e2e3e';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = pad.top + (i / 4) * plotH;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(w - pad.right, y);
    ctx.stroke();

    const val = (maxLoss - (i / 4) * range).toFixed(3);
    ctx.fillStyle = '#88889a';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(val, pad.left - 5, y + 3);
  }

  // X-axis labels
  ctx.textAlign = 'center';
  const step = Math.max(1, Math.floor(data.length / 6));
  for (let i = 0; i < data.length; i += step) {
    ctx.fillText(String(i + 1), points[i].x, h - pad.bottom + 15);
  }

  // Gradient fill
  const gradient = ctx.createLinearGradient(0, pad.top, 0, h - pad.bottom);
  gradient.addColorStop(0, 'rgba(108, 114, 255, 0.25)');
  gradient.addColorStop(1, 'rgba(108, 114, 255, 0.02)');

  ctx.beginPath();
  ctx.moveTo(points[0].x, h - pad.bottom);
  points.forEach(p => ctx.lineTo(p.x, p.y));
  ctx.lineTo(points[points.length - 1].x, h - pad.bottom);
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();

  // Line
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.strokeStyle = '#6c72ff';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Last point dot
  const last = points[points.length - 1];
  ctx.beginPath();
  ctx.arc(last.x, last.y, 4, 0, Math.PI * 2);
  ctx.fillStyle = '#6c72ff';
  ctx.fill();
}
