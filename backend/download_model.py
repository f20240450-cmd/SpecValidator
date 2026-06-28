#!/usr/bin/env python3
"""
download_model.py — Download Phi-4-mini-instruct Q4_K_M from Hugging Face.
Run once before starting the server:  python backend/download_model.py
"""
import os
import sys
from pathlib import Path
from urllib.request import urlretrieve

MODEL_DIR = Path(__file__).parent.parent / "models"
MODEL_FILE = MODEL_DIR / "phi-4-mini-instruct-q4_k_m.gguf"

# Hugging Face direct download URL (Bartowski's GGUF collection)
HF_URL = (
    "https://huggingface.co/bartowski/Phi-4-mini-instruct-GGUF/resolve/main/"
    "Phi-4-mini-instruct-Q4_K_M.gguf"
)


def download():
    MODEL_DIR.mkdir(parents=True, exist_ok=True)

    if MODEL_FILE.exists():
        size_mb = MODEL_FILE.stat().st_size / 1024 / 1024
        print(f"✅ Model already present ({size_mb:.0f} MB): {MODEL_FILE}")
        return

    print(f"📥 Downloading Phi-4-mini-instruct Q4_K_M (~2.5 GB) …")
    print(f"   URL : {HF_URL}")
    print(f"   Dest: {MODEL_FILE}")
    print()

    def _progress(block_num, block_size, total_size):
        downloaded = block_num * block_size
        pct = min(downloaded / total_size * 100, 100) if total_size > 0 else 0
        mb = downloaded / 1024 / 1024
        total_mb = total_size / 1024 / 1024
        print(f"\r  {pct:.1f}%  {mb:.0f} / {total_mb:.0f} MB", end="", flush=True)

    try:
        urlretrieve(HF_URL, MODEL_FILE, reporthook=_progress)
        print(f"\n✅ Downloaded to {MODEL_FILE}")
    except Exception as e:
        print(f"\n❌ Download failed: {e}", file=sys.stderr)
        if MODEL_FILE.exists():
            MODEL_FILE.unlink()
        sys.exit(1)


if __name__ == "__main__":
    download()
