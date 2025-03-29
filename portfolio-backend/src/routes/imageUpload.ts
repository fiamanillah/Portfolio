import { Router } from 'express';
import uploadImages from '../config/imageUploadMulter';
import { imageUploadController } from '../controllers/imageUploadController';
import asyncHandler from '../utils/asyncHandler';

const imageUploadRouter = Router();

imageUploadRouter.post(
    '/upload',
    uploadImages.single('image'),
    asyncHandler(imageUploadController)
);

export default imageUploadRouter;
