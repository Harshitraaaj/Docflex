
// Import the necessary packages
const express = require('express');
const libre = require('libreoffice-convert');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { info } = require('console');
const util = require('util');

// Create an instance of an Express application
const app = express();
const port = 3000;


app.get('/', (req, res) => {
  res.send('Hello, World!');
});

const convertAsync = util.promisify(libre.convert);






async function convertFile(inputPath, outputPath, outputFormat) {
  try {
    const inputFile = fs.readFileSync(inputPath);
    const outputExt = path.extname(outputPath).slice(1); // Get output format (e.g., 'pdf')

    const convertedfile = await convertAsync(inputFile, outputExt, undefined, (err, convertedFile) => {
      if (err) throw err;
      fs.writeFileSync(outputPath, convertedFile);
      console.log(`Conversion to ${outputFormat} successful!`);
    });
  } catch (err) {
    console.error('Error during conversion:', err);
  }
}

// // Usage
// convertFile('./files/aaaa.docx', 'output.pdf', 'pdf'); // Convert Word to PDF
// convertFile('./files/rty.pptx', './files/gumgum.pdf', 'pdf'); // Convert PPT to PDF

convertFile('./files/chum.pdf', './files/hg.doc', 'doc'); // Convert Word to PDF



// let inputfile = "./files/llo.jpg";
// let outputfile = "./files/lto.jpg";

// let compressionoptions = {
//   quality:50,
//   progressive:true,
//   force:false
 
// };

// sharp(inputfile).jpeg(compressionoptions).toFormat("jpeg").toFile(outputfile ,(err,info)=>{
//   if(err){
//     console.error("Error during conversion:", err);
//   }
//   console.log(info);
// });
// Start the server and listen on the defined port
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
