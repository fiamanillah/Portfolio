// src/types/blog.ts

export interface SeoMetadata {
    title: string;
    description: string;
    keywords: string[];
}

export interface BlogPost {
    _id?: string;
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    thumbnailUrl: string;
    categories: string;
    tags: string[];
    seoMetadata: SeoMetadata;
    authorName: string;
    authorId: string | null;
    isArchived: boolean;
    status: string;
    visibility: string;
    isFeatured: boolean;
    viewCount: number;
    commentCount: number;
    readingTimeMinutes: number;
}

export interface Pagination {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
}

export interface BlogApiResponse {
    success: boolean;
    message: string;
    data: {
        blogPosts: BlogPost[];
        pagination: Pagination;
    };
}

export type Action =
    | { type: 'UPDATE_FIELD'; field: string; value: string | number | boolean | string[] }
    | { type: 'UPDATE_SEO_METADATA'; field: string; value: string | string[] }
    | { type: 'UPDATE_CATEGORY'; value: string }
    | { type: 'UPDATE_TAGS'; value: string[] }
    | { type: 'UPDATE_THUMBNAIL'; value: string }
    | { type: 'UPDATE_STATUS'; value: string };

export interface BlogFormProps {
    initialData?: Partial<BlogPost>;
}

export interface BasicInfoProps {
    title: string;
    slug: string;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface SeoSectionProps {
    seoTitle: string;
    seoDescription: string;
    seoKeywords: string;
    onSeoMetadataChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    onKeywordsChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface TaxonomySectionProps {
    category: string;
    tags: string;
    onCategoryChange: (categoryId: string) => void;
    onTagsChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface MetaSectionProps {
    excerpt: string;
    readingTime: number;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export interface ThumbnailSectionProps {
    thumbnailUrl: string;
    onThumbnailUpload: (url: string) => void;
}
