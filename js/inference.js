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

function updateInferenceButtons() {
  const hasModel = !!getModel();
  const hasInput = currentSequence.length > 0;

  document.getElementById('predict-btn').disabled = !(hasModel && hasInput);
  document.getElementById('chain-btn').disabled = !(hasModel && hasInput);
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
  document.getElementById('chain-result').innerHTML = '';
  document.getElementById('infer-info').textContent = '';
}

async function predictNext() {
  const mdl = getModel();
  if (!mdl || currentSequence.length === 0) return;

  const input = tf.tensor2d([currentSequence], [1, currentSequence.length], 'int32');
  const preds = mdl.predict(input);
  const values = await preds.data();

  const predictedIdx = Array.from(values).indexOf(Math.max(...values));

  input.dispose();
  preds.dispose();

  const display = document.getElementById('prediction-display');
  display.innerHTML = '';

  currentSequence.forEach(idx => {
    const cell = document.createElement('div');
    cell.className = 'seq-cell';
    cell.style.background = getHex(idx);
    cell.title = getName(idx);
    display.appendChild(cell);
  });

  const arrow = document.createElement('span');
  arrow.className = 'arrow';
  arrow.textContent = ' → ';
  display.appendChild(arrow);

  const predCell = document.createElement('div');
  predCell.className = 'prediction-cell';
  predCell.style.background = getHex(predictedIdx);
  predCell.title = `Predicted: ${getName(predictedIdx)}`;
  display.appendChild(predCell);

  document.getElementById('infer-info').textContent =
    `Predicted next token: ${getName(predictedIdx)} (index ${predictedIdx})`;
}

async function chainGenerate() {
  const mdl = getModel();
  if (!mdl || currentSequence.length === 0) return;

  const steps = parseInt(document.getElementById('chain-count').value);
  const chained = [];

  const working = [...currentSequence];

  for (let i = 0; i < steps; i++) {
    const input = tf.tensor2d([working], [1, working.length], 'int32');
    const preds = mdl.predict(input);
    const values = await preds.data();

    const predictedIdx = Array.from(values).indexOf(Math.max(...values));
    chained.push(predictedIdx);

    working.push(predictedIdx);

    input.dispose();
    preds.dispose();
  }

  const container = document.getElementById('chain-result');
  container.innerHTML = '';

  chained.forEach((idx, i) => {
    const cell = document.createElement('div');
    cell.className = 'chain-cell chained';
    cell.style.background = getHex(idx);
    cell.title = `${getName(idx)} (step ${i + 1})`;
    container.appendChild(cell);
  });

  document.getElementById('infer-info').textContent =
    `Chained ${steps} predictions: ${chained.map(getName).join(' → ')}`;
}
