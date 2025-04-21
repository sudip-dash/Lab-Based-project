import fs from "fs";
import path from "path";
import { ApiError } from "../utilities/ApiError.js";
import { spawn } from "child_process";

// Promise-based function to handle Python script execution
function sendToPython(inputData) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(process.cwd(), "..", "model", "main.py");


    // Use Python from your virtual environment
    const pythonPath = path.join(
      process.cwd(),
      "..",
      "model",
      "myenv",
      "Scripts",
      "python.exe"
    );

    const python = spawn(pythonPath, [scriptPath]);

    let dataBuffer = "";
    let errorBuffer = "";

    python.stdin.write(inputData + "\n");
    python.stdin.end();

    python.stdout.on("data", (data) => {
      dataBuffer += data.toString();
    });

    python.stderr.on("data", (data) => {
      errorBuffer += data.toString();
    });

    python.on("close", (code) => {
      if (code === 0) {
        resolve(dataBuffer); // Resolve with Python output data
      } else {
        reject(new Error(`Python error: ${errorBuffer}`)); // Reject if there is an error
      }
    });
  });
}

export const uploadFile = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const inputPath = req.file.path;
  const ext = path.extname(req.file.originalname).toLowerCase();
  const role = req.body.role;

  if (!role) {
    return res.status(400).json(new ApiError(400, "Need to have the role"));
  }

  const outputPath = path.join("public", "temp", `Resume${ext}`);

  try {
    if (ext === ".pdf" || ext === ".docx") {
      fs.renameSync(inputPath, outputPath);

      // Wait for Python to finish processing the role
      const pythonResult = await sendToPython(role);

      // Handle the Python result here (you can parse it if needed)
      console.log("Python output:", pythonResult);

      return res.json({
        message: `${ext.toUpperCase()} uploaded and saved successfully`,
        path: outputPath,
        pythonResult: pythonResult, // Optionally include Python result in response
      });
    } else {
      return res.status(400).json({ error: "Unsupported file format" });
    }
  } catch (error) {
    console.error("File processing error:", error);
    return res
      .status(500)
      .json({ error: "Error processing file or sending to Python" });
  }
};
