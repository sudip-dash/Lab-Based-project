import fs from "fs";
import path from "path";


export const uploadFile = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const inputPath = req.file.path;
  const ext = path.extname(req.file.originalname).toLowerCase();
  const role = req.role; // not used as do not know where to send 
  
  
  const outputPath = path.join("public", "temp", req.file.originalname);

  try {
    if (ext === ".pdf" || ext === ".docx") {

      fs.renameSync(inputPath, outputPath);
      return res.json({
        message: `${ext.toUpperCase()} uploaded and saved successfully`,
        path: outputPath,
      });
    } else {
      return res.status(400).json({ error: "Unsupported file format" });
    }
  } catch (error) {
    console.error("File processing error:", error);
    res.status(500).json({ error: "Error processing file" });
  }
};
