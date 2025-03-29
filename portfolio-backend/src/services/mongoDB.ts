import mongoose from 'mongoose';
import env from '../config/env';
const connectDB = async () => {
    try {
        const connection = await mongoose.connect(env.MONGO_URI);
        console.log(`MongoDB connected: ${connection.connection.host}`);
    } catch (err) {
        console.log(err);
        process.exit(1);
    }
};

export default connectDB;
