#!/bin/bash
# start.sh — start SpecValidator (backend + frontend) locally
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"

echo "🔍 Checking dependencies…"

# Python venv
if [ ! -d "$ROOT/.venv" ]; then
  echo "📦 Creating Python virtual environment…"
  python3 -m venv "$ROOT/.venv"
fi

source "$ROOT/.venv/bin/activate"

echo "📦 Installing Python dependencies…"
pip install -q --upgrade pip
pip install -q -r "$ROOT/backend/requirements.txt"

# Check model
if [ ! -f "$ROOT/models/phi-4-mini-instruct-q4_k_m.gguf" ]; then
  echo ""
  echo "⚠️  Model not found. SpecValidator will run in heuristic fallback mode."
  echo "   To download the model (2.5 GB, one-time):"
  echo "   python backend/download_model.py"
  echo ""
fi

# Start backend
echo "🚀 Starting FastAPI backend on http://localhost:8000 …"
cd "$ROOT"
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!

# Start frontend
echo "🌐 Starting React frontend on http://localhost:3000 …"
cd "$ROOT/frontend"
if [ ! -d "node_modules" ]; then
  echo "📦 Installing Node dependencies…"
  npm install --silent
fi
npm start &
FRONTEND_PID=$!

echo ""
echo "✅ SpecValidator running!"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:8000"
echo "   API docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop."

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo 'Stopped.'" EXIT INT TERM
wait
