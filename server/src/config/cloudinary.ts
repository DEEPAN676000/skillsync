import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
});

export const isCloudinaryConfigured = (): boolean => {
  const { cloud_name, api_key, api_secret } = cloudinary.config();
  return Boolean(
    cloud_name &&
    api_key &&
    api_secret &&
    cloud_name !== 'skillsync-demo' &&
    api_key !== '123456789012345'
  );
};

export default cloudinary;

