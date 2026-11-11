import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedExtensions = /jpeg|jpg|png|webp|gif|mp4|mov|webm|pdf|doc|docx|zip/;
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
  
  if (allowedExtensions.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: .${ext}. Allowed types: images, mp4/webm videos, pdf/doc files.`));
  }
};

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit for showcase videos & course lessons
  },
  fileFilter: fileFilter,
});

