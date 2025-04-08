import { useState } from "react";
import axios from "axios";
import { FaFileAlt } from "react-icons/fa";
import "./FileUploader.css";

const FileUploader = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [stepsVisible, setStepsVisible] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const steps = [
    "Accessing the document...",
    "Checking the document...",
    "Uploading...",
  ];

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setUploaded(false);
  };

  const handleUpload = async () => {
    if (!file) {
      document.getElementById("upload-text").classList.add("shake");
      setTimeout(() => {
        document.getElementById("upload-text").classList.remove("shake");
      }, 500);
      return;
    }

    setUploading(true);
    setStepsVisible(true);
    setStepIndex(0);

    // Simulate step completion
    let interval = setInterval(() => {
      setStepIndex((prev) => {
        if (prev === steps.length - 1) {
          clearInterval(interval);
          setTimeout(() => {
            setUploading(false);
            setUploaded(true);
          }, 1000);
        }
        return prev + 1;
      });
    }, 1000);

    try {
      const formData = new FormData();
      formData.append("file", file);

      await axios.post("http://localhost:8000/user/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload file.");
      setUploading(false);
      setUploaded(false);
      setStepsVisible(false);
    }
  };

  const resetUpload = () => {
    setFile(null);
    setUploading(false);
    setUploaded(false);
    setStepsVisible(false);
    setStepIndex(0);
  };

  return (
    <div className="container">
      <div className={`upload-box ${uploading ? "move-left" : ""}`}>
        <input type="file" id="file-input" onChange={handleFileChange} />
        <label htmlFor="file-input" className="file-label">
          {file ? (
            <>
              <FaFileAlt className="file-icon" />
              <span className="file-name">{file.name}</span>
            </>
          ) : (
            <>
              <span className="plus">+</span>
              <span id="upload-text">Click to upload</span>
            </>
          )}
        </label>
      </div>

      <div className={`upload-steps ${stepsVisible ? "visible" : ""}`}>
        {steps.map((step, index) => (
          <div key={index} className={index <= stepIndex ? "completed" : ""}>
            {index <= stepIndex && "✔"} {step}
          </div>
        ))}
        {uploaded && <div className="success">Uploaded!</div>}
      </div>

      {!uploaded && (
        <button
          className="upload-btn"
          onClick={handleUpload}
          disabled={uploading}
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
      )}

      {uploaded && (
        <button className="upload-btn reset-btn" onClick={resetUpload}>
          Upload Another File
        </button>
      )}
    </div>
  );
};

export default FileUploader;
