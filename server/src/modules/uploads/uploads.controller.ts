import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { supabase } from '../../config/supabase.js';
import { apiSuccess, apiError } from '../../utils/response.js';

// Memory storage works in Vercel Serverless Functions as well as Node.js servers
const storage = multer.memoryStorage();

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/svg+xml',
    'image/gif',
  ];
  if (allowedMimeTypes.includes(file.mimetype.toLowerCase())) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, WEBP, GIF, and SVG images are permitted.'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB maximum file size
  },
});

const BUCKET_NAME = 'decoration-images';

async function uploadFileToSupabase(
  buffer: Buffer,
  originalName: string,
  mimetype: string
): Promise<{ url: string; storagePath: string }> {
  const ext = path.extname(originalName) || '.jpg';
  const cleanBase = path
    .basename(originalName, ext)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-');
  const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  const storagePath = `portfolio/${cleanBase}-${uniqueId}${ext}`;

  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(storagePath, buffer, {
        contentType: mimetype,
        upsert: true,
      });

    if (error) {
      console.warn('⚠️ Supabase Storage upload warning:', error.message);
      throw error;
    }

    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data?.path || storagePath);

    return {
      url: publicUrlData.publicUrl,
      storagePath: data?.path || storagePath,
    };
  } catch (err: any) {
    console.warn('⚠️ Falling back to local/dataURL representation due to storage error:', err?.message);
    // Fallback: If local uploads dir exists, write locally
    try {
      const uploadDir = path.resolve(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const filename = `decor-${uniqueId}${ext}`;
      fs.writeFileSync(path.join(uploadDir, filename), buffer);
      return {
        url: `/uploads/${filename}`,
        storagePath: filename,
      };
    } catch {
      // If even local disk fails (read-only filesystem on Vercel), return data uri fallback
      const base64 = buffer.toString('base64');
      return {
        url: `data:${mimetype};base64,${base64}`,
        storagePath: `inline-${uniqueId}`,
      };
    }
  }
}

export class UploadsController {
  static async uploadSingle(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return apiError(res, 'No image file was uploaded', 400);
      }

      const result = await uploadFileToSupabase(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );

      return apiSuccess(
        res,
        {
          url: result.url,
          image_url: result.url,
          storage_path: result.storagePath,
          storagePath: result.storagePath,
          filename: path.basename(result.storagePath),
          originalName: req.file.originalname,
          size: req.file.size,
          mimetype: req.file.mimetype,
        },
        'Photograph uploaded successfully',
        201
      );
    } catch (error) {
      next(error);
    }
  }

  static async uploadMultiple(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
        return apiError(res, 'No image files were uploaded', 400);
      }

      const files = req.files as Express.Multer.File[];
      const uploadedResults = await Promise.all(
        files.map(async (file) => {
          const result = await uploadFileToSupabase(
            file.buffer,
            file.originalname,
            file.mimetype
          );
          return {
            url: result.url,
            image_url: result.url,
            storage_path: result.storagePath,
            storagePath: result.storagePath,
            filename: path.basename(result.storagePath),
            originalName: file.originalname,
            size: file.size,
          };
        })
      );

      return apiSuccess(res, { files: uploadedResults }, 'Photographs uploaded successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async deleteFile(req: Request, res: Response, next: NextFunction) {
    try {
      const { storagePath } = req.body;
      if (!storagePath) {
        return apiError(res, 'storagePath is required', 400);
      }

      await supabase.storage.from(BUCKET_NAME).remove([storagePath]);
      return apiSuccess(res, null, 'Photograph removed from storage');
    } catch (error) {
      next(error);
    }
  }
}
