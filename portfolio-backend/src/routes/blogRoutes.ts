import express from 'express';
import {
    addBlogCategory,
    deleteBlogCategory,
    getBlogCategory,
} from '../controllers/blogCategoryController';

import {
    addBlogPost,
    getAllBlogPosts,
    getBlogPostById,
    updateBlogPost,
    deleteBlogPost,
    getAllDrafedBlogPosts,
    getAllPublishedBlogPosts,
    getAllArchivedBlogPosts,
} from '../controllers/blogController';

import asyncHandler from '../utils/asyncHandler';

const blogRoutes = express.Router();

blogRoutes.post('/categories', asyncHandler(addBlogCategory));
blogRoutes.delete('/categories/:id', asyncHandler(deleteBlogCategory));
blogRoutes.get('/categories', getBlogCategory);

//
blogRoutes.post('/posts', asyncHandler(addBlogPost));
blogRoutes.get('/posts', asyncHandler(getAllBlogPosts));
blogRoutes.get('/posts/drafts', asyncHandler(getAllDrafedBlogPosts));
blogRoutes.get('/posts/published', asyncHandler(getAllPublishedBlogPosts));
blogRoutes.get('/posts/archived', asyncHandler(getAllArchivedBlogPosts));

blogRoutes.get('/posts/:id', asyncHandler(getBlogPostById));
blogRoutes.put('/posts/:id', asyncHandler(updateBlogPost));
blogRoutes.delete('/posts/:id', asyncHandler(deleteBlogPost));

export default blogRoutes;
