'use client';

import React, { useState } from 'react';
import { BlogPost } from '@/types/blog';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Edit, Trash, Loader2 } from 'lucide-react';
import axiosInstance from '@/utils/axiosInstance';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface BlogCardProps {
    blogData: BlogPost;
    setBlogs: React.Dispatch<React.SetStateAction<BlogPost[]>>;
}

export default function BlogCard({ blogData, setBlogs }: BlogCardProps) {
    const [deleteLoading, setDeleteLoading] = useState(false);

    async function deleteBlogPost(_id: string) {
        if (!_id || deleteLoading) return;

        setDeleteLoading(true);
        try {
            const response = await axiosInstance.delete(`/api/blog/posts/${_id}`);
            if (response.status === 200) {
                setBlogs(prev => prev.filter(blog => blog._id !== _id));
                toast.success('Blog post deleted successfully.');
            }
        } catch (error) {
            console.error('Error deleting blog post:', error);
            toast.error('Failed to delete the blog post. Please try again.');
        } finally {
            setDeleteLoading(false);
        }
    }

    return (
        <div className="bg-card p-4 rounded-2xl border flex flex-col justify-between gap-4 h-full">
            <div className="flex flex-col gap-4">
                <div className="relative aspect-video w-full rounded-2xl border overflow-hidden">
                    <Image
                        src={blogData.thumbnailUrl || '/window.svg'}
                        alt={blogData.title || 'Thumbnail'}
                        fill
                        sizes="500px"
                        className="object-cover"
                        priority
                    />
                </div>
                <div>
                    <h2 className="text-lg font-semibold line-clamp-2">{blogData.title}</h2>
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
                        {blogData.excerpt}
                    </p>
                </div>
            </div>
            <div className="flex gap-2">
                <Link href={`/dashboard/blog/edit-post/${blogData._id}`} className="flex-1">
                    <Button variant="outline" size={'sm'} className="w-full">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                    </Button>
                </Link>

                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="destructive" size={'sm'} className="flex-1">
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Are you absolutely sure?</DialogTitle>
                            <DialogDescription>
                                This action cannot be undone. This will permanently delete your blog
                                post.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button
                                variant="destructive"
                                onClick={() => deleteBlogPost(blogData._id || '')}
                                disabled={deleteLoading}
                            >
                                {deleteLoading ? (
                                    <>
                                        <Loader2 className="animate-spin h-4 w-4 mr-2" />
                                        Deleting...
                                    </>
                                ) : (
                                    'Delete'
                                )}
                            </Button>
                            <DialogClose asChild>
                                <Button type="button" variant="secondary">
                                    Cancel
                                </Button>
                            </DialogClose>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
