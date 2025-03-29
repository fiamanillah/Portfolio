import BlogForm from '@/components/blog/BlogForm';
import React from 'react';

export default async function CreatePost() {
    return (
        <div className="container mx-auto">
            <h1 className="mt-5 text-center">Create a new Post</h1>
            <BlogForm />
        </div>
    );
}
