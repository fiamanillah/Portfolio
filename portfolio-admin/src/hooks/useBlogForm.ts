// useBlogForm.ts
import { useReducer, useCallback, useMemo } from 'react';
import { debounce } from 'lodash';
import { BlogFormProps } from '@/types/blog';
import { formReducer, initialFormState } from '@/lib/formReducer';

export const useBlogForm = ({ initialData }: BlogFormProps) => {
    const [formData, dispatch] = useReducer(formReducer, initialFormState(initialData));

    // Memoize debounced functions
    const debouncedInputChange = useMemo(
        () =>
            debounce((field: string, value: string) => {
                dispatch({ type: 'UPDATE_FIELD', field, value });
            }, 300),
        []
    );

    const debouncedKeywordsChange = useMemo(
        () =>
            debounce((keywordsArray: string[]) => {
                dispatch({
                    type: 'UPDATE_SEO_METADATA',
                    field: 'keywords',
                    value: keywordsArray,
                });
            }, 300),
        []
    );

    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const { name, value } = e.target;
            debouncedInputChange(name, value);
        },
        [debouncedInputChange]
    );

    const handleSeoMetadataChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const { name, value } = e.target;
            dispatch({ type: 'UPDATE_SEO_METADATA', field: name, value });
        },
        []
    );

    const handleKeywordsChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const { value } = e.target;
            const keywordsArray = value.split(',').map(keyword => keyword.trim());
            debouncedKeywordsChange(keywordsArray);
        },
        [debouncedKeywordsChange]
    );

    const handleCategoryChange = useCallback((categoryId: string) => {
        dispatch({ type: 'UPDATE_CATEGORY', value: categoryId });
    }, []);

    const handleTagsChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        const tagsArray = value.split(',').map(tag => tag.trim());
        dispatch({ type: 'UPDATE_TAGS', value: tagsArray });
    }, []);

    const handleThumbnailUpload = useCallback((url: string) => {
        dispatch({ type: 'UPDATE_THUMBNAIL', value: url });
    }, []);

    const handleContentChange = useCallback((content: string) => {
        dispatch({ type: 'UPDATE_FIELD', field: 'content', value: content });
    }, []);

    // New handlers for checkboxes
    const handleFeaturedChange = useCallback((isFeatured: boolean) => {
        dispatch({ type: 'UPDATE_FIELD', field: 'isFeatured', value: isFeatured });
    }, []);

    const handleStatusChange = useCallback((status: string) => {
        dispatch({ type: 'UPDATE_STATUS', value: status });
    }, []);

    return {
        formData,
        handleInputChange,
        handleSeoMetadataChange,
        handleKeywordsChange,
        handleCategoryChange,
        handleTagsChange,
        handleThumbnailUpload,
        handleContentChange,
        handleFeaturedChange,
        handleStatusChange,
    };
};
