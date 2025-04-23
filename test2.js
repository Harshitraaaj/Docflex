


// Import the necessary packages
const express = require('express');
const libre = require('libreoffice-convert');
const fs = require('fs');
const path = require('path');
const { PDFDocument } = require('pdf-lib');
const PptxGenJS = require('pptxgenjs');

// Create an instance of an Express application
const app = express();
const port = 3000;


app.get('/', (req, res) => {
  res.send('Hello, World!');
});







async function convertPDFToPPT(inputPath, outputPath) {
  try {
    // Read PDF content
    const pdfBytes = fs.readFileSync(inputPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const textContent = 'Extracted text from PDF'; // Replace with actual extraction logic

    // Create PPT
    const pptx = new PptxGenJS();
    pptx.addSlide().addText(textContent);
    pptx.writeFile(outputPath);

    console.log('PDF to PPT conversion successful!');
  } catch (err) {
    console.error('Error during conversion:', err);
  }
}

// Usage
convertPDFToPPT('./files/B.pdf', 'out.pptx');

// Start the server and listen on the defined port
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });