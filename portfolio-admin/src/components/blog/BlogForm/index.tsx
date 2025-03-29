'use client';
import React, { lazy } from 'react';

import { useBlogForm } from '@/hooks/useBlogForm';
import { BlogFormProps } from '@/types/blog';
import BasicInfoSection from './sections/BasicInfo';
import SeoSection from './sections/SeoSection';
import TaxonomySection from './sections/Taxonomy';
import ThumbnailSection from './sections/Thumbnail';
import { Label } from '@/components/ui/label';
import { BlogStatusCheckboxes } from './sections/BlogStatusCheckboxes';
import FormActions from './FormActions';

// Lazy load heavy components
const WordEditor = lazy(() => import('@/components/WordEditor/WordEditor'));

export default function BlogForm({ initialData }: BlogFormProps) {
    const {
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
    } = useBlogForm({ initialData });

    return (
        <div className="container mx-auto py-6">
            <FormActions blogData={formData} onStatusChange={handleStatusChange} />

            <form>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    <BasicInfoSection
                        title={formData.title}
                        slug={formData.slug}
                        excerpt={formData.excerpt}
                        onInputChange={handleInputChange}
                    />
                    <TaxonomySection
                        category={formData.categories}
                        tags={formData.tags.join(',')}
                        onCategoryChange={handleCategoryChange}
                        onTagsChange={handleTagsChange}
                    />
                    <BlogStatusCheckboxes
                        isFeatured={formData.isFeatured}
                        onFeaturedChange={handleFeaturedChange}
                    />
                    <SeoSection
                        seoTitle={formData.seoMetadata.title}
                        seoDescription={formData.seoMetadata.description}
                        seoKeywords={formData.seoMetadata.keywords.join(',')}
                        onSeoMetadataChange={handleSeoMetadataChange}
                        onKeywordsChange={handleKeywordsChange}
                    />
                    <ThumbnailSection
                        thumbnailUrl={formData.thumbnailUrl}
                        onThumbnailUpload={handleThumbnailUpload}
                    />
                </div>

                <div className="mt-8 sm:col-span-2 lg:col-span-3">
                    <Label htmlFor="content" className="text-lg font-semibold">
                        Content
                    </Label>
                    <WordEditor
                        onContentChange={handleContentChange}
                        initialContent={formData.content}
                    />
                </div>
            </form>
        </div>
    );
}
