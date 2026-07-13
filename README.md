# AI Color Demo

Frontend-only app demonstrating the full AI pipeline — **data generation → model training → inference** — entirely in your browser with no backend.

## Running

```bash
npx serve .
```

No build step. Open the served URL in any modern browser.

## How It Works

Three tabbed sections, all running client-side with TensorFlow.js:

### 1. Generate Data

Adjust per-color weight sliders (or randomize them), then generate a board of colored cells. Each row is a sequence of 6 possible colors (red, orange, yellow, green, blue, violet) sampled proportionally to the weights. The board serves as the training corpus.

### 2. Train Model

Train an LSTM to predict the next color in a sequence:

* **Embedding** (16-d) → **LSTM** (32 units) → **Dense** (6, softmax)
* Sliding window over each row with a configurable context length
* Categorical cross-entropy loss, Adam optimizer
* Real-time loss chart and epoch/accuracy metrics
* UI stays responsive via `tf.nextFrame()` between epochs

### 3. Inference

Build an input sequence (manually or randomly), then:

* **Predict Next** — model predicts the next token
* **Chain Generate** — auto-regressively generate a sequence by feeding predictions back as input

## Project Structure

```
index.html       Entry point, tabbed UI, script loading
css/style.css    Dark theme, responsive layout
js/utils.js      COLORS constant, weightedRandom(), drawLossChart()
js/data.js       Board generation, weight panel, rendering
js/model.js      TF.js model creation, training loop
js/inference.js  Prediction, random sequence, chain generation
js/app.js        DOMContentLoaded init, event wiring
```

Scripts load via `<script>` tags (no modules). TensorFlow.js 4.22.0 loaded from CDN.

## Requirements

* Modern browser with WebGL support (for TF.js)
* No server, no dependencies, no build step
