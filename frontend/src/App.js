import React, { useState, useRef, useEffect, useCallback } from "react";

// ── Styles ────────────────────────────────────────────────────────────────────
const css = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', system-ui, sans-serif; background: #0d1117; color: #e6edf3; min-height: 100vh; }
  .app { max-width: 900px; margin: 0 auto; padding: 2rem 1rem; }
  .header { text-align: center; margin-bottom: 2rem; }
  .header h1 { font-size: 2rem; color: #58a6ff; letter-spacing: -0.5px; }
  .header p { color: #8b949e; margin-top: 0.4rem; font-size: 0.95rem; }
  .badge { display: inline-block; background: #1f3a1f; color: #3fb950; border: 1px solid #3fb950; border-radius: 999px; font-size: 0.72rem; padding: 2px 10px; margin-top: 8px; }
  .card { background: #161b22; border: 1px solid #30363d; border-radius: 10px; padding: 1.5rem; margin-bottom: 1.25rem; }
  .card h2 { font-size: 1rem; color: #8b949e; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 1rem; }
  .drop-zone { border: 2px dashed #30363d; border-radius: 8px; padding: 3rem 1rem; text-align: center; cursor: pointer; transition: border-color 0.2s, background 0.2s; }
  .drop-zone:hover, .drop-zone.drag { border-color: #58a6ff; background: #0d1f3c; }
  .drop-zone p { color: #8b949e; margin-top: 0.5rem; font-size: 0.9rem; }
  .drop-zone .icon { font-size: 2.5rem; }
  .file-info { margin-top: 0.75rem; padding: 0.6rem 1rem; background: #0d1117; border-radius: 6px; font-size: 0.85rem; color: #58a6ff; }
  .btn { display: inline-block; padding: 0.6rem 1.5rem; border: none; border-radius: 6px; font-size: 0.9rem; font-weight: 600; cursor: pointer; transition: background 0.2s; }
  .btn-primary { background: #238636; color: #fff; }
  .btn-primary:hover { background: #2ea043; }
  .btn-primary:disabled { background: #21262d; color: #484f58; cursor: not-allowed; }
  .btn-outline { background: transparent; color: #58a6ff; border: 1px solid #30363d; margin-right: 0.5rem; }
  .btn-outline:hover { background: #161b22; }
  .progress-bar-wrap { background: #21262d; border-radius: 999px; height: 8px; overflow: hidden; margin-bottom: 1rem; }
  .progress-bar { height: 100%; background: linear-gradient(90deg, #238636, #58a6ff); border-radius: 999px; transition: width 0.3s; }
  .section-list { display: flex; flex-direction: column; gap: 0.5rem; max-height: 300px; overflow-y: auto; }
  .section-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem 0.75rem; background: #0d1117; border-radius: 6px; font-size: 0.85rem; }
  .section-icon { font-size: 1rem; flex-shrink: 0; }
  .section-title { flex: 1; color: #e6edf3; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .section-badge { font-size: 0.72rem; padding: 2px 8px; border-radius: 999px; flex-shrink: 0; }
  .badge-valid { background: #1f3a1f; color: #3fb950; }
  .badge-invalid { background: #3a1f1f; color: #f78166; }
  .badge-processing { background: #1f2a3a; color: #58a6ff; }
  .stat-row { display: flex; gap: 1rem; margin-bottom: 1rem; }
  .stat { flex: 1; background: #0d1117; border-radius: 8px; padding: 0.75rem 1rem; text-align: center; }
  .stat-num { font-size: 1.75rem; font-weight: 700; color: #58a6ff; }
  .stat-label { font-size: 0.75rem; color: #8b949e; margin-top: 2px; }
  .code-block { background: #0d1117; border: 1px solid #21262d; border-radius: 8px; padding: 1rem; font-family: 'Consolas', monospace; font-size: 0.78rem; line-height: 1.6; overflow: auto; max-height: 400px; color: #e6edf3; white-space: pre; }
  .tab-row { display: flex; gap: 0.5rem; margin-bottom: 1rem; }
  .tab { padding: 0.4rem 1rem; border-radius: 6px; border: 1px solid #30363d; background: transparent; color: #8b949e; cursor: pointer; font-size: 0.85rem; }
  .tab.active { background: #1f3a5a; color: #58a6ff; border-color: #58a6ff; }
  .model-status { display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; color: #8b949e; }
  .dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
  .dot-green { background: #3fb950; }
  .dot-yellow { background: #d29922; }
  .error-box { background: #3a1f1f; border: 1px solid #f78166; border-radius: 8px; padding: 1rem; color: #f78166; font-size: 0.875rem; }
`;

const API = process.env.REACT_APP_API_URL || "";  // proxied via CRA

// ── Helpers ───────────────────────────────────────────────────────────────────
function downloadJSON(data, name) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
}

function downloadText(text, name, mime = "text/plain") {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [file, setFile] = useState(null);
  const [drag, setDrag] = useState(false);
  const [phase, setPhase] = useState("idle"); // idle | processing | done | error
  const [sections, setSections] = useState([]);
  const [totalSections, setTotalSections] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [modelStatus, setModelStatus] = useState(null);
  const [tab, setTab] = useState("json");
  const inputRef = useRef();

  // Poll model status on mount
  useEffect(() => {
    fetch(`${API}/api/status`)
      .then(r => r.json())
      .then(setModelStatus)
      .catch(() => {});
  }, []);

  const handleFile = useCallback((f) => {
    if (!f) return;
    const ok = [".md", ".txt", ".pdf", ".docx", ".doc"];
    const ext = f.name.slice(f.name.lastIndexOf(".")).toLowerCase();
    if (!ok.includes(ext)) {
      setError(`Unsupported file type '${ext}'. Allowed: ${ok.join(", ")}`);
      return;
    }
    setError("");
    setFile(f);
  }, []);

  const handleDrop = (e) => {
    e.preventDefault(); setDrag(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = async () => {
    if (!file) return;
    setPhase("processing");
    setSections([]);
    setResult(null);
    setError("");

    const fd = new FormData();
    fd.append("file", file);

    let jobId;
    try {
      const res = await fetch(`${API}/api/validate`, { method: "POST", body: fd });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Upload failed");
      }
      const data = await res.json();
      jobId = data.job_id;
      setTotalSections(data.sections);
    } catch (e) {
      setError(e.message);
      setPhase("error");
      return;
    }

    // SSE stream
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
    es.onerror = () => {
      es.close();
      setError("Connection to backend lost. Is the server running?");
      setPhase("error");
    };
  };

  const progress = totalSections > 0 ? (sections.length / totalSections) * 100 : 0;

  return (
    <>
      <style>{css}</style>
      <div className="app">
        {/* Header */}
        <div className="header">
          <h1>⚙️ SpecValidator</h1>
          <p>Legacy Markdown Specs → Structured OpenAPI Schemas</p>
          <span className="badge">🔌 Offline-first · CPU-only · No cloud</span>
        </div>

        {/* Model status */}
        {modelStatus && (
          <div className="card" style={{ padding: "0.75rem 1.25rem" }}>
            <div className="model-status">
              <div className={`dot ${modelStatus.model_available ? "dot-green" : "dot-yellow"}`} />
              <span>
                {modelStatus.model_available
                  ? `Model: ${modelStatus.model_mode}`
                  : "⚠️ Model not found — running heuristic fallback. Run: python backend/download_model.py"}
              </span>
            </div>
          </div>
        )}

        {/* Upload */}
        <div className="card">
          <h2>📄 Upload Specification</h2>
          <div
            className={`drop-zone ${drag ? "drag" : ""}`}
            onClick={() => inputRef.current.click()}
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={handleDrop}
          >
            <div className="icon">📂</div>
            <p>Drop a file here or click to browse</p>
            <p style={{ fontSize: "0.8rem", marginTop: "0.25rem" }}>.md · .txt · .pdf · .docx</p>
            <input
              ref={inputRef} type="file"
              accept=".md,.txt,.pdf,.docx,.doc"
              style={{ display: "none" }}
              onChange={(e) => handleFile(e.target.files[0])}
            />
          </div>
          {file && <div className="file-info">📎 {file.name} ({(file.size / 1024).toFixed(1)} KB)</div>}
          {error && <div className="error-box" style={{ marginTop: "0.75rem" }}>❌ {error}</div>}
          <div style={{ marginTop: "1rem" }}>
            <button
              className="btn btn-primary"
              disabled={!file || phase === "processing"}
              onClick={handleSubmit}
            >
              {phase === "processing" ? "⏳ Processing…" : "🚀 Extract API Schema"}
            </button>
          </div>
        </div>

        {/* Progress */}
        {(phase === "processing" || phase === "done") && (
          <div className="card">
            <h2>📊 Processing Sections</h2>
            <div className="progress-bar-wrap">
              <div className="progress-bar" style={{ width: `${phase === "done" ? 100 : progress}%` }} />
            </div>
            <div className="section-list">
              {sections.map((s) => (
                <div key={s.index} className="section-item">
                  <span className="section-icon">{s.valid ? "✅" : "❌"}</span>
                  <span className="section-title">{s.title}</span>
                  <span className={`section-badge ${s.valid ? "badge-valid" : "badge-invalid"}`}>
                    {s.valid ? "valid" : s.error || "invalid"}
                  </span>
                </div>
              ))}
              {phase === "processing" && sections.length < totalSections && (
                <div className="section-item">
                  <span className="section-icon">⏳</span>
                  <span className="section-title" style={{ color: "#8b949e" }}>
                    Processing {totalSections - sections.length} remaining…
                  </span>
                  <span className="section-badge badge-processing">running</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Result */}
        {phase === "done" && result && (
          <div className="card">
            <h2>✅ Generated OpenAPI Schema</h2>
            <div className="stat-row">
              <div className="stat">
                <div className="stat-num">{result.sections_total}</div>
                <div className="stat-label">Sections Parsed</div>
              </div>
              <div className="stat">
                <div className="stat-num" style={{ color: "#3fb950" }}>{result.sections_valid}</div>
                <div className="stat-label">Valid Endpoints</div>
              </div>
              <div className="stat">
                <div className="stat-num" style={{ color: "#f78166" }}>
                  {result.sections_total - result.sections_valid}
                </div>
                <div className="stat-label">Skipped</div>
              </div>
            </div>

            <div className="tab-row">
              <button className={`tab ${tab === "json" ? "active" : ""}`} onClick={() => setTab("json")}>OpenAPI JSON</button>
              <button className={`tab ${tab === "yaml" ? "active" : ""}`} onClick={() => setTab("yaml")}>YAML</button>
              <button className={`tab ${tab === "endpoints" ? "active" : ""}`} onClick={() => setTab("endpoints")}>Endpoints</button>
            </div>

            {tab === "json" && (
              <pre className="code-block">{JSON.stringify(result.openapi_json, null, 2)}</pre>
            )}
            {tab === "yaml" && (
              <pre className="code-block">{result.openapi_yaml}</pre>
            )}
            {tab === "endpoints" && (
              <pre className="code-block">{JSON.stringify(result.endpoints, null, 2)}</pre>
            )}

            <div style={{ marginTop: "1rem" }}>
              <button className="btn btn-outline" onClick={() => downloadJSON(result.openapi_json, "openapi.json")}>
                ⬇️ Download JSON
              </button>
              <button className="btn btn-outline" onClick={() => downloadText(result.openapi_yaml, "openapi.yaml", "text/yaml")}>
                ⬇️ Download YAML
              </button>
              <button className="btn btn-outline" onClick={() => { setPhase("idle"); setFile(null); setResult(null); setSections([]); }}>
                🔄 New File
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
