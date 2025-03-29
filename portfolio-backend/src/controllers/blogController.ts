import { Request, Response } from 'express';
import BlogPostSchema from '../models/BlogPostSchema';
import calculateReadingTime from '../utils/readingTimeCalculator';

// Constants for status codes and messages
const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
};

const MESSAGES = {
    BLOG_POST_ADDED: 'Blog post added successfully',
    BLOG_POST_FETCHED: 'Blog post fetched successfully',
    BLOG_POSTS_FETCHED: 'Blog posts fetched successfully',
    BLOG_POST_UPDATED: 'Blog post updated successfully',
    BLOG_POST_DELETED: 'Blog post deleted successfully',
    BLOG_POST_NOT_FOUND: 'Blog post not found',
    ERROR_ADDING_BLOG_POST: 'Error adding blog post',
    ERROR_FETCHING_BLOG_POST: 'Error fetching blog post',
    ERROR_UPDATING_BLOG_POST: 'Error updating blog post',
    ERROR_DELETING_BLOG_POST: 'Error deleting blog post',
};

// Utility function for error handling
const handleError = (res: Response, statusCode: number, message: string, error: any) => {
    console.error(message, error);
    res.status(statusCode).json({
        success: false,
        message,
        error: error.message,
    });
};

// Add a new blog post
const addBlogPost = async (req: Request, res: Response) => {
    try {
        const content = req.body.content || '';
        const readingTime = calculateReadingTime(content);

        const newBlogPost = new BlogPostSchema({
            ...req.body,
            readingTimeMinutes: readingTime,
        });

        const savedBlogPost = await newBlogPost.save();
        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: MESSAGES.BLOG_POST_ADDED,
            data: savedBlogPost,
        });
    } catch (error: any) {
        handleError(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, MESSAGES.ERROR_ADDING_BLOG_POST, error);
    }
};

// Get all blog posts with pagination
const getAllBlogPosts = async (req: Request, res: Response) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const pageNumber = Number(page);
        const limitNumber = Number(limit);

        // Fetch the total number of blog posts
        const totalBlogPosts = await BlogPostSchema.countDocuments();

        // Calculate the total number of pages
        const totalPages = Math.ceil(totalBlogPosts / limitNumber);

        // Fetch the paginated blog posts
        const blogPosts = await BlogPostSchema.find()
            .sort({ createdAt: -1 })
            .limit(limitNumber)
            .skip((pageNumber - 1) * limitNumber)
            .exec();

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: MESSAGES.BLOG_POSTS_FETCHED,
            data: {
                blogPosts,
                pagination: {
                    currentPage: pageNumber,
                    totalPages,
                    totalItems: totalBlogPosts,
                    itemsPerPage: limitNumber,
                },
            },
        });
    } catch (error: any) {
        handleError(
            res,
            HTTP_STATUS.INTERNAL_SERVER_ERROR,
            MESSAGES.ERROR_FETCHING_BLOG_POST,
            error
        );
    }
};

//Get All Drafed Blog Posts
const getAllDrafedBlogPosts = async (req: Request, res: Response) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const pageNumber = Number(page);
        const limitNumber = Number(limit);

        // Fetch the total number of blog posts
        const totalBlogPosts = await BlogPostSchema.countDocuments({ status: 'draft' });

        // Calculate the total number of pages
        const totalPages = Math.ceil(totalBlogPosts / limitNumber);

        const blogPosts = await BlogPostSchema.find({ status: 'draft' })
            .sort({ createdAt: -1 })
            .limit(limitNumber)
            .skip((pageNumber - 1) * limitNumber)
            .exec();
        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: MESSAGES.BLOG_POSTS_FETCHED,
            data: {
                blogPosts,
                pagination: {
                    currentPage: pageNumber,
                    totalPages,
                    totalItems: totalBlogPosts,
                    itemsPerPage: limitNumber,
                },
            },
        });
    } catch (error: any) {
        handleError(
            res,
            HTTP_STATUS.INTERNAL_SERVER_ERROR,
            MESSAGES.ERROR_FETCHING_BLOG_POST,
            error
        );
    }
};

//Get All Drafed Blog Posts
const getAllPublishedBlogPosts = async (req: Request, res: Response) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const pageNumber = Number(page);
        const limitNumber = Number(limit);

        // Fetch the total number of blog posts
        const totalBlogPosts = await BlogPostSchema.countDocuments({ status: 'published' });

        // Calculate the total number of pages
        const totalPages = Math.ceil(totalBlogPosts / limitNumber);

        const blogPosts = await BlogPostSchema.find({ status: 'published' })
            .sort({ createdAt: -1 })
            .limit(limitNumber)
            .skip((pageNumber - 1) * limitNumber)
            .exec();
        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: MESSAGES.BLOG_POSTS_FETCHED,
            data: {
                blogPosts,
                pagination: {
                    currentPage: pageNumber,
                    totalPages,
                    totalItems: totalBlogPosts,
                    itemsPerPage: limitNumber,
                },
            },
        });
    } catch (error: any) {
        handleError(
            res,
            HTTP_STATUS.INTERNAL_SERVER_ERROR,
            MESSAGES.ERROR_FETCHING_BLOG_POST,
            error
        );
    }
};

//Get All Drafed Blog Posts
const getAllArchivedBlogPosts = async (req: Request, res: Response) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const pageNumber = Number(page);
        const limitNumber = Number(limit);

        // Fetch the total number of blog posts
        const totalBlogPosts = await BlogPostSchema.countDocuments({ status: 'archived' });

        // Calculate the total number of pages
        const totalPages = Math.ceil(totalBlogPosts / limitNumber);

        const blogPosts = await BlogPostSchema.find({ status: 'archived' })
            .sort({ createdAt: -1 })
            .limit(limitNumber)
            .skip((pageNumber - 1) * limitNumber)
            .exec();
        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: MESSAGES.BLOG_POSTS_FETCHED,
            data: {
                blogPosts,
                pagination: {
                    currentPage: pageNumber,
                    totalPages,
                    totalItems: totalBlogPosts,
                    itemsPerPage: limitNumber,
                },
            },
        });
    } catch (error: any) {
        handleError(
            res,
            HTTP_STATUS.INTERNAL_SERVER_ERROR,
            MESSAGES.ERROR_FETCHING_BLOG_POST,
            error
        );
    }
};

// Get a blog post by ID
const getBlogPostById = async (req: Request, res: Response) => {
    try {
        const blogPost = await BlogPostSchema.findById(req.params.id);
        if (!blogPost) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: MESSAGES.BLOG_POST_NOT_FOUND,
            });
        }
        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: MESSAGES.BLOG_POST_FETCHED,
            data: blogPost,
        });
    } catch (error: any) {
        handleError(
            res,
            HTTP_STATUS.INTERNAL_SERVER_ERROR,
            MESSAGES.ERROR_FETCHING_BLOG_POST,
            error
        );
    }
};

// Update a blog post by ID
const updateBlogPost = async (req: Request, res: Response) => {
    try {
        let updateData = { ...req.body };

        // If content is being updated, recalculate reading time
        if (updateData.content) {
            updateData.readingTimeMinutes = calculateReadingTime(updateData.content);
        }

        const updatedBlogPost = await BlogPostSchema.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
        });

        if (!updatedBlogPost) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: MESSAGES.BLOG_POST_NOT_FOUND,
            });
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: MESSAGES.BLOG_POST_UPDATED,
            data: updatedBlogPost,
        });
    } catch (error: any) {
        handleError(
            res,
            HTTP_STATUS.INTERNAL_SERVER_ERROR,
            MESSAGES.ERROR_UPDATING_BLOG_POST,
            error
        );
    }
};

// Delete a blog post by ID
const deleteBlogPost = async (req: Request, res: Response) => {
    try {
        const deletedBlogPost = await BlogPostSchema.findByIdAndDelete(req.params.id);
        if (!deletedBlogPost) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: MESSAGES.BLOG_POST_NOT_FOUND,
            });
        }
        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: MESSAGES.BLOG_POST_DELETED,
        });
    } catch (error: any) {
        handleError(
            res,
            HTTP_STATUS.INTERNAL_SERVER_ERROR,
            MESSAGES.ERROR_DELETING_BLOG_POST,
            error
        );
    }
};

export {
    addBlogPost,
    getAllBlogPosts,
    getBlogPostById,
    updateBlogPost,
    deleteBlogPost,
    getAllDrafedBlogPosts,
    getAllPublishedBlogPosts,
    getAllArchivedBlogPosts,
};
