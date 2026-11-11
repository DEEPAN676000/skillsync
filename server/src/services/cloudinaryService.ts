import cloudinary, { isCloudinaryConfigured } from '../config/cloudinary.js';
import fs from 'fs';
import path from 'path';

export interface UploadResult {
  url: string;
  publicId: string;
  format?: string;
  duration?: number;
  resourceType: 'image' | 'video' | 'raw';
}

export const uploadMedia = async (
  filePath: string,
  folder: string = 'skillsync',
  resourceType: 'auto' | 'image' | 'video' | 'raw' = 'auto'
): Promise<UploadResult> => {
  if (isCloudinaryConfigured()) {
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        folder: `skillsync/${folder}`,
        resource_type: resourceType,
      });

      // Cleanup temp local file after successful Cloudinary upload
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      return {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        duration: result.duration,
        resourceType: (result.resource_type as any) || 'image',
      };
    } catch (error: any) {
      console.error('[Cloudinary] Upload failed, falling back to local file storage:', error.message);
    }
  }

  // Local storage fallback
  const filename = path.basename(filePath);
  const ext = path.extname(filename).toLowerCase();
  const isVid = ['.mp4', '.mov', '.webm', '.avi', '.mkv'].includes(ext);

  return {
    url: `/uploads/${filename}`,
    publicId: filename,
    format: ext.replace('.', ''),
    resourceType: isVid ? 'video' : 'image',
  };
};

export const deleteMedia = async (publicId: string, resourceType: 'image' | 'video' = 'image'): Promise<void> => {
  if (isCloudinaryConfigured()) {
    try {
      await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    } catch (error: any) {
      console.error('[Cloudinary] Destroy failed:', error.message);
    }
  } else {
    const localPath = path.join(process.cwd(), 'uploads', publicId);
    if (fs.existsSync(localPath)) {
      try {
        fs.unlinkSync(localPath);
      } catch (e) {
        // ignore
      }
    }
  }
};

