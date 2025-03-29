import React from 'react';

export default function layout({ children }) {
    return (
        <div>
            <h1 className="text-center mt-5">Published Blogs</h1>
            {children}
        </div>
    );
}
