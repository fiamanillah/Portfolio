import { Request, Response } from 'express';
import BlogCategorySchema from '../models/BlogCategorySchema';

// Get all blog categories
const getBlogCategory = async (req: Request, res: Response) => {
    try {
        const categories = await BlogCategorySchema.find();
        res.status(200).json({ success: true, data: categories });
    } catch (error: Error | any) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch blog categories',
            error: error.message,
        });
    }
};

// Add a new blog category
const addBlogCategory = async (req: Request, res: Response) => {
    const { category, description } = req.body;

    if (!category || !description) {
        return res
            .status(400)
            .json({ success: false, message: 'Category and description are required' });
    }

    try {
        // Check if a category with the same category already exists
        const existingCategory = await BlogCategorySchema.findOne({ category });

        if (existingCategory) {
            return res
                .status(400)
                .json({ success: false, message: 'Category with this name already exists' });
        }

        const newCategory = new BlogCategorySchema({ category, description });
        await newCategory.save();

        res.status(201).json({
            success: true,
            message: 'Blog category added successfully',
            data: newCategory,
        });
    } catch (error: Error | any) {
        res.status(500).json({
            success: false,
            message: 'Failed to add blog category',
            error: error.message,
        });
    }
};

// Delete a blog category by ID
const deleteBlogCategory = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const deletedCategory = await BlogCategorySchema.findByIdAndDelete(id);

        if (!deletedCategory) {
            return res.status(404).json({ success: false, message: 'Blog category not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Blog category deleted successfully',
            data: deletedCategory,
        });
    } catch (error: Error | any) {
        res.status(500).json({
            success: false,
            message: 'Failed to delete blog category',
            error: error.message,
        });
    }
};

// Default controller (optional, can be removed if not needed)
const blogCategoryController = async (req: Request, res: Response) => {
    res.status(200).json({ success: true, message: 'Blog category controller is working' });
};

export { blogCategoryController, addBlogCategory, deleteBlogCategory, getBlogCategory };
