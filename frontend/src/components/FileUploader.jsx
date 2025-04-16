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
  const [role, setRole] = useState("");
  const [error, setError] = useState(""); // ✅ NEW

  const steps = [
    "Accessing the document...",
    "Checking the document...",
    "Uploading...",
  ];

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setUploaded(false);
    setError(""); // 🔄 UPDATED: clear error on new file selection
  };

  const handleUpload = async () => {
    if (!file) {
      document.getElementById("upload-text").classList.add("shake");
      setTimeout(() => {
        document.getElementById("upload-text").classList.remove("shake");
      }, 500);
      return;
    }

    if (!role.trim()) {
      setError("Please enter your desired role before uploading."); // ✅ NEW: role validation
      return;
    }

    setUploading(true);
    setStepsVisible(true);
    setStepIndex(0);
    setError(""); // ✅ NEW: clear any previous error

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
      formData.append("role", role);
      formData.append("file", file);

      await axios.post("http://localhost:8000/user/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    } catch (error) {
      console.error("Upload failed:", error);
      setError("Upload failed. Please try again."); // ✅ NEW: generic error fallback
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
    setRole("");
    setError(""); // ✅ NEW: reset error on reset
  };

  return (
    <div className="container">
      <div className="role-input-container">
        <label htmlFor="role">Enter Your Desired Role:</label>
        <input
          type="text"
          id="role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="e.g., Frontend Developer"
          className="role-input"
        />
      </div>

      {/* 🔁 MODIFIED: show only if role and upload are done */}
      {uploaded && role && (
        <div className="uploaded-role">
          Role submitted: <strong>{role}</strong>
        </div>
      )}

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

      {/* 🔁 MODIFIED: show Upload button always unless uploaded */}
      {!uploaded && (
        <>
          <button
            className="upload-btn"
            onClick={handleUpload}
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>

          {/* ✅ NEW: Show error below Upload button */}
          {error && (
            <div className="text-red-600 font-semibold mt-2">
              <span>{error}</span>
              <button className="close-error" onClick={() => setError("")}>
                ×
              </button>
            </div>
          )}
        </>
      )}

      {/* 🔁 MODIFIED: Show "Upload Another File" only if upload succeeded and role provided */}
      {uploaded && role && (
        <button className="upload-btn reset-btn" onClick={resetUpload}>
          Upload Another File
        </button>
      )}
    </div>
  );
};

export default FileUploader;
