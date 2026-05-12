import { v2 as cloudinary } from 'cloudinary';

// Configure using environment variables
// It expects CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME / API_KEY / API_SECRET
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;
