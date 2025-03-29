import mongoose from 'mongoose';

const BlogCategorySchema = new mongoose.Schema(
    {
        category: {
            type: String,
            required: true,
            unique: true,
        },
        description: {
            type: String,
            default: '',
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model('BlogCategory', BlogCategorySchema);
