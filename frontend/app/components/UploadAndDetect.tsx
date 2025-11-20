"use client";

import { useState } from "react";

export default function UploadAndDetect() {
  const [image, setImage] = useState<File | null>(null);
  const [annotatedUrl, setAnnotatedUrl] = useState<string | null>(null);
  const [detections, setDetections] = useState<any[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);

  const uploadImage = async () => {
    if (!image) return;

    const formData = new FormData();
    formData.append("file", image);

    const res = await fetch("http://localhost:8000/api/images/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setAnnotatedUrl(`http://localhost:8000${data.annotated_url}`);
    setDetections(data.detections);
  };

  const sortTable = (key: string) => {
    let direction: "asc" | "desc" = "asc";

    if (sortConfig?.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }

    const sorted = [...detections].sort((a, b) => {
      if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
      if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
      return 0;
    });

    setSortConfig({ key, direction });
    setDetections(sorted);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">YOLO Object Detection</h1>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImage(e.target.files?.[0] || null)}
        className="border p-2 rounded"
      />

      <button
        onClick={uploadImage}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Upload & Detect
      </button>

      {annotatedUrl && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Annotated Image</h2>
          <img src={annotatedUrl} alt="Annotated" className="border rounded" />
        </div>
      )}

      {detections.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Detection Results</h2>

          <table className="w-full border text-left">
            <thead className="bg-gray-100">
              <tr>
                <th
                  className="p-2 cursor-pointer"
                  onClick={() => sortTable("class_name")}
                >
                  Class
                </th>
                <th
                  className="p-2 cursor-pointer"
                  onClick={() => sortTable("confidence")}
                >
                  Confidence
                </th>
                <th className="p-2">Bounding Box</th>
              </tr>
            </thead>

            <tbody>
              {detections.map((det, i) => (
                <tr key={i} className="border-t">
                  <td className="p-2">{det.class_name}</td>
                  <td className="p-2">{det.confidence.toFixed(3)}</td>
                  <td className="p-2">
                    [{det.bbox.map((v: number) => v.toFixed(1)).join(", ")}]
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
