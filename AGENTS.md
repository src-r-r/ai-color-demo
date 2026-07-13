# ai_color_demo

Frontend-only JS app demonstrating the full AI pipeline: **data generation → model training → inference** using colored tokens.

## Running

```
npx serve .
```

No build step. Served as static files. Open in browser.

## File Structure

```
index.html          — entry point, tabbed UI, loads all scripts
css/style.css       — all styling (dark theme, responsive)
js/utils.js         — COLORS constant, weightedRandom(), drawLossChart()
js/data.js          — board generation, weight panel, rendering
js/model.js         — TF.js LSTM model creation, training loop
js/inference.js     — prediction, random sequence, chain generation
js/app.js           — DOMContentLoaded init, event wiring
```

Scripts load in order via `<script>` tags (no modules). All share global scope. `tf` comes from CDN (`@tensorflow/tfjs@4.22.0`).

## Architecture

Three tabbed sections, all running in-browser (no backend):

### 1. Data Generation
- **Vocabulary**: 6 fixed colors — red, orange, yellow, green, blue, violet.
- **Weighted random generation**: Each color has an adjustable "weight" slider (or a "randomize" button). Generated colors are sampled proportional to these weights.
- **Board**: Grid of `rows × cols` (user-configurable, e.g. 64 × 32). Each cell is one color. The board is the training corpus.
- **Output**: The board renders as colored cells. Internally stored as a 2D array of color indices (0–5).

### 2. Training
- **Model**: Embedding (16-d) → LSTM (32 units) → Dense (6, softmax).
- **Tokenization**: Colors are integer indices (0–5). Embed each into a vector, feed through the model, softmax over 6 classes.
- **Training loop**: Slide a window (context length = N) over each row. Target = next color after the window. Train with categorical cross-entropy. One-hot targets are built manually (not tf.oneHot).
- **UI**: "Train" button, epoch/loss/accuracy display, stop button. Uses `tf.nextFrame()` between epochs to keep UI responsive. Disposes tensors after training.

### 3. Inference
- **Input**: A sequence of colors (max length = board row length). User can:
  - Generate a random color string (random length, user-settable max)
  - Manually pick colors cell-by-cell
- **Output**: Model predicts the next "token" color. Display the full input sequence + predicted color.
- **Chain**: Optionally run inference repeatedly to generate longer sequences (append prediction back as input).

## Key Constraints

- The 6 color indices in `js/utils.js` (`COLORS` constant) must be consistent across all modules.
- Context length for training must be less than column count.
- Model state, board data, and settings live in JS memory only — no persistence.
- All TF.js tensors must be disposed after use to avoid memory leaks (see `disposeTensors()` in model.js, input/pred disposal in inference.js).
- `tf.disposeVariables()` is called on `beforeunload` in app.js.

## Git Workflow

- `main` branch is the stable baseline. Work on `feat/*` branches.
