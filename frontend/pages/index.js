import { useState, useMemo } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function Home() {
  const [file, setFile] = useState(null);
  const [previewSrc, setPreviewSrc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: "class_name", direction: "asc" });

  function onFileChange(e) {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    setResult(null);
    if (f) {
      const url = URL.createObjectURL(f);
      setPreviewSrc(url);
    } else {
      setPreviewSrc(null);
    }
  }

  function onSort(key) {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  }

  const sortedDetections = useMemo(() => {
    if (!result?.detections) return [];
    const arr = [...result.detections];
    const { key, direction } = sortConfig;
    arr.sort((a, b) => {
      let va = a[key];
      let vb = b[key];
      // if sorting by bbox (array), convert to x1
      if (key === "bbox") {
        va = a.bbox[0];
        vb = b.bbox[0];
      }
      if (typeof va === "string") {
        return direction === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
      }
      if (typeof va === "number") {
        return direction === "asc" ? va - vb : vb - va;
      }
      return 0;
    });
    return arr;
  }, [result, sortConfig]);

  async function onDetect() {
    if (!file) return;
    setLoading(true);
    setResult(null);

    const form = new FormData();
    form.append("file", file, file.name);

    try {
      const res = await fetch(`${API_BASE}/api/images/upload`, {
        method: "POST",
        body: form
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: "unknown error" }));
        alert("Upload failed: " + (err.detail || JSON.stringify(err)));
        setLoading(false);
        return;
      }
      const data = await res.json();
      // data.annotated_url is a relative path like /static/annotated/xxx.png
      // Convert to absolute:
      const annotated_url = data.annotated_url
        ? (data.annotated_url.startsWith("http") ? data.annotated_url : `${API_BASE}${data.annotated_url}`)
        : null;

      setResult({
        ...data,
        annotated_url
      });
    } catch (e) {
      alert("Network error: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: "32px auto", fontFamily: "system-ui, sans-serif" }}>
      <h1>Image Upload & YOLO Detection</h1>

      <div style={{ marginBottom: 16 }}>
        <input type="file" accept="image/*" onChange={onFileChange} />
      </div>

      {previewSrc && (
        <div style={{ marginBottom: 12 }}>
          <div>Selected image preview:</div>
          <img src={previewSrc} alt="preview" style={{ maxWidth: "100%", height: "auto", border: "1px solid #ddd" }} />
        </div>
      )}

      <div style={{ marginBottom: 24 }}>
        <button
          onClick={onDetect}
          disabled={!file || loading}
          style={{
            padding: "8px 16px",
            background: "#0066ff",
            color: "white",
            border: "none",
            borderRadius: 6,
            cursor: !file || loading ? "not-allowed" : "pointer"
          }}
        >
          {loading ? "Detecting..." : "Detect Objects"}
        </button>
      </div>

      {result && (
        <div>
          <h2>Results</h2>

          <div style={{ marginBottom: 16 }}>
            <div>Annotated image:</div>
            {result.annotated_url ? (
              <img
                src={result.annotated_url}
                alt="annotated"
                style={{ maxWidth: "100%", height: "auto", border: "1px solid #ddd" }}
              />
            ) : (
              <div>No annotated image returned.</div>
            )}
          </div>

          <div>
            <h3>Detections</h3>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th onClick={() => onSort("class_name")} style={{ cursor: "pointer", textAlign: "left" }}>
                    Class {sortConfig.key === "class_name" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
                  </th>
                  <th onClick={() => onSort("bbox")} style={{ cursor: "pointer", textAlign: "left" }}>
                    x1 {sortConfig.key === "bbox" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
                  </th>
                  <th style={{ textAlign: "left" }}>y1</th>
                  <th style={{ textAlign: "left" }}>x2</th>
                  <th style={{ textAlign: "left" }}>y2</th>
                  <th onClick={() => onSort("confidence")} style={{ cursor: "pointer", textAlign: "left" }}>
                    Confidence {sortConfig.key === "confidence" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedDetections.length === 0 ? (
                  <tr>
                    <td colSpan="6">No detections</td>
                  </tr>
                ) : (
                  sortedDetections.map((d, idx) => (
                    <tr key={idx} style={{ borderTop: "1px solid #eee" }}>
                      <td style={{ padding: "8px 4px" }}>{d.class_name}</td>
                      <td style={{ padding: "8px 4px" }}>{d.bbox[0].toFixed(1)}</td>
                      <td style={{ padding: "8px 4px" }}>{d.bbox[1].toFixed(1)}</td>
                      <td style={{ padding: "8px 4px" }}>{d.bbox[2].toFixed(1)}</td>
                      <td style={{ padding: "8px 4px" }}>{d.bbox[3].toFixed(1)}</td>
                      <td style={{ padding: "8px 4px" }}>{(d.confidence * 100).toFixed(1)}%</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
