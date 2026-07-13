let board = null;
let transitionMatrix = null;
let currentPattern = 'rainbow';
let noiseLevel = 2;

const PATTERNS = [
  { id: 'rainbow', label: '🌈 Rainbow', desc: 'Colors flow in order: red → orange → yellow → green → blue → violet → ...' },
  { id: 'hotcold', label: '🔥 Hot & Cold', desc: 'Warm colors stay warm, cool colors stay cool. Two distinct groups.' },
  { id: 'mirror', label: '🪞 Mirror', desc: 'Colors jump to their opposite: red ↔ violet, orange ↔ blue, yellow ↔ green.' },
  { id: 'pairs', label: '👥 Pairs', desc: 'Colors alternate within pairs: red↔orange, yellow↔green, blue↔violet.' },
];

function initPatternPanel() {
  const container = document.getElementById('pattern-selector');
  container.innerHTML = '';

  const sel = document.createElement('select');
  sel.id = 'pattern-select';
  PATTERNS.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = p.label;
    if (p.id === currentPattern) opt.selected = true;
    sel.appendChild(opt);
  });

  sel.addEventListener('change', () => {
    currentPattern = sel.value;
    updateTransitionMatrix();
    renderTransitionMatrix();
  });

  container.appendChild(sel);

  const desc = document.getElementById('pattern-desc');
  updatePatternDesc();
  sel.addEventListener('change', updatePatternDesc);

  updateTransitionMatrix();
  renderTransitionMatrix();
}

function updatePatternDesc() {
  const p = PATTERNS.find(p => p.id === currentPattern);
  document.getElementById('pattern-desc').textContent = p ? p.desc : '';
}

function updateNoiseSlider() {
  document.getElementById('noise-slider').value = noiseLevel;
  document.getElementById('noise-val').textContent = noiseLevel;
  updateTransitionMatrix();
  renderTransitionMatrix();
}

function updateTransitionMatrix() {
  transitionMatrix = buildTransitionMatrix(currentPattern, noiseLevel);
}

function buildTransitionMatrix(pattern, noise) {
  let raw = makeRawMatrix(pattern);
  raw = normalizeRows(raw);
  const noiseFactor = noise / 10;
  if (noiseFactor > 0) {
    for (let i = 0; i < NUM_COLORS; i++) {
      for (let j = 0; j < NUM_COLORS; j++) {
        raw[i][j] = raw[i][j] * (1 - noiseFactor) + (1.0 / NUM_COLORS) * noiseFactor;
      }
    }
  }
  return raw;
}

function makeRawMatrix(pattern) {
  switch (pattern) {
    case 'rainbow': return [
      [0, 10, 1, 0, 0, 0],
      [0, 0, 10, 1, 0, 0],
      [0, 0, 0, 10, 1, 0],
      [0, 0, 0, 0, 10, 1],
      [0, 0, 0, 0, 0, 10],
      [10, 1, 0, 0, 0, 0],
    ];
    case 'hotcold': return [
      [10, 6, 3, 0, 0, 0],
      [6, 10, 3, 0, 0, 0],
      [3, 6, 10, 0, 0, 0],
      [0, 0, 0, 10, 6, 3],
      [0, 0, 0, 6, 10, 3],
      [0, 0, 0, 3, 6, 10],
    ];
    case 'mirror': return [
      [0, 0, 0, 0, 0, 10],
      [0, 0, 0, 0, 10, 0],
      [0, 0, 0, 10, 0, 0],
      [0, 0, 10, 0, 0, 0],
      [0, 10, 0, 0, 0, 0],
      [10, 0, 0, 0, 0, 0],
    ];
    case 'pairs': return [
      [0, 10, 0, 0, 0, 0],
      [10, 0, 0, 0, 0, 0],
      [0, 0, 0, 10, 0, 0],
      [0, 0, 10, 0, 0, 0],
      [0, 0, 0, 0, 0, 10],
      [0, 0, 0, 0, 10, 0],
    ];
    default: return Array.from({ length: NUM_COLORS }, () => Array(NUM_COLORS).fill(1));
  }
}

function normalizeRows(mat) {
  return mat.map(row => {
    const sum = row.reduce((a, b) => a + b, 0);
    return row.map(v => v / sum);
  });
}

function getNextColor(prevIdx) {
  const probs = transitionMatrix[prevIdx];
  return weightedRandom(probs);
}

function generateBoard() {
  const rows = parseInt(document.getElementById('rows').value);
  const cols = parseInt(document.getElementById('cols').value);

  board = [];
  for (let r = 0; r < rows; r++) {
    const row = [];
    let prev = randomInt(0, NUM_COLORS - 1);
    row.push(prev);
    for (let c = 1; c < cols; c++) {
      prev = getNextColor(prev);
      row.push(prev);
    }
    board.push(row);
  }

  renderBoard();
  const info = document.getElementById('board-info');
  info.textContent = `Generated ${rows} rows × ${cols} cols = ${rows * cols} tokens.`;
}

function renderBoard() {
  const container = document.getElementById('board-container');
  container.innerHTML = '';

  if (!board || board.length === 0) {
    container.style.display = 'none';
    return;
  }

  container.style.display = 'grid';
  container.style.gridTemplateColumns = `repeat(${board[0].length}, 1fr)`;
  container.style.maxHeight = '500px';
  container.style.overflowY = 'auto';

  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c < board[r].length; c++) {
      const cell = document.createElement('div');
      cell.className = 'board-cell';
      cell.style.background = getHex(board[r][c]);
      cell.title = `${getName(board[r][c])} [${r},${c}]`;
      container.appendChild(cell);
    }
  }
}

function getBoard() {
  return board;
}

function getTransitionMatrix() {
  return transitionMatrix;
}

function getCurrentPattern() {
  return currentPattern;
}

function renderTransitionMatrix() {
  const container = document.getElementById('transition-matrix');
  if (!container) return;
  container.innerHTML = '';
  if (!transitionMatrix) return;

  const legend = document.createElement('div');
  legend.className = 'matrix-legend';
  legend.innerHTML = '<span>From</span><div class="matrix-grid-wrap"><div class="matrix-grid" id="matrix-grid"></div><div class="matrix-col-labels"></div></div>';

  const grid = legend.querySelector('#matrix-grid');
  const colLabels = legend.querySelector('.matrix-col-labels');

  for (let j = 0; j < NUM_COLORS; j++) {
    const lbl = document.createElement('div');
    lbl.className = 'matrix-label-col';
    lbl.innerHTML = `<span class="color-swatch" style="background:${getHex(j)}; width:10px; height:10px; display:inline-block;"></span> ${getName(j)}`;
    colLabels.appendChild(lbl);
  }

  for (let i = 0; i < NUM_COLORS; i++) {
    const rowWrap = document.createElement('div');
    rowWrap.className = 'matrix-row-wrap';

    const lbl = document.createElement('div');
    lbl.className = 'matrix-label-row';
    lbl.innerHTML = `<span class="color-swatch" style="background:${getHex(i)}; width:10px; height:10px; display:inline-block; vertical-align:middle;"></span> ${getName(i)}`;
    rowWrap.appendChild(lbl);

    for (let j = 0; j < NUM_COLORS; j++) {
      const cell = document.createElement('div');
      cell.className = 'matrix-cell';
      const intensity = transitionMatrix[i][j];
      const alpha = 0.08 + intensity * 0.85;
      cell.style.background = `rgba(108, 114, 255, ${alpha})`;
      cell.title = `${getName(i)} → ${getName(j)}: ${(intensity * 100).toFixed(1)}%`;
      rowWrap.appendChild(cell);
    }

    grid.appendChild(rowWrap);
  }

  container.appendChild(legend);
}
