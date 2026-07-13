let currentSequence = [];

function initInferenceUI() {
  const container = document.getElementById('color-buttons');
  container.innerHTML = '';

  COLORS.forEach((color, i) => {
    const btn = document.createElement('button');
    btn.className = 'color-btn';
    btn.style.background = color.hex;
    btn.title = color.name;
    btn.addEventListener('click', () => {
      currentSequence.push(i);
      renderInputSequence();
      updateInferenceButtons();
    });
    container.appendChild(btn);
  });
}

function renderInputSequence() {
  const container = document.getElementById('input-sequence');
  container.innerHTML = '';

  currentSequence.forEach(idx => {
    const cell = document.createElement('div');
    cell.className = 'seq-cell';
    cell.style.background = getHex(idx);
    cell.title = getName(idx);
    container.appendChild(cell);
  });

  if (currentSequence.length === 0) {
    container.innerHTML = '<span style="color: var(--text-dim); font-size: 0.8rem;">(empty)</span>';
  }
}

function updateRawDataDisplay() {
  const display = document.getElementById('raw-data-display');
  const b = getBoard();
  const tm = getTransitionMatrix();
  const pat = getCurrentPattern();

  if (!b || b.length === 0) {
    display.innerHTML = '<span style="color: var(--text-dim);">No training data generated yet.</span>';
    return;
  }

  const rows = b.length;
  const cols = b[0].length;

  let html = '';

  // Transition matrix section
  html += '<div style="margin-bottom:1rem;">';
  html += '<div style="font-size:0.75rem; font-weight:600; margin-bottom:0.4rem; color:var(--text);">Transition Matrix</div>';
  html += '<div style="font-size:0.75rem; color:var(--text-dim); margin-bottom:0.5rem;">Pattern: ' + pat + ' | Noise: ' + noiseLevel;
  html += '</div>';
  html += '<div style="display:flex; gap:0;">';

  if (tm) {
    for (let i = 0; i < NUM_COLORS; i++) {
      html += '<div style="width:55px; text-align:right; font-size:0.6rem; color:var(--text-dim); display:flex; align-items:center; justify-content:flex-end;">';
      html += '<span style="width:8px; height:8px; display:inline-block; background:' + getHex(i) + '; border-radius:1px; margin-right:3px;"></span>';
      html += getName(i) + '</div>';
      for (let j = 0; j < NUM_COLORS; j++) {
        const intensity = tm[i][j];
        const alpha = 0.08 + intensity * 0.85;
        html += '<div style="width:28px; height:28px; background:rgba(108,114,255,' + alpha.toFixed(2) + '); border:1px solid rgba(255,255,255,0.04);"></div>';
      }
    }
    for (let j = 0; j < NUM_COLORS; j++) {
      html += '<div style="width:28px; text-align:center; font-size:0.6rem; color:var(--text-dim); padding-top:3px;">';
      html += '<span style="width:8px; height:8px; display:inline-block; background:' + getHex(j) + '; border-radius:1px;"></span>';
      html += '</div>';
    }
  }
  html += '</div></div>';

  // Board mini grid
  html += '<div style="margin-bottom:0.75rem;">';
  html += '<div style="font-size:0.75rem; font-weight:600; margin-bottom:0.4rem; color:var(--text);">Training Board</div>';
  html += '<div style="display:inline-grid; gap:1px; grid-template-columns:repeat(' + cols + ', 1fr);">';
  const maxRows = Math.min(rows, 30);
  for (let r = 0; r < maxRows; r++) {
    for (let c = 0; c < cols; c++) {
      html += '<span style="width:8px; height:8px; display:block; background:' + getHex(b[r][c]) + '; border-radius:1px;"></span>';
    }
  }
  html += '</div>';
  if (rows > maxRows) html += '<div style="font-size:0.7rem; color:var(--text-dim); margin-top:0.25rem;">…' + (rows - maxRows) + ' more rows</div>';
  html += '</div>';

  // Stats
  html += '<div style="font-family: SF Mono, Fira Code, monospace; font-size: 0.75rem; line-height: 1.5; white-space: pre; overflow-x: auto; color: var(--text-dim);">';
  html += 'Rows: ' + rows + ', Cols: ' + cols + ', Total tokens: ' + (rows * cols) + '\n\n';

  const counts = new Array(NUM_COLORS).fill(0);
  for (const row of b) for (const v of row) counts[v]++;
  for (let i = 0; i < NUM_COLORS; i++) {
    const pct = ((counts[i] / (rows * cols)) * 100).toFixed(1);
    html += '  ' + getName(i) + ': ' + counts[i] + ' (' + pct + '%)\n';
  }
  html += '</div>';

  display.innerHTML = html;
}

function updateInferenceButtons() {
  const hasModel = !!getModel();
  const hasInput = currentSequence.length > 0;

  document.getElementById('predict-btn').disabled = !(hasModel && hasInput);
}

function generateRandomSequence() {
  const maxLen = parseInt(document.getElementById('infer-len').value);
  currentSequence = Array.from({ length: maxLen }, () => randomInt(0, NUM_COLORS - 1));
  renderInputSequence();
  updateInferenceButtons();
}

function clearSequence() {
  currentSequence = [];
  renderInputSequence();
  updateInferenceButtons();
  document.getElementById('prediction-display').innerHTML = '';
  document.getElementById('infer-info').textContent = '';
}

async function predictNext() {
  const mdl = getModel();
  if (!mdl || currentSequence.length === 0) return;

  const contextLen = parseInt(document.getElementById('context-length').value);
  const seq = currentSequence.slice(-contextLen);
  while (seq.length < contextLen) seq.unshift(0);
  const input = tf.tensor2d([seq], [1, contextLen], 'int32');
  const preds = mdl.predict(input);
  const values = await preds.data();

  const predictedIdx = Array.from(values).indexOf(Math.max(...values));

  input.dispose();
  preds.dispose();

  currentSequence.push(predictedIdx);

  const display = document.getElementById('prediction-display');
  display.innerHTML = '';

  currentSequence.forEach((idx, i) => {
    const cell = document.createElement('div');
    cell.className = i === currentSequence.length - 1 ? 'prediction-cell' : 'seq-cell';
    cell.style.background = getHex(idx);
    cell.title = getName(idx);
    display.appendChild(cell);
  });

  document.getElementById('infer-info').textContent =
    `Predicted next token: ${getName(predictedIdx)} (index ${predictedIdx})`;

  renderInputSequence();
  updateInferenceButtons();
}

