#!/bin/bash
# ─────────────────────────────────────────────────────────────
#  DIU CPC 99 Days — Backend Startup Script
#  Usage: bash start.sh
# ─────────────────────────────────────────────────────────────

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║   DIU CPC 99 Days — Mentor Backend           ║"
echo "║   MiniLM-L6-v2 + ChromaDB + Flask API        ║"
echo "╚══════════════════════════════════════════════╝"
echo ""

# ── Create venv if it doesn't exist ──
if [ ! -d "venv" ]; then
  echo "[1/3] Creating Python virtual environment..."
  python3 -m venv venv
  echo "      ✓ venv created"
fi

# ── Activate venv ──
source venv/bin/activate

# ── Install / upgrade dependencies ──
echo "[2/3] Installing dependencies (first run may take ~2 min to download MiniLM)..."
pip install -q --upgrade pip
pip install -q -r requirements.txt
echo "      ✓ Dependencies ready"

# ── Index knowledge base (only if ChromaDB not yet built) ──
if [ ! -d "chroma_db" ]; then
  echo ""
  echo "[3/3] Indexing knowledge base with MiniLM-L6-v2..."
  python embed_kb.py
else
  echo "[3/3] ChromaDB already indexed ✓ (delete chroma_db/ to reindex)"
fi

echo ""
echo "─────────────────────────────────────────────────"
echo "  Starting Flask API on http://localhost:5050"
echo "  Open the login portal: login-portal/index.html"
echo "  Press Ctrl+C to stop"
echo "─────────────────────────────────────────────────"
echo ""

python server.py
