let model = null;
let isTraining = false;
let lossHistory = [];

async function createModel(learningRate = 0.01) {
  if (model) {
    model.dispose();
  }

  model = tf.sequential();

  model.add(tf.layers.embedding({
    inputDim: NUM_COLORS,
    outputDim: 16,
    inputLength: parseInt(document.getElementById('context-length').value),
  }));

  model.add(tf.layers.lstm({ units: 32 }));

  model.add(tf.layers.dense({
    units: NUM_COLORS,
    activation: 'softmax',
  }));

  model.compile({
    optimizer: tf.train.adam(learningRate),
    loss: 'categoricalCrossentropy',
    metrics: ['accuracy'],
  });

  lossHistory = [];
}

function prepareTrainingData(board, contextLen) {
  const inputs = [];
  const targets = [];

  for (const row of board) {
    for (let i = 0; i <= row.length - contextLen - 1; i++) {
      const sequence = row.slice(i, i + contextLen);
      const target = row[i + contextLen];
      inputs.push(sequence);
      targets.push(target);
    }
  }

  const xs = tf.tensor2d(inputs, [inputs.length, contextLen], 'int32');
  const ys = tf.tensor2d(
    targets.map(t => {
      const oneHot = new Array(NUM_COLORS).fill(0);
      oneHot[t] = 1;
      return oneHot;
    }),
    [targets.length, NUM_COLORS]
  );

  return { xs, ys, count: inputs.length };
}

function disposeTensors(xs, ys) {
  xs.dispose();
  ys.dispose();
}

async function trainModel() {
  const b = getBoard();
  if (!b || b.length === 0) {
    document.getElementById('train-info').textContent =
      'No board data. Go to "Generate Data" tab first.';
    return;
  }

  const contextLen = parseInt(document.getElementById('context-length').value);
  const epochs = parseInt(document.getElementById('epochs').value);
  const lr = parseFloat(document.getElementById('learning-rate').value);

  if (contextLen >= b[0].length) {
    document.getElementById('train-info').textContent =
      'Context length must be less than column count.';
    return;
  }

  isTraining = true;
  document.getElementById('train-btn').disabled = true;
  document.getElementById('stop-btn').disabled = false;
  document.getElementById('train-info').textContent = 'Training...';

  await createModel(lr);

  const { xs, ys, count } = prepareTrainingData(b, contextLen);
  document.getElementById('train-info').textContent =
    `Training on ${count.toLocaleString()} samples (${epochs} epochs)...`;

  try {
    for (let epoch = 1; epoch <= epochs; epoch++) {
      if (!isTraining) break;

      const result = await model.fit(xs, ys, {
        epochs: 1,
        validationSplit: 0.1,
        verbose: 0,
      });

      const loss = result.history.loss[0];
      const acc = result.history.acc ? result.history.acc[0] : result.history.accuracy[0];
      lossHistory.push(loss);

      document.getElementById('epoch-display').textContent = `${epoch}/${epochs}`;
      document.getElementById('loss-display').textContent = loss.toFixed(4);
      document.getElementById('accuracy-display').textContent = (acc * 100).toFixed(1) + '%';

      const progress = (epoch / epochs) * 100;
      document.getElementById('progress-bar').style.width = progress + '%';

      const canvas = document.getElementById('loss-chart');
      drawLossChart(canvas, lossHistory);

      await tf.nextFrame();
    }

    disposeTensors(xs, ys);
    document.getElementById('train-info').textContent =
      isTraining
        ? `Training complete. Final loss: ${lossHistory[lossHistory.length - 1].toFixed(4)}.`
        : 'Training stopped by user.';
  } catch (err) {
    document.getElementById('train-info').textContent = 'Training error: ' + err.message;
    console.error(err);
  }

  isTraining = false;
  document.getElementById('train-btn').disabled = false;
  document.getElementById('stop-btn').disabled = true;
}

function stopTraining() {
  isTraining = false;
}

function getModel() {
  return model;
}
