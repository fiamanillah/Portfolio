'use client';
import { useState, useEffect, use } from 'react';
import axiosInstance from '@/utils/axiosInstance';
import { BlogPost } from '@/types/blog';
import BlogForm from '@/components/blog/BlogForm/index';

export default function EditPost({ params }: { params: Promise<{ _id: string }> }) {
    const param = use(params);
    const _id = param._id;
    const [existingPost, setExistingPost] = useState<BlogPost | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const response = await axiosInstance.get<{ data: BlogPost }>(
                    `/api/blog/posts/${_id}`
                );
                if (response.data?.data) {
                    setExistingPost(response.data.data);
                } else {
                    setError('Failed to fetch post data');
                }
            } catch (err: unknown) {
                setError(
                    err instanceof Error ? err.message : 'An error occurred while fetching the post'
                );
                console.error('Error fetching post:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPost();
    }, [_id]);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!existingPost) {
        return <div>Post not found</div>;
    }

    return (
        <div>
            <h1 className="mt-5 text-center">Edit Blog Post</h1>

            <BlogForm initialData={existingPost} />
        </div>
    );
}
