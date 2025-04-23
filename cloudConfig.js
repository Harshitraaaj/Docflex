// const cloudinary = require('cloudinary').v2;
// const { CloudinaryStorage } = require('multer-storage-cloudinary');
// const { v4: uuidv4 } = require('uuid');



//   cloudinary.config({
//     cloud_name: process.env.CLOUD_NAME,
//     api_key: process.env.CLOUD_API_KEY,
//     api_secret: process.env.CLOUD_SECRET_KEY
//   });



// // Debug: Verify cloudinary config
// console.log(' Cloudinary Configured: successfully');



// // const storage = new CloudinaryStorage({
// //     cloudinary: cloudinary,
// //     params: {
// //       folder: 'Docflex_Dev',
// //       format: ["png","jpg","jpeg","svg","doc","docx","pdf","csv","pptx","xlsx"], 
     
// //     },
// //   });


// const storage = new CloudinaryStorage({
//     cloudinary: cloudinary,
//     params: async (req, file) => {
//         const extension = file.originalname.split('.').pop(); // Get the file extension (pdf, jpg, etc.)
//         const folderName = `Docflex_Dev/${req.route?.path.replace("/", "") || "general"}`;
//         const uniqueFilename = `${uuidv4()}.${extension}`;
        
//         return {
//             folder: folderName,
//             public_id: uniqueFilename.replace(`.${extension}`, ""), // Cloudinary automatically adds the extension
//             resource_type: "auto", // Auto-detect the file type (image, video, etc.)
//         };
//     },
// });

// module.exports = { cloud_storage : storage ,cloudinary};


const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Verify credentials before configuration
if (!process.env.CLOUD_API_KEY) {
    throw new Error('Cloudinary credentials missing in environment variables');
}

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_SECRET_KEY,
    secure: true // Always use HTTPS
});

console.log('Cloudinary Configured:', {
  cloud: cloudinary.config().cloud_name,
  apiKey: cloudinary.config().api_key ? '***' : 'missing'
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "Docflex_Dev",
    allowed_formats: ['pdf', 'doc', 'docx', 'pptx', 'xlsx'],
    resource_type: 'auto',
    type: 'upload',
    format: async (req, file) => path.extname(file.originalname).slice(1),
    invalidate: true
  }
});

module.exports = { cloud_storage: storage, cloudinary };