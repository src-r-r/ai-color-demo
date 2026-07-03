let board = null;
let weights = [1, 1, 1, 1, 1, 1];

function initWeightsPanel() {
  const container = document.getElementById('weight-sliders');
  container.innerHTML = '';

  COLORS.forEach((color, i) => {
    const item = document.createElement('div');
    item.className = 'weight-item';

    const swatch = document.createElement('span');
    swatch.className = 'color-swatch';
    swatch.style.background = color.hex;

    const label = document.createElement('label');
    label.textContent = color.name;

    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = '0';
    slider.max = '10';
    slider.step = '1';
    slider.value = weights[i];
    slider.dataset.index = i;

    const val = document.createElement('span');
    val.className = 'weight-val';
    val.textContent = weights[i];

    slider.addEventListener('input', () => {
      weights[i] = parseInt(slider.value);
      val.textContent = slider.value;
    });

    item.appendChild(swatch);
    item.appendChild(label);
    item.appendChild(slider);
    item.appendChild(val);
    container.appendChild(item);
  });
}

function randomizeWeights() {
  weights = Array.from({ length: NUM_COLORS }, () => randomInt(0, 10));
  const sliders = document.querySelectorAll('#weight-sliders input[type="range"]');
  sliders.forEach((slider, i) => {
    slider.value = weights[i];
    slider.nextElementSibling.nextElementSibling.textContent = weights[i];
  });
}

function generateBoard() {
  const rows = parseInt(document.getElementById('rows').value);
  const cols = parseInt(document.getElementById('cols').value);

  board = [];
  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let c = 0; c < cols; c++) {
      row.push(weightedRandom(weights));
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
