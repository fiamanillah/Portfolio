import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
    name: string;
    email: string;
    password?: string;
    googleId?: string;
    role: 'user' | 'admin';
    isVerified: boolean;
    verificationToken?: string;
    passwordResetToken?: string;
    passwordResetExpires?: Date;
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true, lowercase: true },
        password: { type: String, select: false },
        googleId: { type: String, select: false },
        role: { type: String, enum: ['user', 'admin'], default: 'user' },
        isVerified: { type: Boolean, default: false },
        verificationToken: { type: String, select: false },
        passwordResetToken: { type: String, select: false },
        passwordResetExpires: { type: Date, select: false },
    },
    { timestamps: true }
);

// Hash password before saving
userSchema.pre<IUser>('save', async function (next) {
    if (!this.isModified('password') || !this.password) return next();

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    if (!this.password) return false;
    return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model<IUser>('User', userSchema);
export default User;
