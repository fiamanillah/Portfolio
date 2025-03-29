'use client';

import { Button } from '@/components/ui/button';
import { BlogPost } from '@/types/blog';
import axiosInstance from '@/utils/axiosInstance';
import { toast } from 'sonner';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

type FormActionsProps = {
    blogData: BlogPost;
    onStatusChange?: (newStatus: string) => void;
};

export default function FormActions({ blogData, onStatusChange }: FormActionsProps) {
    const [saveLoading, setSaveLoading] = useState(false);
    const [publishLoading, setPublishLoading] = useState(false);
    const router = useRouter();

    const handleCreatePost = async () => {
        setSaveLoading(true);
        try {
            const response = await axiosInstance.post('/api/blog/posts', blogData);
            toast.success('Draft created successfully');
            router.push(`/dashboard/blog/edit-post/${response.data.data._id}`);
        } catch (error) {
            toast.error('Failed to create draft');
            console.error('Error creating post:', error);
        } finally {
            setSaveLoading(false);
        }
    };

    const handleSave = async (status: string) => {
        setSaveLoading(true);
        try {
            const updatedData = { ...blogData, status };
            await axiosInstance.put(`/api/blog/posts/${blogData._id}`, updatedData);
            toast.success(`Post ${status === 'draft' ? 'saved as draft' : 'updated'}`);
        } catch (error) {
            toast.error('Failed to save changes');
            console.error('Error saving post:', error);
        } finally {
            setSaveLoading(false);
        }
    };

    const handlePublishToggle = async () => {
        setPublishLoading(true);
        try {
            const newStatus = blogData.status === 'published' ? 'archived' : 'published';
            const updatedData = { ...blogData, status: newStatus };
            await axiosInstance.put(`/api/blog/posts/${blogData._id}`, updatedData);
            toast.success(`Post ${newStatus === 'published' ? 'published' : 'archived'}`);
            onStatusChange?.(newStatus);
        } catch (error) {
            toast.error('Failed to update status');
            console.error('Error updating post status:', error);
        } finally {
            setPublishLoading(false);
        }
    };

    return (
        <div className="w-full flex justify-end gap-4 mb-8">
            {!blogData._id && (
                <Button onClick={handleCreatePost} disabled={saveLoading}>
                    {saveLoading ? 'Creating...' : 'Create'}
                </Button>
            )}

            <Button
                type="button"
                onClick={() => handleSave(blogData.status === 'published' ? 'published' : 'draft')}
                disabled={saveLoading}
            >
                {saveLoading ? 'Saving...' : blogData.status === 'published' ? 'Update' : 'Save'}
            </Button>

            <Button
                type="button"
                variant={blogData.status === 'published' ? 'outline' : 'default'}
                onClick={handlePublishToggle}
                disabled={publishLoading}
            >
                {publishLoading
                    ? 'Processing...'
                    : blogData.status === 'published'
                    ? 'Archive'
                    : 'Publish'}
            </Button>
        </div>
    );
}
