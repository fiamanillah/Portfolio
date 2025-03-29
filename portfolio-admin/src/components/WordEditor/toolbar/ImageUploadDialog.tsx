import React, { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Editor } from '@tiptap/react';
import { ImagePlus } from 'lucide-react';
import { Toggle } from '@/components/ui/toggle';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';

interface ImageUploadDialogProps {
    editor: Editor;
}

export default function ImageUploadDialog({ editor }: ImageUploadDialogProps) {
    const [imageUrl, setImageUrl] = useState<string>('');

    const handleImageUpload = () => {
        if (imageUrl) {
            editor.chain().focus().setImage({ src: imageUrl }).run();
            setImageUrl('');
        }
    };

    return (
        <TooltipProvider>
            <Popover>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <PopoverTrigger asChild>
                            <Toggle>
                                <ImagePlus />
                            </Toggle>
                        </PopoverTrigger>
                    </TooltipTrigger>
                    <TooltipContent>Upload Image</TooltipContent>
                </Tooltip>

                <PopoverContent className="w-80">
                    <div className="flex flex-col gap-4">
                        <h3 className="font-semibold">Upload Image</h3>
                        <Input
                            type="text"
                            placeholder="Enter image URL"
                            value={imageUrl}
                            onChange={e => setImageUrl(e.target.value)}
                        />
                        <Button onClick={handleImageUpload}>Insert Image</Button>
                    </div>
                </PopoverContent>
            </Popover>
        </TooltipProvider>
    );
}
