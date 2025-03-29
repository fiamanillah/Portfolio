import { Request, Response } from 'express';

export const imageUploadController = async (req: Request, res: Response) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No image file uploaded' });
    }

    // Construct the full URL based on your server domain (replace with your actual domain or localhost)
    const fullUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    res.status(200).json({
        message: 'Image uploaded successfully',
        file: {
            filename: req.file.filename,
            url: fullUrl, // Return the full URL of the uploaded file
            mimetype: req.file.mimetype,
            size: req.file.size,
        },
    });
};
