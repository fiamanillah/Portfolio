// src/config/env.ts
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Define the shape of the environment variables
interface Env {
    PORT: number;
    NODE_ENV: string;
    MONGO_URI: string;

    SMTP_HOST: string;
    SMTP_PORT: number;
    SMTP_USER: string;
    SMTP_PASS: string;

    // JWT configuration
    JWT_SECRET: string;
    REFRESH_TOKEN_SECRET: string;

    // Google OAuth configuration
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;
    GOOGLE_CALLBACK_URL: string;
}

// Validate and export environment variables
const env: Env = {
    PORT: parseInt(process.env.PORT || '3000', 10),
    NODE_ENV: process.env.NODE_ENV || 'development',
    MONGO_URI: process.env.MONGO_URI || '',
    SMTP_HOST: process.env.SMTP_HOST || '',
    SMTP_PORT: parseInt(process.env.SMTP_PORT || '', 10),
    SMTP_USER: process.env.SMTP_USER || '',
    SMTP_PASS: process.env.SMTP_PASS || '',

    // JWT configuration
    JWT_SECRET: process.env.JWT_SECRET || '',
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET || '',

    // Google OAuth configuration
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
    GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL || '',
};

// Validate required environment variables
if (!env.MONGO_URI) {
    throw new Error('MONGO_URI is not defined in .env');
}

if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
    throw new Error('SMTP configuration is not defined in .env');
}

if (!env.JWT_SECRET || !env.REFRESH_TOKEN_SECRET) {
    throw new Error('JWT configuration is not defined in .env');
}

if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET || !env.GOOGLE_CALLBACK_URL) {
    throw new Error('Google OAuth configuration is not defined in .env');
}

export default env;

// This snippet loads environment variables from a .env file, defines the shape of the environment variables, validates the required environment variables, and exports the environment variables for use in other parts of the application.
