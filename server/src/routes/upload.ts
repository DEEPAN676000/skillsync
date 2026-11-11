import { Router, Response } from 'express';
import { protect, AuthRequest } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { uploadMedia } from '../services/cloudinaryService.js';

const router = Router();

// @route   POST /api/upload
// @desc    Upload single file (image, video, document)
router.post(
  '/',
  protect,
  upload.single('file'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ success: false, message: 'Please select a file to upload' });
        return;
      }

      const folder = (req.body.folder as string) || 'general';
      const isVideo = req.file.mimetype.startsWith('video');
      const resourceType = isVideo ? 'video' : 'auto';

      const uploadResult = await uploadMedia(req.file.path, folder, resourceType);

      res.status(200).json({
        success: true,
        message: 'File uploaded successfully',
        data: uploadResult,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

export default router;

