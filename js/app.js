document.addEventListener('DOMContentLoaded', () => {
  initPatternPanel();
  initInferenceUI();
  renderInputSequence();
  renderBoard();

  document.getElementById('board-container').style.display = 'none';

  const canvas = document.getElementById('loss-chart');
  drawLossChart(canvas, []);

  window.addEventListener('resize', () => {
    if (lossHistory.length > 0) {
      drawLossChart(canvas, lossHistory);
    }
  });

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      document.getElementById(btn.dataset.tab).classList.add('active');
    });
  });

  document.getElementById('raw-data-toggle').addEventListener('toggle', () => {
    if (document.getElementById('raw-data-toggle').open) {
      updateRawDataDisplay();
    }
  });

  const noiseSlider = document.getElementById('noise-slider');
  noiseSlider.addEventListener('input', () => {
    noiseLevel = parseInt(noiseSlider.value);
    document.getElementById('noise-val').textContent = noiseLevel;
    updateTransitionMatrix();
    renderTransitionMatrix();
  });

  document.getElementById('generate-btn').addEventListener('click', generateBoard);
  document.getElementById('train-btn').addEventListener('click', trainModel);
  document.getElementById('stop-btn').addEventListener('click', stopTraining);
  document.getElementById('random-seq-btn').addEventListener('click', generateRandomSequence);
  document.getElementById('clear-seq-btn').addEventListener('click', clearSequence);
  document.getElementById('predict-btn').addEventListener('click', predictNext);

  window.addEventListener('beforeunload', () => {
    tf.disposeVariables();
  });
});
