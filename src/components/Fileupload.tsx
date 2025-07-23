import React, { useState } from "react";
import { embedUserFile } from "@/api";
import { Loader2 } from "lucide-react";

const FileUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage("");
    try {
      const res = await embedUserFile(file);
      setMessage(`✅ Uploaded "${file.name}" → ${res.chunks} chunks created.`);
    } catch (err) {
      console.error(err);
      setMessage("❌ Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-2 mt-4 w-full max-w-md">
      <label className="text-white text-sm font-medium">
        Upload PDF or TXT to embed:
      </label>
      <div className="flex items-center gap-3">
        <input
          type="file"
          accept=".pdf,.txt"
          onChange={handleFileUpload}
          disabled={uploading}
          className="block text-sm text-gray-300 file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0 file:text-sm file:font-semibold
            file:bg-blue-500 file:text-white hover:file:bg-blue-600
            disabled:opacity-50"
        />
        {uploading && <Loader2 className="h-5 w-5 animate-spin text-blue-400" />}
      </div>
      {message && (
        <p
          className={`text-sm ${
            message.startsWith("✅")
              ? "text-green-400"
              : "text-red-400"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
};

export default FileUpload;
