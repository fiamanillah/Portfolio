import { Request, Response } from 'express';
import sendMail from '../services/mailService';
import path from 'path';
import ejs from 'ejs';

const contactFormController = async (req: Request, res: Response) => {
    const { name, email, message } = req.body;

    try {
        // Load email templates concurrently
        const [userTemplate, adminTemplate] = await Promise.all([
            ejs.renderFile(path.join(__dirname, '../emails/templates/userTemplate.ejs'), { name }),
            ejs.renderFile(path.join(__dirname, '../emails/templates/adminTemplate.ejs'), {
                name,
                email,
                message,
            }),
        ]);

        // Send emails concurrently
        const [userMailInfo, adminMailInfo] = await Promise.all([
            sendMail(email, `Thank You ${name} for Reaching Out!`, userTemplate),
            sendMail('fiamanillahb2@gmail.com', 'Portfolio Contact Form Submission', adminTemplate),
        ]);

        res.status(200).json({ userMailInfo, adminMailInfo });
    } catch (error) {
        console.error('Email sending error:', error);
        res.status(500).json({ message: 'Error sending email' });
    }
};

export default contactFormController;
