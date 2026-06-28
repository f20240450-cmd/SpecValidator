"""
inference.py — llama.cpp wrapper for offline CPU inference.

Uses Ollama qwen3.5:latest once at startup and exposes
a thread-safe generate() call.  Falls back to a heuristic extractor
when the model file is absent (useful for testing without the 2GB model).
"""
from __future__ import annotations

import json
import logging
import os
import re
import threading
from pathlib import Path
from typing import Any

logger = logging.getLogger(__name__)

# ── Model path ────────────────────────────────────────────────────────────────
MODEL_DIR = Path(__file__).parent.parent / "models"
MODEL_FILE = MODEL_DIR / "phi-4-mini-instruct-q4_k_m.gguf"

GRAMMAR_FILE = Path(__file__).parent.parent / "grammars" / "endpoint.gbnf"

# ── Prompt template for Phi-4-mini ───────────────────────────────────────────
SYSTEM_PROMPT = """\
You are an API specification extractor. Given a section of a software \
specification document, extract a single REST API endpoint and return \
ONLY a JSON object with these fields:
- endpoint (string, the URL path e.g. /v1/users)
- http_method (string, one of GET POST PUT PATCH DELETE)
- expected_parameters (array of {name, type, required, description})
- inferred_rate_limit (string, e.g. "100 requests/min" or "unknown")
- description (string, one sentence summary)

Return ONLY valid JSON. No explanation. No markdown."""


def _build_prompt(section_title: str, section_body: str) -> str:
    return f"""Section: {section_title}

{section_body}

Extract a single REST API endpoint from this specification.

Return ONLY a valid JSON object with these fields:
- endpoint
- http_method
- expected_parameters
- inferred_rate_limit
- description

Do not include markdown or explanations.
"""

# ── Heuristic fallback (no model needed) ─────────────────────────────────────

_HTTP_METHODS = {"GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"}
_TYPE_MAP = {
    "email": "string", "name": "string", "text": "string",
    "age": "integer", "count": "integer", "id": "integer",
    "price": "number", "amount": "number",
    "active": "boolean", "enabled": "boolean",
}


def _heuristic_extract(title: str, body: str) -> dict:
    """
    Rule-based extraction when the model is unavailable.
    Good enough to demonstrate the pipeline during dev/CI.
    """
    text = f"{title}\n{body}".lower()

    # Detect HTTP method
    method = "GET"
    for m in _HTTP_METHODS:
        if m.lower() in text:
            method = m
            break
    if any(w in text for w in ("create", "register", "add", "submit", "upload")):
        method = "POST"
    elif any(w in text for w in ("update", "edit", "modify")):
        method = "PUT"
    elif any(w in text for w in ("delete", "remove")):
        method = "DELETE"

    # Detect endpoint path from title
    slug = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")
    endpoint = f"/v1/{slug}"

    # Detect parameters from bullet lists
    params = []
    for line in body.splitlines():
        line = line.strip("- •*\t ")
        if not line or len(line) > 60:
            continue
        # lines like "email" or "email (string, required)"
        name_match = re.match(r"^([a-zA-Z_][a-zA-Z0-9_]*)", line)
        if name_match:
            name = name_match.group(1).lower()
            if name in ("fields", "parameters", "input", "output", "returns"):
                continue
            ptype = _TYPE_MAP.get(name, "string")
            required = "optional" not in line.lower()
            params.append({"name": name, "type": ptype, "required": required, "description": ""})

    return {
        "endpoint": endpoint,
        "http_method": method,
        "expected_parameters": params,
        "inferred_rate_limit": "100 requests/min",
        "description": title,
    }


# ── LLM engine ────────────────────────────────────────────────────────────────

class InferenceEngine:
    def __init__(self):
        self._lock = threading.Lock()
        self._llm = None
        self._grammar = None
        self._model_available = False
        self._load_model()

    def _load_model(self):
        try:
            import ollama
            self._client=ollama.Client()
            self._model_available=True
        except Exception:
            logger.warning("Ollama not available. Using heuristic fallback.")
            self._model_available=False

    @property
    def model_available(self) -> bool:
        return self._model_available

    def generate(self, section_title: str, section_body: str) -> dict[str, Any]:
        """
        Run inference for one section. Thread-safe.
        Returns a validated endpoint dict (or heuristic result on failure).
        """
        if not self._model_available:
            return _heuristic_extract(section_title, section_body)
        prompt=_build_prompt(section_title, section_body[:1500])
        print("Prompt length:", len(prompt))
        print(prompt)
        try:
            import ollama
            print("Calling Ollama..."); 
            resp = ollama.chat(model="qwen3.5:latest", messages=[{"role": "system", "content": SYSTEM_PROMPT}, {"role": "user", "content": prompt}], options={"temperature": 0, "num_predict": 512})
            raw = resp["message"]["content"]
        except Exception as e:
            logger.error("Inference error: %s",e);return _heuristic_extract(section_title, section_body)
        from validator import extract_json
        data=extract_json(raw)
        if data is None:return _heuristic_extract(section_title, section_body)
        return data


# Singleton — loaded once at import time
_engine: InferenceEngine | None = None
_engine_lock = threading.Lock()


def get_engine() -> InferenceEngine:
    global _engine
    if _engine is None:
        with _engine_lock:
            if _engine is None:
                _engine = InferenceEngine()
    return _engine
