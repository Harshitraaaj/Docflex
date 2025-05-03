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
    resource_type: 'raw',
    type: 'upload',
    format: async (req, file) => path.extname(file.originalname).slice(1),
    invalidate: true
  }
});

module.exports = { cloud_storage: storage, cloudinary };