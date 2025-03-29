import mongoose, { Schema } from 'mongoose';

// Define enums for status and visibility
const BlogPostStatus = {
    DRAFT: 'draft',
    PUBLISHED: 'published',
    ARCHIVED: 'archived',
};

const BlogPostVisibility = {
    PUBLIC: 'public',
    PRIVATE: 'private',
};

const blogPostSchema = new Schema(
    {
        // Title of the blog post
        title: {
            type: String,
            trim: true,
        },

        // URL-friendly version of the title
        slug: {
            type: String,
            lowercase: true,
            trim: true,
            match: /^[a-z0-9-]+$/, // Ensure slug contains only lowercase letters, numbers, and hyphens
        },

        // Main content of the blog post
        content: {
            type: String,
        },

        // Name of the author (defaults to 'Fi Amanillah')
        authorName: {
            type: String,
            default: 'Fi Amanillah',
            trim: true,
        },

        // Reference to the User model for the author
        authorId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },

        // Current status of the blog post (draft, published, archived)
        status: {
            type: String,
            enum: Object.values(BlogPostStatus),
            default: BlogPostStatus.DRAFT,
        },

        // Visibility of the blog post (public or private)
        visibility: {
            type: String,
            enum: Object.values(BlogPostVisibility),
            default: BlogPostVisibility.PUBLIC,
        },

        // Categories associated with the blog post
        categories: {
            type: String,
            trim: true,
        },

        // Tags associated with the blog post
        tags: [
            {
                type: String,
                trim: true,
            },
        ],

        // Short excerpt or summary of the blog post
        excerpt: {
            type: String,
            trim: true,
            maxlength: 300, // Limit excerpt length
        },

        // URL of the thumbnail image for the blog post
        thumbnailUrl: {
            type: String,
            trim: true,
        },

        // Whether the post is featured
        isFeatured: {
            type: Boolean,
            default: false,
        },

        // Number of views the post has received
        viewCount: {
            type: Number,
            default: 0,
            min: 0, // Ensure view count is non-negative
        },

        // Number of comments on the post
        commentCount: {
            type: Number,
            default: 0,
            min: 0, // Ensure comment count is non-negative
        },

        // Estimated reading time in minutes
        readingTimeMinutes: {
            type: Number,
            min: 0, // Ensure reading time is non-negative
        },

        // SEO metadata for the blog post
        seoMetadata: {
            title: {
                type: String,
                trim: true,
                maxlength: 100, // Limit SEO title length
            },
            description: {
                type: String,
                trim: true,
                maxlength: 200, // Limit SEO description length
            },
            keywords: [
                {
                    type: String,
                    trim: true,
                },
            ],
        },

        // Related blog posts (references to other BlogPost documents)
        relatedPosts: [
            {
                type: Schema.Types.ObjectId,
                ref: 'BlogPost',
            },
        ],
    },
    {
        timestamps: true, // Automatically add `createdAt` and `updatedAt` fields
    }
);

export default mongoose.model('BlogPost', blogPostSchema);
