import { Router } from 'express';
import { UploadsController, upload } from './uploads.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

export const uploadsRouter = Router();

uploadsRouter.use(authenticate);
uploadsRouter.post('/single', upload.single('file'), UploadsController.uploadSingle);
uploadsRouter.post('/multiple', upload.array('files', 15), UploadsController.uploadMultiple);
uploadsRouter.post('/', upload.single('file'), UploadsController.uploadSingle);
uploadsRouter.delete('/', UploadsController.deleteFile);

export default uploadsRouter;
