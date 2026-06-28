import React, { useState, useRef, useEffect, useCallback } from "react";

// ── Global Styles ─────────────────────────────────────────────────────────────
const css = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #0a0a0f;
    --surface: #111118;
    --surface2: #16161f;
    --border: #1e1e2e;
    --border2: #2a2a3e;
    --text: #e8e8f0;
    --muted: #6b6b8a;
    --muted2: #4a4a6a;
    --purple: #7c6cf8;
    --teal: #2dd4bf;
    --orange: #fb923c;
    --green: #22d3a5;
    --red: #f87171;
    --grad: linear-gradient(135deg, #7c6cf8, #2dd4bf);
    --grad2: linear-gradient(135deg, #7c6cf8 0%, #c084fc 50%, #fb923c 100%);
  }

  html, body {
    height: 100%;
    background: var(--bg);
    color: var(--text);
    font-family: 'Inter', system-ui, sans-serif;
    font-size: 14px;
    line-height: 1.6;
    overflow-x: hidden;
  }

  /* Ambient glow blobs */
  body::before {
    content: '';
    position: fixed;
    top: -30%;
    left: 50%;
    transform: translateX(-50%);
    width: 800px;
    height: 500px;
    background: radial-gradient(ellipse at center, rgba(124,108,248,0.08) 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
  }
  body::after {
    content: '';
    position: fixed;
    bottom: -20%;
    right: -10%;
    width: 500px;
    height: 400px;
    background: radial-gradient(ellipse at center, rgba(45,212,191,0.06) 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
  }

  /* NAV */
  .sv-nav {
    position: sticky;
    top: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 2.5rem;
    border-bottom: 1px solid var(--border);
    background: rgba(10,10,15,0.85);
    backdrop-filter: blur(20px);
  }
  .sv-nav-logo {
    font-size: 1.1rem;
    font-weight: 800;
    letter-spacing: -0.5px;
    background: var(--grad);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .sv-nav-links {
    display: flex;
    gap: 2rem;
  }
  .sv-nav-links a {
    color: var(--muted);
    font-size: 0.8rem;
    font-weight: 500;
    text-decoration: none;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    cursor: pointer;
    transition: color 0.2s;
  }
  .sv-nav-links a:hover { color: var(--text); }
  .sv-nav-badge {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.72rem;
    color: var(--muted);
  }
  .sv-status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--green);
    flex-shrink: 0;
    animation: sv-pulse 2s infinite;
  }
  @keyframes sv-pulse {
    0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(34,211,165,0.4); }
    50%       { opacity: 0.8; box-shadow: 0 0 0 6px rgba(34,211,165,0); }
  }
  @keyframes sv-spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }

  /* HERO */
  .sv-hero {
    padding: 5rem 2.5rem 3rem;
    max-width: 920px;
    margin: 0 auto;
    position: relative;
    z-index: 1;
  }
  .sv-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--purple);
    border: 1px solid rgba(124,108,248,0.3);
    border-radius: 999px;
    padding: 0.3rem 0.9rem;
    margin-bottom: 1.75rem;
    background: rgba(124,108,248,0.06);
  }
  .sv-hero h1 {
    font-size: clamp(2.8rem, 6vw, 5rem);
    font-weight: 900;
    line-height: 1.05;
    letter-spacing: -2px;
    margin-bottom: 1.25rem;
  }
  .sv-grad-text {
    background: var(--grad2);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .sv-hero-sub {
    font-size: 1rem;
    color: var(--muted);
    max-width: 520px;
    line-height: 1.7;
    margin-bottom: 2rem;
  }
  .sv-tags { display: flex; flex-wrap: wrap; gap: 0.5rem; }
  .sv-tag {
    font-size: 0.68rem;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    padding: 0.3rem 0.75rem;
    border-radius: 999px;
    border: 1px solid var(--border2);
    color: var(--muted);
  }

  /* MAIN */
  .sv-main {
    max-width: 920px;
    margin: 0 auto;
    padding: 0 2.5rem 4rem;
    position: relative;
    z-index: 1;
  }

  /* SECTION LABEL */
  .sv-section-label {
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--muted2);
    margin-bottom: 1.25rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  .sv-section-label::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--border);
  }

  /* CARD */
  .sv-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 1.75rem;
    margin-bottom: 1.25rem;
    transition: border-color 0.25s;
  }
  .sv-card:hover { border-color: var(--border2); }
  .sv-card-accent {
    border-color: rgba(124,108,248,0.2);
    background: linear-gradient(160deg, rgba(124,108,248,0.04) 0%, var(--surface) 60%);
  }

  /* DROP ZONE */
  .sv-drop {
    border: 1.5px dashed var(--border2);
    border-radius: 12px;
    padding: 3rem 2rem;
    text-align: center;
    cursor: pointer;
    transition: all 0.25s;
    background: var(--surface2);
    user-select: none;
  }
  .sv-drop:hover, .sv-drop.drag {
    border-color: var(--purple);
    background: rgba(124,108,248,0.05);
  }
  .sv-drop-icon {
    width: 52px;
    height: 52px;
    border-radius: 14px;
    background: rgba(124,108,248,0.12);
    border: 1px solid rgba(124,108,248,0.25);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1rem;
    font-size: 1.5rem;
  }
  .sv-drop-title { font-size: 1rem; font-weight: 600; margin-bottom: 0.35rem; }
  .sv-drop-sub   { font-size: 0.8rem; color: var(--muted); }

  /* FILE PILL */
  .sv-file-pill {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 1rem;
    padding: 0.4rem 0.9rem;
    background: rgba(124,108,248,0.1);
    border: 1px solid rgba(124,108,248,0.25);
    border-radius: 999px;
    font-size: 0.8rem;
    color: var(--purple);
  }

  /* ERROR */
  .sv-error {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    background: rgba(248,113,113,0.08);
    border: 1px solid rgba(248,113,113,0.25);
    border-radius: 10px;
    padding: 0.9rem 1.1rem;
    color: #fca5a5;
    font-size: 0.82rem;
    margin-top: 0.75rem;
  }

  /* BUTTONS */
  .sv-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.65rem 1.5rem;
    border: none;
    border-radius: 10px;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    font-family: 'Inter', sans-serif;
    letter-spacing: 0.01em;
  }
  .sv-btn:disabled { opacity: 0.3; cursor: not-allowed; transform: none !important; }
  .sv-btn-primary {
    background: linear-gradient(135deg, #7c6cf8, #2dd4bf);
    color: #fff;
  }
  .sv-btn-primary:not(:disabled):hover {
    opacity: 0.85;
    transform: translateY(-1px);
    box-shadow: 0 4px 20px rgba(124,108,248,0.3);
  }
  .sv-btn-ghost {
    background: transparent;
    color: var(--muted);
    border: 1px solid var(--border2);
  }
  .sv-btn-ghost:hover { background: var(--surface2); color: var(--text); }

  /* PROGRESS */
  .sv-progress-wrap {
    height: 3px;
    background: var(--border);
    border-radius: 999px;
    overflow: hidden;
    margin-bottom: 1.5rem;
  }
  .sv-progress-bar {
    height: 100%;
    background: linear-gradient(90deg, #7c6cf8, #2dd4bf);
    border-radius: 999px;
    transition: width 0.4s ease;
  }

  /* SECTIONS LIST */
  .sv-sections {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    max-height: 280px;
    overflow-y: auto;
  }
  .sv-sections::-webkit-scrollbar { width: 4px; }
  .sv-sections::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 4px; }
  .sv-section-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.55rem 0.9rem;
    border-radius: 8px;
    background: var(--surface2);
    transition: background 0.15s;
  }
  .sv-section-row:hover { background: var(--border); }
  .sv-section-name {
    flex: 1;
    font-size: 0.82rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--text);
  }
  .sv-chip {
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    padding: 0.2rem 0.65rem;
    border-radius: 999px;
    flex-shrink: 0;
  }
  .sv-chip-ok  { background: rgba(34,211,165,0.12);  color: #22d3a5; border: 1px solid rgba(34,211,165,0.25); }
  .sv-chip-err { background: rgba(248,113,113,0.1);  color: #f87171; border: 1px solid rgba(248,113,113,0.25); }
  .sv-chip-run { background: rgba(124,108,248,0.1);  color: #7c6cf8; border: 1px solid rgba(124,108,248,0.25); }

  /* STATS */
  .sv-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.75rem;
    margin-bottom: 1.5rem;
  }
  .sv-stat {
    background: var(--surface2);
    border-radius: 12px;
    padding: 1.25rem 1rem;
    text-align: center;
    border: 1px solid var(--border);
    transition: border-color 0.2s;
  }
  .sv-stat:hover { border-color: var(--border2); }
  .sv-stat-num   { font-size: 2.2rem; font-weight: 800; letter-spacing: -1.5px; line-height: 1; }
  .sv-stat-label { font-size: 0.68rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--muted); margin-top: 0.35rem; }

  /* TABS */
  .sv-tabs {
    display: flex;
    gap: 0.3rem;
    background: var(--surface2);
    border-radius: 10px;
    padding: 0.3rem;
    margin-bottom: 1rem;
    width: fit-content;
    border: 1px solid var(--border);
  }
  .sv-tab {
    padding: 0.45rem 1.1rem;
    border: none;
    background: transparent;
    color: var(--muted);
    cursor: pointer;
    font-size: 0.8rem;
    font-weight: 600;
    border-radius: 7px;
    transition: all 0.2s;
    font-family: 'Inter', sans-serif;
  }
  .sv-tab.active { background: var(--surface); color: var(--text); box-shadow: 0 1px 6px rgba(0,0,0,0.5); }
  .sv-tab:hover:not(.active) { color: var(--text); }

  /* CODE */
  .sv-code {
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 1.25rem;
    font-family: 'Consolas', 'SF Mono', monospace;
    font-size: 0.76rem;
    line-height: 1.7;
    overflow: auto;
    max-height: 400px;
    color: #b8c0cc;
    white-space: pre;
  }

  /* MODEL STATUS */
  .sv-model-row { display: flex; align-items: center; gap: 0.6rem; font-size: 0.8rem; color: var(--muted); }
  .sv-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
  .sv-dot-green { background: #22d3a5; box-shadow: 0 0 0 3px rgba(34,211,165,0.15); }
  .sv-dot-amber { background: #fb923c; box-shadow: 0 0 0 3px rgba(251,146,60,0.15); }

  .sv-spin { display: inline-block; animation: sv-spin 1s linear infinite; }
  .sv-row  { display: flex; align-items: center; gap: 0.75rem; margin-top: 1.25rem; flex-wrap: wrap; }
`;

const API = process.env.REACT_APP_API_URL || "";

function downloadBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
}

export default function App() {
  const [file, setFileState]      = useState(null);
  const [drag, setDrag]           = useState(false);
  const [phase, setPhase]         = useState("idle");
  const [sections, setSections]   = useState([]);
  const [totalSec, setTotalSec]   = useState(0);
  const [result, setResult]       = useState(null);
  const [error, setError]         = useState("");
  const [modelStatus, setModel]   = useState(null);
  const [tab, setTab]             = useState("json");
  const inputRef = useRef();

  useEffect(() => {
    fetch(`${API}/api/status`)
      .then(r => r.json())
      .then(setModel)
      .catch(() => {});
  }, []);

  const handleFile = useCallback((f) => {
    if (!f) return;
    const ok = [".md", ".txt", ".pdf", ".docx", ".doc"];
    const ext = f.name.slice(f.name.lastIndexOf(".")).toLowerCase();
    if (!ok.includes(ext)) {
      setError(`Unsupported type '${ext}'. Allowed: ${ok.join(", ")}`);
      return;
    }
    setError(""); setFileState(f);
  }, []);

  const handleDrop = (e) => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]); };

  const handleSubmit = async () => {
    if (!file) return;
    setPhase("processing"); setSections([]); setResult(null); setError("");

    const fd = new FormData(); fd.append("file", file);
    let jobId;
    try {
      const res = await fetch(`${API}/api/validate`, { method: "POST", body: fd });
      if (!res.ok) { const err = await res.json(); throw new Error(err.detail || "Upload failed"); }
      const data = await res.json(); jobId = data.job_id; setTotalSec(data.sections);
    } catch (e) { setError(e.message); setPhase("error"); return; }

    const es = new EventSource(`${API}/api/stream/${jobId}`);
    es.onmessage = (e) => {
      const ev = JSON.parse(e.data);
      if (ev.type === "section") {
        setSections(prev => {
          const next = [...prev];
          const idx = next.findIndex(s => s.index === ev.index);
          if (idx >= 0) next[idx] = ev; else next.push(ev);
          return next.sort((a, b) => a.index - b.index);
        });
      }
      if (ev.type === "done") {
        es.close();
        fetch(`${API}/api/result/${jobId}`)
          .then(r => r.json())
          .then(r => { setResult(r); setPhase("done"); })
          .catch(err => { setError(err.message); setPhase("error"); });
      }
    };
    es.onerror = () => { es.close(); setError("Connection to backend lost. Is the server running?"); setPhase("error"); };
  };

  const reset = () => { setFileState(null); setResult(null); setSections([]); setTotalSec(0); setPhase("idle"); setError(""); };
  const progress = totalSec > 0 ? (sections.length / totalSec) * 100 : 0;
  const processing = phase === "processing";

  return (
    <>
      <style>{css}</style>

      {/* NAV */}
      <nav className="sv-nav">
        <div className="sv-nav-logo">SV</div>
        <div className="sv-nav-links">
          <a>Validator</a>
          <a>Docs</a>
          <a>GitHub</a>
        </div>
        <div className="sv-nav-badge">
          <div className="sv-status-dot" />
          <span>Offline · CPU-only</span>
        </div>
      </nav>

      {/* HERO */}
      <div className="sv-hero">
        <div className="sv-eyebrow">⚡ AI-powered spec analysis</div>
        <h1>
          <span className="sv-grad-text">SpecValidator</span><br />
          <span style={{ color: "var(--text)", fontSize: "0.6em", letterSpacing: "-1px", fontWeight: 300, opacity: 0.6 }}>
            Legacy specs → OpenAPI schemas
          </span>
        </h1>
        <p className="sv-hero-sub">
          Drop any Markdown, PDF, or DOCX spec file. Get a structured, validated OpenAPI schema — instantly. No cloud. No data sent anywhere.
        </p>
        <div className="sv-tags">
          {["CPU-only", "No cloud", "OpenAPI 3.0", "Offline-first", "SSE streaming"].map(t => (
            <span key={t} className="sv-tag">{t}</span>
          ))}
        </div>
      </div>

      <main className="sv-main">

        {/* Model status */}
        {modelStatus && (
          <div className="sv-card" style={{ padding: "0.9rem 1.5rem", marginBottom: "1.25rem" }}>
            <div className="sv-model-row">
              <div className={`sv-dot ${modelStatus.model_available ? "sv-dot-green" : "sv-dot-amber"}`} />
              <span>
                {modelStatus.model_available
                  ? `Model ready — ${modelStatus.model_mode}`
                  : "⚠ Model not found — running heuristic fallback. Run: python backend/download_model.py"}
              </span>
            </div>
          </div>
        )}

        {/* Upload */}
        <div className="sv-section-label">Upload specification</div>
        <div className="sv-card sv-card-accent">
          <div
            className={`sv-drop${drag ? " drag" : ""}`}
            onClick={() => inputRef.current.click()}
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={handleDrop}
          >
            <div className="sv-drop-icon">📂</div>
            <div className="sv-drop-title">Drop a spec file here</div>
            <div className="sv-drop-sub">or click to browse &nbsp;·&nbsp; .md &nbsp;·&nbsp; .txt &nbsp;·&nbsp; .pdf &nbsp;·&nbsp; .docx</div>
            <input
              ref={inputRef} type="file" accept=".md,.txt,.pdf,.docx,.doc"
              style={{ display: "none" }}
              onChange={(e) => handleFile(e.target.files[0])}
            />
          </div>

          {file && (
            <div className="sv-file-pill">📎 {file.name} &nbsp;({(file.size / 1024).toFixed(1)} KB)</div>
          )}
          {error && (
            <div className="sv-error"><span>✕</span> {error}</div>
          )}

          <div className="sv-row">
            <button
              className="sv-btn sv-btn-primary"
              disabled={!file || processing}
              onClick={handleSubmit}
            >
              {processing
                ? <><span className="sv-spin">⟳</span> Processing…</>
                : <><span>✦</span> Extract API schema</>}
            </button>
          </div>
        </div>

        {/* Progress */}
        {(processing || phase === "done") && (
          <div className="sv-card">
            <div className="sv-section-label">Processing sections</div>
            <div className="sv-progress-wrap">
              <div className="sv-progress-bar" style={{ width: `${phase === "done" ? 100 : progress}%` }} />
            </div>
            <div className="sv-sections">
              {sections.map(s => (
                <div key={s.index} className="sv-section-row">
                  <span style={{ fontSize: "1rem", color: s.valid ? "#22d3a5" : "#f87171" }}>{s.valid ? "✓" : "✕"}</span>
                  <span className="sv-section-name">{s.title}</span>
                  <span className={`sv-chip ${s.valid ? "sv-chip-ok" : "sv-chip-err"}`}>{s.valid ? "valid" : s.error || "invalid"}</span>
                </div>
              ))}
              {processing && sections.length < totalSec && (
                <div className="sv-section-row">
                  <span style={{ color: "var(--muted)", fontSize: "1rem" }}>…</span>
                  <span className="sv-section-name" style={{ color: "var(--muted)" }}>Processing {totalSec - sections.length} more…</span>
                  <span className="sv-chip sv-chip-run">running</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Result */}
        {phase === "done" && result && (
          <div className="sv-card">
            <div className="sv-section-label">Generated schema</div>

            <div className="sv-stats">
              <div className="sv-stat">
                <div className="sv-stat-num" style={{ color: "#7c6cf8" }}>{result.sections_total}</div>
                <div className="sv-stat-label">Sections parsed</div>
              </div>
              <div className="sv-stat">
                <div className="sv-stat-num" style={{ color: "#22d3a5" }}>{result.sections_valid}</div>
                <div className="sv-stat-label">Valid endpoints</div>
              </div>
              <div className="sv-stat">
                <div className="sv-stat-num" style={{ color: "#f87171" }}>{result.sections_total - result.sections_valid}</div>
                <div className="sv-stat-label">Skipped</div>
              </div>
            </div>

            <div className="sv-tabs">
              {[["json", "OpenAPI JSON"], ["yaml", "YAML"], ["endpoints", "Endpoints"]].map(([key, label]) => (
                <button
                  key={key}
                  className={`sv-tab${tab === key ? " active" : ""}`}
                  onClick={() => setTab(key)}
                >{label}</button>
              ))}
            </div>

            <pre className="sv-code">
              {tab === "json"      && JSON.stringify(result.openapi_json, null, 2)}
              {tab === "yaml"      && result.openapi_yaml}
              {tab === "endpoints" && JSON.stringify(result.endpoints, null, 2)}
            </pre>

            <div className="sv-row" style={{ marginTop: "1.25rem" }}>
              <button className="sv-btn sv-btn-ghost" onClick={() => downloadBlob(new Blob([JSON.stringify(result.openapi_json, null, 2)], { type: "application/json" }), "openapi.json")}>
                ⬇ Download JSON
              </button>
              <button className="sv-btn sv-btn-ghost" onClick={() => downloadBlob(new Blob([result.openapi_yaml], { type: "text/yaml" }), "openapi.yaml")}>
                ⬇ Download YAML
              </button>
              <button className="sv-btn sv-btn-ghost" onClick={reset}>
                ↺ New file
              </button>
            </div>
          </div>
        )}

      </main>
    </>
  );
}
