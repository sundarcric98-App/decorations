import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { apiSuccess, apiError } from '../../utils/response.js';

const uploadDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `decor-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/svg+xml'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, WEBP, and SVG image files are allowed.'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

export class UploadsController {
  static async uploadSingle(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return apiError(res, 'No file uploaded', 400);
      }

      const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

      return apiSuccess(
        res,
        {
          url: fileUrl,
          filename: req.file.filename,
          originalName: req.file.originalname,
          size: req.file.size,
          mimetype: req.file.mimetype,
        },
        'File uploaded successfully',
        201
      );
    } catch (error) {
      next(error);
    }
  }

  static async uploadMultiple(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
        return apiError(res, 'No files uploaded', 400);
      }

      const files = req.files as Express.Multer.File[];
      const urls = files.map((file) => ({
        url: `${req.protocol}://${req.get('host')}/uploads/${file.filename}`,
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
      }));

      return apiSuccess(res, { files: urls }, 'Files uploaded successfully', 201);
    } catch (error) {
      next(error);
    }
  }
}
