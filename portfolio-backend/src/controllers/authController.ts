import { Request, Response, NextFunction } from 'express';
import User, { IUser } from '../models/user.model';
import { sendTokenResponse } from '../utils/token';
import { sendVerificationEmail } from '../services/verificationEmailService';
import crypto from 'crypto';
import { ZodError, z } from 'zod';

// Input validation
const registerSchema = z.object({
    name: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(6),
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email, password } = registerSchema.parse(req.body);

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email already in use' });
        }

        const verificationToken = crypto.randomBytes(20).toString('hex');

        const user: IUser = await User.create({
            name,
            email,
            password,
            verificationToken,
        });

        await sendVerificationEmail(email, verificationToken, name);

        sendTokenResponse(String(user._id), 201, res);
    } catch (error) {
        if (error instanceof ZodError) {
            return res.status(400).json({ success: false, message: error.errors });
        }
        next(error);
    }
};
