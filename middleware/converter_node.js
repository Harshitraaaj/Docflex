const libre = require('libreoffice-convert');
const fs = require('fs');
const util = require("util");

const convertAsync = util.promisify(libre.convert);



const getLibreOfficeFormat = (ext) => {
    const formatMap = {
        "pdf": "pdf:writer_pdf_Export",
        "pptx": "pptx:Impress MS PowerPoint 2007 XML",
        "docx": "docx:MS Word 2007 XML",
        "xlsx": "xlsx:Calc MS Excel 2007 XML"
    };
    return formatMap[ext] || ext;
};





const convertToFiles = async (inputPath,outputPath, outputFormat)=> {
  try {
      const inputFile = fs.readFileSync(inputPath);
      const outputExt = getLibreOfficeFormat(outputFormat); 
  
    const convertedFile = await  convertAsync(inputFile, outputExt, undefined);
        fs.writeFileSync(outputPath, convertedFile);
        console.log(`Conversion to ${outputFormat} successful!`);
        return outputPath;
      
    } catch (err) {
      console.error('Error during conversion:', err);
      throw err;
    }
  }

module.exports = { convertToFiles };