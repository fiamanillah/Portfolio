// formReducer.ts

import { Action, BlogPost } from '@/types/blog';

export const formReducer = (state: BlogPost, action: Action): BlogPost => {
    switch (action.type) {
        case 'UPDATE_FIELD':
            return { ...state, [action.field]: action.value };
        case 'UPDATE_SEO_METADATA':
            return {
                ...state,
                seoMetadata: { ...state.seoMetadata, [action.field]: action.value },
            };
        case 'UPDATE_CATEGORY':
            return { ...state, categories: action.value };
        case 'UPDATE_TAGS':
            return { ...state, tags: action.value };
        case 'UPDATE_THUMBNAIL':
            return { ...state, thumbnailUrl: action.value };
        case 'UPDATE_STATUS':
            return { ...state, status: action.value };
        default:
            return state;
    }
};

export const initialFormState = (initialData?: Partial<BlogPost>): BlogPost => ({
    title: '',
    slug: '',
    content: '',
    categories: '',
    tags: [],
    status: 'draft',
    visibility: 'public',
    excerpt: '',
    thumbnailUrl: '',
    isFeatured: false,
    readingTimeMinutes: 0,
    seoMetadata: {
        title: '',
        description: '',
        keywords: [],
    },
    authorName: 'Fi Amanillah',
    authorId: null,
    isArchived: false,
    viewCount: 0,
    commentCount: 0,
    ...initialData,
});
