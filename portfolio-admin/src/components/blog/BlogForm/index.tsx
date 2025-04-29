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
        <div className="container mx-auto px-1 py-4">
            <FormActions blogData={formData} onStatusChange={handleStatusChange} />

            <form className="flex flex-col lg:flex-row gap-4 mt-4">
                {/* Main content column */}
                <div className="basis-8/12 space-y-4">
                    <div className="bg-card rounded-lg shadow p-4">
                        <BasicInfoSection
                            title={formData.title}
                            slug={formData.slug}
                            excerpt={formData.excerpt}
                            onInputChange={handleInputChange}
                        />
                    </div>

                    <div className="bg-card rounded-lg shadow p-4">
                        <Label htmlFor="content" className="text-base font-semibold block ">
                            Content
                        </Label>
                        <div className="min-h-[350px]">
                            <WordEditor
                                onContentChange={handleContentChange}
                                initialContent={formData.content}
                            />
                        </div>
                    </div>
                </div>

                {/* Sidebar column */}
                <div className="basis-4/12 space-y-4">
                    <div className="bg-card rounded-lg shadow p-3 space-y-3">
                        <TaxonomySection
                            category={formData.categories}
                            tags={formData.tags.join(',')}
                            onCategoryChange={handleCategoryChange}
                            onTagsChange={handleTagsChange}
                        />
                    </div>

                    <div className="bg-card rounded-lg shadow p-3">
                        <BlogStatusCheckboxes
                            isFeatured={formData.isFeatured}
                            onFeaturedChange={handleFeaturedChange}
                        />
                    </div>

                    <div className="bg-card rounded-lg shadow p-3">
                        <ThumbnailSection
                            thumbnailUrl={formData.thumbnailUrl}
                            onThumbnailUpload={handleThumbnailUpload}
                        />
                    </div>

                    <div className="bg-card rounded-lg shadow p-3 space-y-3">
                        <SeoSection
                            seoTitle={formData.seoMetadata.title}
                            seoDescription={formData.seoMetadata.description}
                            seoKeywords={formData.seoMetadata.keywords.join(',')}
                            onSeoMetadataChange={handleSeoMetadataChange}
                            onKeywordsChange={handleKeywordsChange}
                        />
                    </div>
                </div>
            </form>
        </div>
    );
}
