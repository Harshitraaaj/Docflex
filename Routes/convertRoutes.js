const express = require("express");
const { spawn } = require('child_process');
const streamifier = require("streamifier");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { convertToFiles } = require("../middleware/converter_node");
const sharp = require('sharp');
const { cloud_storage, cloudinary } = require("../cloudConfig");
const upload = multer({ storage: multer.memoryStorage() });
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
      const uploaded = await cloudinary.uploader.upload_stream(
        {
          folder: "compressedImages",
          resource_type: "image",
          public_id: `${timestamp}-${baseName}`,
          access_mode: "public"
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary Upload Error:", error);
            return res.status(500).render("compressimg", {
              downloadLink: null,
              error: "Failed to upload compressed image"
            });
          }
  
          res.render("compressimg", {
            downloadLink: result.secure_url,
            error: null
          });
        }
      );
  
      // Pipe the compressed buffer to the upload stream
      streamifier.createReadStream(compressedBuffer).pipe(uploaded);
  
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
//route pdftoword
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

        tempInputPath = path.join(FILES_FOLDER, `temp_${timestamp}.pdf`);
        convertedFilePath = path.join(FILES_FOLDER, outputFileName);

        fs.writeFileSync(tempInputPath, req.file.buffer);

        const pythonScriptPath = path.join(__dirname, "../pdfToWord.py");
        const pythonProcess = spawn("python3", [pythonScriptPath, tempInputPath, convertedFilePath]);

        await new Promise((resolve, reject) => {
            pythonProcess.on("close", (code) => {
                if (code === 0) resolve();
                else reject(new Error("Python conversion script failed"));
            });
        });

        const fileStats = fs.statSync(convertedFilePath);
        if (fileStats.size < 1024) throw new Error("Converted file too small");

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



// Export the router
module.exports = router;
