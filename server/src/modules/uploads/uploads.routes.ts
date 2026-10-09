import { Router } from 'express';
import { UploadsController, upload } from './uploads.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = Router();

// Allow public image upload for inspiration images in enquiry form, and admin uploads
router.post('/single', upload.single('image'), UploadsController.uploadSingle);
router.post('/multiple', authenticate, upload.array('images', 10), UploadsController.uploadMultiple);

export default router;
