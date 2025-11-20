"use client";

import { useState, useRef } from "react";

export default function UploadAndDetect() {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [annotatedUrl, setAnnotatedUrl] = useState<string | null>(null);
  const [detections, setDetections] = useState<any[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadImage = async () => {
    if (!image) return;

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", image);

      const res = await fetch("http://localhost:8000/api/images/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setAnnotatedUrl(`http://localhost:8000${data.annotated_url}`);
      setDetections(data.detections);
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setIsLoading(false);
    }
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

  const handleFileSelect = (file: File | null) => {
    setImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
    // Clear previous results when selecting a new image
    setAnnotatedUrl(null);
    setDetections([]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const confidencePercentage = (conf: number) => Math.round(conf * 100);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Upload Section */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold mb-2">Upload Image for Detection</h1>
          <p className="text-gray-600">Upload an image to detect objects using our advanced YOLO model</p>
        </div>

        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-12 bg-gray-50 hover:border-blue-400 transition-colors cursor-pointer"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
        >
          {imagePreview ? (
            <div className="flex flex-col items-center justify-center space-y-4">
              <img
                src={imagePreview}
                alt="Selected"
                className="max-w-full max-h-64 rounded-lg border-2 border-gray-200"
              />
              <p className="text-gray-600 text-center font-medium">{image?.name || "Selected image"}</p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Change Image
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-4">
              {/* Upload Icon */}
              <svg
                className="w-16 h-16 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p className="text-gray-600 text-center">
                Drop your image here or click to browse (PNG, JPG, JPEG up to 10MB)
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Select Image
              </button>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
          className="hidden"
        />

        {/* Detect Objects Button */}
        <div className="flex justify-center">
          <button
            onClick={uploadImage}
            disabled={!image || isLoading}
            className={`px-8 py-3 rounded-md font-semibold text-white transition-colors ${
              !image || isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isLoading ? "Detecting Objects..." : "Detect Objects"}
          </button>
        </div>
      </div>

      {/* Results Section */}
      {(annotatedUrl || detections.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Annotated Image Section */}
          {annotatedUrl && (
            <div className="bg-white border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Annotated Image</h2>
                {detections.length > 0 && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {detections.length} Objects
                  </span>
                )}
              </div>
              <div className="bg-gray-50 rounded border p-4 flex items-center justify-center min-h-[300px]">
                <img
                  src={annotatedUrl}
                  alt="Annotated"
                  className="max-w-full max-h-[500px] rounded"
                />
              </div>
            </div>
          )}

          {/* Detection Results Section */}
          {detections.length > 0 && (
            <div className="bg-white border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Detection Results</h2>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  Sortable
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b-2 border-gray-200">
                    <tr>
                      <th
                        className="p-3 cursor-pointer hover:bg-gray-100 transition-colors font-semibold text-gray-700"
                        onClick={() => sortTable("class_name")}
                      >
                        <div className="flex items-center gap-2">
                          OBJECT
                          <svg
                            className="w-4 h-4 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>
                      </th>
                      <th
                        className="p-3 cursor-pointer hover:bg-gray-100 transition-colors font-semibold text-gray-700"
                        onClick={() => sortTable("confidence")}
                      >
                        <div className="flex items-center gap-2">
                          CONFIDENCE
                          <svg
                            className="w-4 h-4 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>
                      </th>
                      <th className="p-3 font-semibold text-gray-700">
                        <div className="flex items-center gap-2">
                          BOUNDING BOX
                          <svg
                            className="w-4 h-4 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {detections.map((det, i) => (
                      <tr key={i} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="p-3 font-medium text-gray-900">{det.class_name}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 bg-gray-200 rounded-full h-6 min-w-[100px]">
                              <div
                                className="bg-green-500 h-6 rounded-full flex items-center justify-end pr-2"
                                style={{ width: `${confidencePercentage(det.confidence)}%` }}
                              >
                                <span className="text-xs font-medium text-white">
                                  {confidencePercentage(det.confidence)}%
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-gray-600 font-mono text-sm">
                          ({det.bbox.map((v: number) => v.toFixed(0)).join(", ")})
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
