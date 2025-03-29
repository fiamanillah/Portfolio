'use client';

import { Progress } from '@/components/ui/progress';
import axiosInstance from '@/utils/axiosInstance';
import { UploadCloudIcon, X } from 'lucide-react';
import Image from 'next/image';
import React, { useRef, useState, useEffect } from 'react';

type ThumbnailUploaderProps = {
    uploadHandler: (url: string) => void; // Callback to handle the uploaded image URL
    initialImage?: string; // Optional initial image URL
};

export default function ThumbnailUploader({ uploadHandler, initialImage }: ThumbnailUploaderProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [dragActive, setDragActive] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Set the initial image if provided
    useEffect(() => {
        if (initialImage) {
            setUploadedImageUrl(initialImage);
        }
    }, [initialImage]);

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setDragActive(true);
    };

    const handleDragLeave = () => {
        setDragActive(false);
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setDragActive(false);

        const selectedFile = event.dataTransfer.files?.[0];
        if (selectedFile) {
            processFile(selectedFile);
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            processFile(selectedFile);
        }
    };

    const processFile = (selectedFile: File) => {
        setPreviewUrl(URL.createObjectURL(selectedFile));
        setErrorMessage(null);
        handleUpload(selectedFile);
    };

    const handleRemoveFile = () => {
        setPreviewUrl(null);
        setUploadedImageUrl(null);
        setErrorMessage(null);
        if (inputRef.current) {
            inputRef.current.value = '';
        }
    };

    const handleUpload = async (file: File) => {
        setUploadProgress(0);
        setErrorMessage(null);
        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await axiosInstance.post('/api/uploadImage/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: progressEvent => {
                    const progress = Math.round(
                        (progressEvent.loaded * 100) / (progressEvent.total || 1)
                    );
                    setUploadProgress(progress);
                },
            });

            if (response.data?.file?.url) {
                setUploadedImageUrl(response.data.file.url);
                uploadHandler(response.data.file.url); // Pass the uploaded URL to the parent
            } else {
                throw new Error('Invalid response from server');
            }
        } catch (error) {
            setErrorMessage('Upload failed. Please try again.');
            console.error('Upload error:', error);
        } finally {
            setUploadProgress(0);
        }
    };

    return (
        <div className="h-full space-y-2">
            <div
                className="flex flex-col justify-center items-center w-full h-full p-4 rounded-3xl bg-card aspect-video"
                onClick={() => inputRef.current?.click()}
            >
                <input
                    type="file"
                    name="featuredImage"
                    className="hidden"
                    ref={inputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                />

                <div
                    className={`border-dashed border-2 flex flex-col items-center justify-center w-full h-full rounded-2xl ${
                        dragActive ? 'border-primary' : 'border-border'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    {uploadedImageUrl ? (
                        <div className="relative w-full h-full">
                            <Image
                                src={uploadedImageUrl}
                                alt="Uploaded Preview"
                                width={500}
                                height={300}
                                className="w-full h-full object-cover rounded-2xl"
                                priority
                            />
                            <button
                                type="button"
                                onClick={e => {
                                    e.stopPropagation();
                                    handleRemoveFile();
                                }}
                                className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white hover:bg-red-600"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ) : previewUrl ? (
                        <div className="relative w-full h-full">
                            <Image
                                src={previewUrl}
                                alt="Preview"
                                width={500}
                                height={300}
                                className="w-full h-full object-cover rounded-2xl"
                                priority
                            />
                            {uploadProgress > 0 && (
                                <div className="absolute bottom-0 left-0 right-0 p-2 bg-black bg-opacity-50">
                                    <Progress value={uploadProgress} className="h-2" />
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            <UploadCloudIcon className="w-20 h-20" />
                            <p className="mt-4 text-sm text-muted-foreground">
                                Drop your image here, or click to select a file
                            </p>
                        </>
                    )}
                </div>
            </div>

            {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}
        </div>
    );
}
