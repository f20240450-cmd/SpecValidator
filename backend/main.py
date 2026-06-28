"""
main.py — FastAPI backend for SpecValidator.

Endpoints:
  POST /api/validate   — upload a file, returns job_id
  GET  /api/stream/{job_id} — SSE stream of per-section progress
  GET  /api/result/{job_id} — fetch final OpenAPI JSON
  GET  /api/status     — health + model availability
"""
from __future__ import annotations

import asyncio
import json
import logging
import os
import tempfile
import time
import uuid
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from typing import Any

import yaml
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse

from backend.inference import get_engine
from backend.parser import Section, parse_file
from backend.validator import build_openapi, validate_endpoint, extract_json

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="SpecValidator API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── In-memory job store (sufficient for local single-user app) ────────────────
# Schema: { job_id: { "status": str, "events": [], "result": dict | None } }
_jobs: dict[str, dict[str, Any]] = {}
_executor = ThreadPoolExecutor(max_workers=max(1, (os.cpu_count() or 4) // 2))

ALLOWED_EXTENSIONS = {".md", ".txt", ".pdf", ".docx", ".doc"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


# ── Health ────────────────────────────────────────────────────────────────────

@app.get("/api/status")
def status():
    engine = get_engine()
    return {
        "status": "ok",
        "model_available": engine.model_available,
        "model_mode": "llama.cpp (Phi-4-mini Q4_K_M)" if engine.model_available else "heuristic fallback",
        "offline": True,
    }


# ── Upload & process ──────────────────────────────────────────────────────────

def _process_job(job_id: str, sections: list[Section], doc_title: str):
    """
    Background worker: process all sections, emit events into job store.
    Graceful failure: individual section errors don't abort the job.
    """
    job = _jobs[job_id]
    job["status"] = "processing"
    engine = get_engine()
    valid_endpoints: list[dict] = []

    def _emit(event: dict):
        job["events"].append(event)

    _emit({"type": "start", "total": len(sections), "doc": doc_title})

    futures = {
        _executor.submit(engine.generate, s.title, s.body): s
        for s in sections
    }

    completed = 0
    for future in as_completed(futures):
        section = futures[future]
        completed += 1
        try:
            result = future.result(timeout=120)
            ok, err = validate_endpoint(result)

            _emit({
                "type": "section",
                "index": section.index,
                "title": section.title,
                "completed": completed,
                "total": len(sections),
                "valid": ok,
                "error": err,
                "data": result if ok else None,
            })

            if ok:
                valid_endpoints.append(result)
            else:
                logger.warning("Section '%s' failed validation: %s", section.title, err)

        except Exception as e:
            logger.error("Section '%s' processing error: %s", section.title, e)
            _emit({
                "type": "section",
                "index": section.index,
                "title": section.title,
                "completed": completed,
                "total": len(sections),
                "valid": False,
                "error": str(e),
                "data": None,
            })

    # Build OpenAPI document
    openapi = build_openapi(doc_title, valid_endpoints)
    openapi_yaml = yaml.dump(openapi, default_flow_style=False, allow_unicode=True)

    job["result"] = {
        "openapi_json": openapi,
        "openapi_yaml": openapi_yaml,
        "sections_total": len(sections),
        "sections_valid": len(valid_endpoints),
        "endpoints": valid_endpoints,
    }
    job["status"] = "done"
    _emit({"type": "done", "sections_valid": len(valid_endpoints), "sections_total": len(sections)})


@app.post("/api/validate")
async def validate_file(file: UploadFile = File(...)):
    suffix = Path(file.filename or "upload.md").suffix.lower()
    if suffix not in ALLOWED_EXTENSIONS:
        raise HTTPException(400, f"Unsupported file type '{suffix}'. Allowed: {', '.join(ALLOWED_EXTENSIONS)}")

    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(413, "File too large (max 10 MB).")

    # Write to temp file for parser
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp.write(content)
        tmp_path = Path(tmp.name)

    try:
        sections = parse_file(tmp_path)
    except Exception as e:
        tmp_path.unlink(missing_ok=True)
        raise HTTPException(422, f"Failed to parse file: {e}")
    finally:
        tmp_path.unlink(missing_ok=True)

    if not sections:
        raise HTTPException(422, "No processable sections found in the document.")

    job_id = str(uuid.uuid4())
    _jobs[job_id] = {"status": "queued", "events": [], "result": None}

    doc_title = Path(file.filename or "document").stem
    loop = asyncio.get_event_loop()
    loop.run_in_executor(None, _process_job, job_id, sections, doc_title)

    return {"job_id": job_id, "sections": len(sections)}


# ── SSE stream ────────────────────────────────────────────────────────────────

@app.get("/api/stream/{job_id}")
async def stream_job(job_id: str):
    if job_id not in _jobs:
        raise HTTPException(404, "Job not found.")

    async def _generator():
        sent = 0
        while True:
            job = _jobs[job_id]
            events = job["events"]
            while sent < len(events):
                yield f"data: {json.dumps(events[sent])}\n\n"
                sent += 1
            if job["status"] == "done":
                break
            await asyncio.sleep(0.2)

    return StreamingResponse(_generator(), media_type="text/event-stream")


# ── Result ────────────────────────────────────────────────────────────────────

@app.get("/api/result/{job_id}")
def get_result(job_id: str):
    job = _jobs.get(job_id)
    if not job:
        raise HTTPException(404, "Job not found.")
    if job["status"] != "done":
        raise HTTPException(202, "Job still processing.")
    return JSONResponse(job["result"])
