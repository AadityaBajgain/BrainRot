# Brainrot Study

Turn a topic, a short description, or a PDF/TXT study note into a concise, high-energy study script with an optional local voiceover. The app uses [Ollama](https://ollama.com/) for generation and Piper for text-to-speech, so your study material can remain local.

## Run locally

Prerequisites: Python 3.11+, Node.js 20+, and a running Ollama instance with the model configured below.

1. Start the API:

   ```bash
   cd backend
   python -m venv .venv
   .venv/bin/pip install -r requirements.txt
   OLLAMA_MODEL=gemma4 .venv/bin/uvicorn app.main:app --reload
   ```

   The included Piper model is expected at `backend/model/en_US-ryan-high.onnx`. If it is absent or voice generation fails, script generation still works; the audio preview is simply omitted.

2. In another terminal, start the frontend:

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

   Open the local URL Vite prints (normally `http://localhost:5173`).

## Configuration

The backend accepts these optional environment variables:

| Variable | Default | Purpose |
| --- | --- | --- |
| `OLLAMA_URL` | `http://localhost:11434/api/generate` | Ollama generation endpoint |
| `OLLAMA_MODEL` | `gemma4` | Installed Ollama model to use |
| `FRONTEND_ORIGINS` | Local Vite URLs | Comma-separated CORS origins |
| `VITE_API_BASE_URL` | `http://127.0.0.1:8000` | API URL used by the frontend at build time |

Uploads accept PDF and TXT files up to 10 MB. Extracted source text is capped before it is sent to the language model.

## Background clips

The Create page includes five bundled vertical background clips. Choose one before generating, then use **Play with voice** to preview it in sync with the generated narration. The sources and license links are recorded in [`frontend/public/clips/SOURCES.md`](frontend/public/clips/SOURCES.md).
