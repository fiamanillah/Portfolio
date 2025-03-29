import { Label } from '@/components/ui/label';
import { lazy } from 'react';

interface ThumbnailSectionProps {
    thumbnailUrl: string;
    onThumbnailUpload: (url: string) => void;
}

const ThumbnailUploader = lazy(
    () => import('@/components/blog/BlogForm/sections/ThumbnailUploader')
);

export default function ThumbnailSection({
    thumbnailUrl,
    onThumbnailUpload,
}: ThumbnailSectionProps) {
    return (
        <div className="sm:col-span-2 sm:row-span-2 order-last lg:order-none aspect-video">
            <Label htmlFor="thumbnail" className="text-lg font-semibold">
                Thumbnail
            </Label>
            <ThumbnailUploader uploadHandler={onThumbnailUpload} initialImage={thumbnailUrl} />
        </div>
    );
}
