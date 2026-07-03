# ai_color_demo

Frontend-only JS app demonstrating the full AI pipeline: **data generation → model training → inference** using colored tokens.

## Architecture

Three tabbed sections, all running in-browser (no backend):

### 1. Data Generation
- **Vocabulary**: 6 fixed colors — red, orange, yellow, green, blue, violet.
- **Weighted random generation**: Each color has an adjustable "weight" slider (or a "randomize" button). Generated colors are sampled proportional to these weights.
- **Board**: Grid of `rows × cols` (user-configurable, e.g. 64 × 32). Each cell is one color. The board is the training corpus.
- **Output**: The board renders as colored cells. Internally stored as a 2D array of color indices (0–5).

### 2. Training
- **Model**: In-browser neural network. Use a simple RNN/LSTM or a tiny transformer that predicts the next color given a sequence of previous colors.
- **Tokenization**: Colors are integer indices (0–5). Embed each into a vector, feed through the model, softmax over 6 classes.
- **Training loop**: Slide a window (e.g. context length = N) over each row. Target = next color after the window. Train with cross-entropy loss, log loss per epoch.
- **UI**: "Train" button, epoch/loss display, stop button. Training runs on the main thread (or Web Worker if model gets heavy).

### 3. Inference
- **Input**: A sequence of colors (max length = board row length). User can:
  - Generate a random color string (random length, user-settable max)
  - Manually pick colors cell-by-cell
- **Output**: Model predicts the next "token" color. Display the full input sequence + predicted color.
- **Chain**: Optionally run inference repeatedly to generate longer sequences (append prediction back as input).

## Technical Details

- **Stack**: Frontend-only JavaScript. No framework required — vanilla JS + Canvas or DOM cells is sufficient. If using a framework, keep it minimal.
- **Model library**: Use TensorFlow.js (`@tensorflow/tfjs`) for in-browser training and inference. It provides tf.layers for building RNNs/transformers and tf.model for training.
- **No build step required**: Can be served via `npx serve .` or any static file server. If adding a build step, document commands here.
- **State**: All model state, board data, and settings live in JS memory. No persistence needed.

## Key Implementation Notes

- The 6 color indices must be consistent across all three sections (generation → training → inference).
- Embedding dimension and hidden layer sizes should be small (e.g. 16–32) so training feels responsive in-browser.
- The context/window length for training should match the inference input length.
- Loss should drop visibly during training — this is a demo, so the learning signal matters.
- Keep the UI visual-first: colored cells, progress bars, animated loss charts.
