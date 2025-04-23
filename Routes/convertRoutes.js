const express = require("express");
const app = express();
const { spawn } = require('child_process');
const streamifier = require("streamifier");
const multer = require("multer");

const path = require("path");
const fs = require("fs");
const { convertToFiles } = require("../middleware/converter_node");
const downloadFile = require("../controller/download");

const sharp = require('sharp');
const { cloud_storage, cloudinary } = require("../cloudConfig");
const upload = multer({ storage: multer.memoryStorage() });
const axios = require("axios");

const router = express.Router();
const FILES_FOLDER = path.join(__dirname, "../files");



// //MULTER storage
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//       return cb(null, './files')
//     },
//     filename: function (req, file, cb) {

//      const filename = `${Date.now()}-${file.originalname}`;
//       return cb(null, filename)
//     },
//   });

//   const upload = multer({ storage })

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
    let tempInputPath, convertedFilePath;

    try {
        if (!req.file?.buffer) {
            return res.status(400).render('wordToPdf', {
                downloadLink: null,
                error: "No file uploaded or invalid file format"
            });
        }

        const baseName = sanitizeFilename(path.parse(req.file.originalname).name);
        const timestamp = Date.now();
        const outputFileName = `${timestamp}-${baseName}.pdf`;

        const FILES_FOLDER = process.env.NODE_ENV === "production"
            ? "/tmp"
            : path.join(__dirname, "../files");

        // Paths
        tempInputPath = path.join(FILES_FOLDER, `temp_${timestamp}${path.extname(req.file.originalname)}`);
        convertedFilePath = path.join(FILES_FOLDER, outputFileName);

        // Upload original to Cloudinary (raw)
        const originalUpload = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: "Docflex_Dev/wordToPdf",
                    resource_type: "raw",
                    public_id: `${timestamp}-${baseName}`,
                    overwrite: true,
                    invalidate: true
                },
                (error, result) => {
                    if (error) {
                        console.error("Cloudinary Upload Error:", error);
                        return reject(new Error("Failed to upload original document"));
                    }
                    resolve(result);
                }
            );
            streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
        });

        // Write buffer to temp file
        fs.writeFileSync(tempInputPath, req.file.buffer);

        // Convert to PDF
        await convertToFiles(tempInputPath, convertedFilePath, "pdf");

        // Validate converted PDF
        validatePdf(convertedFilePath);

        const fileStats = fs.statSync(convertedFilePath);
        if (fileStats.size < 1024) throw new Error("Converted file is too small");

        // Upload converted file
        const convertedUpload = await cloudinary.uploader.upload(convertedFilePath, {
            folder: "convertedFiles",
            resource_type: "raw",
            public_id: `${timestamp}-${baseName}`,
            type: "upload", // <- make sure it's a standard, public upload
            context: `original=${originalUpload.public_id}`,
            use_filename: true,
            unique_filename: false,
            access_mode: "public",  // <— ADD THIS if you’re on an account that supports it
        });
        

        // Delete original file from Cloudinary
        const deleteOriginal = await cloudinary.uploader.destroy(originalUpload.public_id, {
            resource_type: "raw",
        });

        if (deleteOriginal.result !== "ok") {
            console.error("Cloudinary deletion failed:", deleteOriginal);
        }

        console.log("Download Link:", convertedUpload.secure_url);


        // Send converted file URL
        res.render("wordToPdf", {
            downloadLink: convertedUpload.secure_url,
            error: null
        });

    } catch (error) {
        console.error("Conversion Error:", error);
        res.status(500).render("wordToPdf", {
            downloadLink: null,
            error: error.message
        });
    } finally {
        // Cleanup
        [tempInputPath, convertedFilePath].forEach(filePath => {
            if (filePath && fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        });
    }
});


//Route: Convert Csv to PDF

router.get("/csvToPdf", (req, res) => {
    res.render('csvToPdf', { downloadLink: null });
});
// Route: Convert Csv to PDF **
router.post("/csvToPdf", upload.single("document"), async (req, res) => {
    try {




        let inputPath = req.file.path;
        let outputFileName = `${Date.now()}-${req.file.originalname}.pdf`;
        const outputPath = path.join(FILES_FOLDER, outputFileName);;

        const outputFormat = 'pdf';




        // Debug: Check the paths

        console.log(`📂 Received File: ${inputPath}`);

        let output = await convertToFiles(inputPath, outputPath, outputFormat); // Corrected


        console.log(`📂 Converted File: ${output}`);

        // ✅ Check if output is undefined before downloading
        if (!output) {
            console.error(" Error: Conversion failed, output is undefined.");
            return res.status(500).json({ error: "Conversion failed, output file missing." });
        }

        // Send download link instead of direct download
        const downloadLink = `/download/${outputFileName}`;
        res.render("csvToPdf", { downloadLink });

    } catch (error) {
        console.error(" Conversion Error:", error);
        res.status(500).json({ error: error.message });
    }
});


//Route: Convert PPt to PDF

router.get("/pptToPdf", (req, res) => {
    res.render('pptToPdf', { downloadLink: null });
});
// Route: Convert PPT to PDF **
router.post("/pptToPdf", upload.single("document"), async (req, res) => {
    try {

        let inputPath = req.file.path;
        let outputFileName = `${Date.now()}-${req.file.originalname}.pdf`;
        const outputPath = path.join(FILES_FOLDER, outputFileName);

        const outputFormat = 'pdf';




        // Debug: Check the paths

        console.log(`📂 Received File: ${inputPath}`);

        let output = await convertToFiles(inputPath, outputPath, outputFormat); // Corrected


        console.log(`📂 Converted File: ${output}`);

        // ✅ Check if output is undefined before downloading
        if (!output) {
            console.error(" Error: Conversion failed, output is undefined.");
            return res.status(500).json({ error: "Conversion failed, output file missing." });
        }

        // Send download link instead of direct download
        const downloadLink = `/download/${outputFileName}`;
        res.render("csvToPdf", { downloadLink });
    } catch (error) {
        console.error(" Conversion Error:", error);
        res.status(500).json({ error: error.message });
    }
});


//imagecompress

router.get("/compressimg", (req, res) => {
    res.render('compressimg');
});

// Route: img compress
router.post("/compressimg", upload.single("document"), async (req, res) => {

    let inputPath = req.file.path;
    let outputFileName = `${Date.now()}-${req.file.originalname}`;
    const outputPath = path.join(FILES_FOLDER, outputFileName);
    const level = req.body.level || Mid;

    console.log(level);

    let qualityMap = {
        High: 30, // Maximum compression (smallest file)
        Mid: 50,  // Medium compression
        Low: 70   // Minimum compression (better quality)
    };




    let compressionoptions = {
        quality: qualityMap[level],
        progressive: true,
        force: false

    };

    sharp(inputPath).jpeg(compressionoptions).toFormat("jpeg").toFile(outputPath, (err, info) => {
        if (err) {
            console.error("Error during conversion:", err);
        }
        console.log(info);
        res.status(200).json(info);
    });
});

//pdftoword
router.get("/pdfToWord", (req, res) => {
    res.render("pdfToWord");
});
//route pdftoword
router.post("/pdfToword", upload.single("document"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    // const inputPath = req.file.path; // Uploaded file path
    // const outputPath = inputPath.replace(".pdf", ".docx"); // Converted file path


    let inputPath = req.file.path;
    let outputFileName = `${Date.now()}-${req.file.originalname}.docx`;
    const outputPath = path.join(FILES_FOLDER, outputFileName);

    console.log(`📂 Received File: ${inputPath}`);
    console.log(`📂 Output File: ${outputPath}`);

    const pythonScriptPath = path.join(__dirname, "../pdfToWord.py");

    // Spawn a Python process to convert PDF to Word
    const pythonProcess = spawn("python3", [pythonScriptPath, inputPath, outputPath]);

    pythonProcess.stdout.on("data", (data) => {
        console.log(`Python stdout: ${data}`);
    });

    pythonProcess.stderr.on("data", (data) => {
        console.error(`Python stderr: ${data}`);
    });

    pythonProcess.on("close", (code) => {
        if (code === 0) {
            // Send the converted file for download
            res.download(outputPath, (err) => {
                if (err) console.error("Error sending file:", err);
                fs.unlinkSync(inputPath); // Delete input PDF
                fs.unlinkSync(outputPath); // Delete converted DOCX after download
            });
        } else {
            res.status(500).json({ error: "Conversion failed" });
        }
    });
});


// Export the router
module.exports = router;
