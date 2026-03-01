import { CheckCircle2, ImageIcon, UploadIcon } from "lucide-react";
import React, { useRef, useState } from "react";
import { useOutletContext, useNavigate } from "react-router";
import {
  PROGRESS_INTERVAL_MS,
  PROGRESS_STEP,
  REDIRECT_DELAY_MS,
} from "../lib/constant";

interface UploadProps {
  onComplete?: (base64Data: string) => void;
}

const Upload = ({ onComplete }: UploadProps) => {
  const [file, setFile] = useState<File | null>(null);

  const [isDragging, setIsDragging] = useState(false);

  const [progress, setProgress] = useState(0);

  const { isSignedIn } = useOutletContext<AuthContext>();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const navigate = useNavigate();

  const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/jpg"];

  const isValidFileType = (file: File): boolean => {
    return ALLOWED_FILE_TYPES.includes(file.type);
  };

  const processFile = (selectedFile: File) => {
    if (!isSignedIn) return;

    setFile(selectedFile);
    setProgress(0);

    const reader = new FileReader();

    reader.onload = (event) => {
      const base64String = event.target?.result as string;

      console.log("Image uploaded successfully:", selectedFile.name);

      // Start interval to increment progress
      intervalRef.current = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + PROGRESS_STEP;
          if (newProgress >= 100) {
            if (intervalRef.current) clearInterval(intervalRef.current);

            // Call onComplete after REDIRECT_DELAY_MS
            setTimeout(() => {
              if (onComplete) {
                onComplete(base64String);
              }
              // Navigate to visualizer with the base64 data
              const fileId = Date.now().toString();
              navigate(`/visualizer/${fileId}`, {
                state: { base64Data: base64String, fileName: selectedFile.name },
              });
            }, REDIRECT_DELAY_MS);

            return 100;
          }
          return newProgress;
        });
      }, PROGRESS_INTERVAL_MS);
    };

    reader.readAsDataURL(selectedFile);
  };

  const handleFileSelect = (selectedFile: File) => {
    if (!isSignedIn) return;

    if (!isValidFileType(selectedFile)) {
      console.error("Invalid file type. Only JPG, JPEG, and PNG files are allowed.");
      alert("Invalid file type. Only JPG, JPEG, and PNG files are allowed.");
      return;
    }

    processFile(selectedFile);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (!isSignedIn) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    if (!isSignedIn) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  return (
    <div className="upload">
      {!file ? (
        <div
          className={`dropzone ${isDragging ? "dragging" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="drop-input"
            accept=".jpg,.jpeg,.png"
            disabled={!isSignedIn}
            onChange={handleChange}
          />

          <div className="drop-content">
            <div className="drop-icon">
              <UploadIcon size={20} />
            </div>
            <p>
              {isSignedIn
                ? "Drag and drop your image here, or click to select a file."
                : "Please sign in to upload files."}
            </p>

            <p className="help">Maximum file size: 10MB</p>
          </div>
        </div>
      ) : (
        <div className="upload-status">
          <div className="status-content">
            <div className="status-icon">
              {progress === 100 ? (
                <CheckCircle2 className="check" />
              ) : (
                <ImageIcon className="image" />
              )}
            </div>

            <h3>{file.name}</h3>

            <div className="progress">
              <div className="bar" style={{ width: `${progress}%` }} />
              <p className="status-text">
                {progress < 100 ? "Analyzing Floor Plan..." : "Redirecting..."}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Upload;
