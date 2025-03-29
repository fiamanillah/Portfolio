'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import BlogCard from '@/components/blog/BlogCard';
import BlogCardsLoader from '@/components/blog/BlogCardsLoader';
import { BlogPost, Pagination } from '@/types/blog';
import axiosInstance from '@/utils/axiosInstance';
import { BlogPagination } from '@/components/blog/BlogPagination';

async function fetchBlogs(page: number = 1) {
    const response = await axiosInstance(`/api/blog/posts/archived?page=${page}&limit=6`);
    if (!response.data.success) {
        throw new Error('Failed to fetch data');
    }
    return response.data;
}

export default function Blogs() {
    const searchParams = useSearchParams();
    const page = parseInt(searchParams.get('page') || '1', 10);

    const [blogs, setBlogs] = useState<BlogPost[]>([]);
    const [pageData, setPagedata] = useState<Pagination>();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        fetchBlogs(page)
            .then(data => {
                setBlogs(data.data.blogPosts);
                setPagedata(data.data.pagination);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [page]);

    return (
        <div>
            {loading ? (
                <BlogCardsLoader />
            ) : (
                <div className="grid grid-cols-3 gap-2">
                    {blogs.map(blog => (
                        <BlogCard key={blog._id} blogData={blog} setBlogs={setBlogs} />
                    ))}
                </div>
            )}
            <BlogPagination
                totalPages={pageData?.totalPages || 1}
                currentPage={page}
                basePath="/dashboard/blog/archived?page="
            />
        </div>
    );
}
