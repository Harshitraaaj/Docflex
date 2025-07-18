const express = require("express");
const axios = require("axios");
const { spawn } = require('child_process');
const streamifier = require("streamifier");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { convertToFiles } = require("../middleware/converter_node");
const sharp = require('sharp');
const { cloudinary } = require("../cloudConfig");
const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();
const FILES_FOLDER = path.join(__dirname, "../files");

// Helper functions
const sanitizeFilename = (filename) => {
    return filename.replace(/[^a-zA-Z0-9_.-]/g, '_');
};

const validatePdf = (filePath) => {
    const data = fs.readFileSync(filePath);
    // Check PDF magic number
    if (data[0] === 0x25 && data[1] === 0x50 && data[2] === 0x44 && data[3] === 0x46) {
        return true;
    }
    throw new Error("Invalid PDF file generated");
};

//Route: Convert Word to PDF
router.get("/wordToPdf", (req, res) => {
    res.render('wordToPdf', { downloadLink: null });
});

// Route: Convert Word to PDF 
router.post("/wordToPdf", upload.single("document"), async (req, res) => {
    let convertedFilePath;
    try {
        if (!req.file?.buffer) {
            return res.status(400).render("wordToPdf", {
                downloadLink: null,
                error: "No file uploaded"
            });
        }

        const baseName = sanitizeFilename(path.parse(req.file.originalname).name);
        const timestamp = Date.now();
        const outputFileName = `${timestamp}-${baseName}.pdf`;
        const TMP_FOLDER = process.env.NODE_ENV === "production" ? "/tmp" : path.join(__dirname, "../files");
        convertedFilePath = path.join(TMP_FOLDER, outputFileName);

        // Upload original doc to Cloudinary (raw)
        const originalUpload = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream({
                folder: "Docflex_Dev/wordToPdf",
                resource_type: "raw",
                public_id: `${timestamp}-${baseName}`,
                overwrite: true
            }, (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });

            streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
        });

        // Get raw file from Cloudinary (acts as input)
        const { data: fileBuffer } = await axios.get(originalUpload.secure_url, {
            responseType: 'arraybuffer'
        });

        // Write the buffer to temp (in /tmp for serverless-friendly storage)
        const tempInputPath = path.join(TMP_FOLDER, `temp_${timestamp}${path.extname(req.file.originalname)}`);
        fs.writeFileSync(tempInputPath, fileBuffer);

        // Convert to PDF
        await convertToFiles(tempInputPath, convertedFilePath, "pdf");

        // Upload converted PDF to Cloudinary
        const convertedUpload = await cloudinary.uploader.upload(convertedFilePath, {
            folder: "convertedFiles",
            resource_type: "raw",
            public_id: `${timestamp}-${baseName}`,
            access_mode: "public"
        });

        // Clean up
        [tempInputPath, convertedFilePath].forEach(fp => fs.existsSync(fp) && fs.unlinkSync(fp));
        await cloudinary.uploader.destroy(originalUpload.public_id, { resource_type: "raw" });

        // Send download link
        return res.render("wordToPdf", {
            downloadLink: convertedUpload.secure_url,
            error: null
        });

    } catch (err) {
        console.error("Error during Word to PDF:", err);
        res.status(500).render("wordToPdf", {
            downloadLink: null,
            error: "Conversion failed. Please try again."
        });

        if (convertedFilePath && fs.existsSync(convertedFilePath)) fs.unlinkSync(convertedFilePath);
    }
});

//Route: Convert Csv to PDF
router.get("/csvToPdf", (req, res) => {
    res.render('csvToPdf', { downloadLink: null });
});

// Route: Convert Csv to PDF **
router.post("/csvToPdf", upload.single("document"), async (req, res) => {
    let tempInputPath, convertedFilePath;

    try {
        if (!req.file?.buffer) {
            return res.status(400).render("csvToPdf", {
                downloadLink: null,
                error: "No file uploaded or invalid file format"
            });
        }

        const baseName = sanitizeFilename(path.parse(req.file.originalname).name);
        const timestamp = Date.now();
        const outputFileName = `${timestamp}-${baseName}.pdf`;

        tempInputPath = path.join(FILES_FOLDER, `temp_${timestamp}${path.extname(req.file.originalname)}`);
        convertedFilePath = path.join(FILES_FOLDER, outputFileName);

        fs.writeFileSync(tempInputPath, req.file.buffer);
        await convertToFiles(tempInputPath, convertedFilePath, "pdf");

        validatePdf(convertedFilePath);

        const convertedUpload = await cloudinary.uploader.upload(convertedFilePath, {
            folder: "convertedFiles",
            resource_type: "raw",
            public_id: `${timestamp}-${baseName}`,
            type: "upload",
            use_filename: true,
            unique_filename: false,
            access_mode: "public"
        });

        res.render("csvToPdf", {
            downloadLink: convertedUpload.secure_url,
            error: null
        });

    } catch (error) {
        console.error("CSV Conversion Error:", error);
        res.status(500).render("csvToPdf", {
            downloadLink: null,
            error: error.message
        });
    } finally {
        [tempInputPath, convertedFilePath].forEach(filePath => {
            if (filePath && fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        });
    }
});

//Route: Convert PPt to PDF
router.get("/pptToPdf", (req, res) => {
    res.render('pptToPdf', { downloadLink: null });
});

// Route: Convert PPT to PDF **
router.post("/pptToPdf", upload.single("document"), async (req, res) => {
    let tempInputPath, convertedFilePath;

    try {
        if (!req.file?.buffer) {
            return res.status(400).render("pptToPdf", {
                downloadLink: null,
                error: "No file uploaded or invalid file format"
            });
        }

        const baseName = sanitizeFilename(path.parse(req.file.originalname).name);
        const timestamp = Date.now();
        const outputFileName = `${timestamp}-${baseName}.pdf`;

        tempInputPath = path.join(FILES_FOLDER, `temp_${timestamp}${path.extname(req.file.originalname)}`);
        convertedFilePath = path.join(FILES_FOLDER, outputFileName);

        fs.writeFileSync(tempInputPath, req.file.buffer);
        await convertToFiles(tempInputPath, convertedFilePath, "pdf");

        validatePdf(convertedFilePath);

        const convertedUpload = await cloudinary.uploader.upload(convertedFilePath, {
            folder: "convertedFiles",
            resource_type: "raw",
            public_id: `${timestamp}-${baseName}`,
            type: "upload",
            use_filename: true,
            unique_filename: false,
            access_mode: "public"
        });

        res.render("pptToPdf", {
            downloadLink: convertedUpload.secure_url,
            error: null
        });

    } catch (error) {
        console.error("PPT Conversion Error:", error);
        res.status(500).render("pptToPdf", {
            downloadLink: null,
            error: error.message
        });
    } finally {
        [tempInputPath, convertedFilePath].forEach(filePath => {
            if (filePath && fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        });
    }
});

//imagecompress
router.get("/compressimg", (req, res) => {
    res.render('compressimg', { downloadLink: null });
});

// Route: img compress
router.post("/compressimg", upload.single("document"), async (req, res) => {
    try {
      if (!req.file?.buffer) {
        return res.status(400).render("compressimg", {
          downloadLink: null,
          error: "No file uploaded"
        });
      }
  
      const level = req.body.level || "Mid";
      const qualityMap = { High: 30, Mid: 50, Low: 70 };
      const baseName = sanitizeFilename(path.parse(req.file.originalname).name);
      const timestamp = Date.now();
      const outputFileName = `${timestamp}-${baseName}.jpeg`;
  
      const compressedBuffer = await sharp(req.file.buffer)
        .jpeg({ quality: qualityMap[level], progressive: true })
        .toBuffer();
  
      // Upload compressed image to Cloudinary
      const uploaded = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "compressedImages",
            resource_type: "image",
            public_id: `${timestamp}-${baseName}`,
            access_mode: "public"
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        
        streamifier.createReadStream(compressedBuffer).pipe(uploadStream);
      });
  
      res.render("compressimg", {
        downloadLink: uploaded.secure_url,
        error: null
      });
  
    } catch (err) {
      console.error("Image Compression Error:", err);
      res.status(500).render("compressimg", {
        downloadLink: null,
        error: err.message
      });
    }
});

//pdftoword
router.get("/pdfToWord", (req, res) => {
    res.render("pdfToWord", { downloadLink: null });
});

// Fixed PDF to Word route with enhanced error handling
router.post("/pdfToWord", upload.single("document"), async (req, res) => {
    let tempInputPath, convertedFilePath;

    try {
        if (!req.file?.buffer) {
            return res.status(400).render("pdfToWord", {
                downloadLink: null,
                error: "No file uploaded"
            });
        }

        const baseName = sanitizeFilename(path.parse(req.file.originalname).name);
        const timestamp = Date.now();
        const outputFileName = `${timestamp}-${baseName}.docx`;

        // Create files folder if it doesn't exist
        if (!fs.existsSync(FILES_FOLDER)) {
            fs.mkdirSync(FILES_FOLDER, { recursive: true });
        }

        tempInputPath = path.join(FILES_FOLDER, `temp_${timestamp}.pdf`);
        convertedFilePath = path.join(FILES_FOLDER, outputFileName);

        // Write input file
        fs.writeFileSync(tempInputPath, req.file.buffer);

        // Verify Python script exists
        const pythonScriptPath = path.join(__dirname, "../pdfToWord.py");
        if (!fs.existsSync(pythonScriptPath)) {
            throw new Error("Conversion service unavailable - missing script");
        }

        // Execute Python conversion
        const pythonProcess = spawn("python3", [pythonScriptPath, tempInputPath, convertedFilePath]);

        // Capture output for debugging
        let stdout = '';
        let stderr = '';

        pythonProcess.stdout.on('data', (data) => {
            stdout += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            stderr += data.toString();
        });

        // Handle process completion with timeout
        const exitCode = await new Promise((resolve, reject) => {
            const timeout = 300000; // 5 minutes timeout
            const timeoutId = setTimeout(() => {
                pythonProcess.kill('SIGKILL');
                reject(new Error('Conversion timed out after 5 minutes'));
            }, timeout);

            pythonProcess.on('close', (code) => {
                clearTimeout(timeoutId);
                resolve(code);
            });

            pythonProcess.on('error', (err) => {
                clearTimeout(timeoutId);
                reject(err);
            });
        });

        // Check conversion result
        if (exitCode !== 0) {
            console.error(`Python conversion failed (${exitCode}): ${stderr}`);
            throw new Error(`Conversion failed: ${stderr || 'Unknown error'}`);
        }

        // Verify output file
        if (!fs.existsSync(convertedFilePath)) {
            throw new Error("Conversion produced no output file");
        }

        const fileStats = fs.statSync(convertedFilePath);
        if (fileStats.size < 1024) {
            throw new Error("Converted file is too small (likely conversion error)");
        }

        // Upload to Cloudinary
        const convertedUpload = await cloudinary.uploader.upload(convertedFilePath, {
            folder: "convertedFiles",
            resource_type: "raw",
            public_id: `${timestamp}-${baseName}`,
            use_filename: true,
            unique_filename: false,
            access_mode: "public"
        });

        res.render("pdfToWord", {
            downloadLink: convertedUpload.secure_url,
            error: null
        });

    } catch (error) {
        console.error("PDF to Word Conversion Error:", error);
        res.status(500).render("pdfToWord", {
            downloadLink: null,
            error: error.message || "Conversion failed. Please try a different file."
        });
    } finally {
        // Cleanup files with error handling
        [tempInputPath, convertedFilePath].forEach(filePath => {
            try {
                if (filePath && fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            } catch (cleanupErr) {
                console.error("Cleanup error:", cleanupErr);
            }
        });
    }
});

// Export the router
module.exports = router;