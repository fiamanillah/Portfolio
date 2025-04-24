import jwt from 'jsonwebtoken';
import { Response } from 'express';
import env from '../config/env';

const { JWT_SECRET, REFRESH_TOKEN_SECRET } = env;

export const signToken = (_id: string) => {
    const token = jwt.sign({ _id }, JWT_SECRET!, {
        expiresIn: '30d',
    });

    return token;
};

export const createRefreshToken = (_id: string) => {
    return jwt.sign({ _id }, REFRESH_TOKEN_SECRET!, {
        expiresIn: '90d',
    });
};

export const sendTokenResponse = (userId: string, statusCode: number, res: Response) => {
    const token = signToken(userId);
    const refreshToken = createRefreshToken(userId);

    const cookieOptions = {
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
    };

    res.status(statusCode).cookie('refreshToken', refreshToken, cookieOptions).json({
        success: true,
        token,
    });
};
