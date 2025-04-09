import transporter from '../config/nodemailer';

import env from '../config/env';

export const sendVerificationEmail = async (email: string, token: string, name: string) => {
    const verificationUrl = `${env.FRONTEND_URL}/verify-email?token=${token}`;

    const mailOptions = {
        from: env.EMAIL_NO_REPLAY,
        to: email,
        subject: 'Email Verification',
        html: `
        <h1>Hello ${name}</h1>
        <p>Please verify your email by clicking the link below:</p>
        <a href="${verificationUrl}">Verify Email</a>
        <p>This link will expire in 24 hours.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
};

export const sendPasswordResetEmail = async (email: string, token: string, name: string) => {
    const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${token}`;

    const mailOptions = {
        from: env.EMAIL_NO_REPLAY,
        to: email,
        subject: 'Password Reset',
        html: `
        <h1>Hello ${name}</h1>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>This link will expire in 10 minutes.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
};
