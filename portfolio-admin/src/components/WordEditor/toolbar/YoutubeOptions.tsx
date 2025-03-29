import React, { useState } from 'react';
import { Editor } from '@tiptap/react';
import { YoutubeIcon } from 'lucide-react';
import { Toggle } from '@/components/ui/toggle';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';

interface YoutubeOptionsProps {
    editor: Editor;
}

const YoutubeOptions = ({ editor }: YoutubeOptionsProps) => {
    const [videoUrl, setVideoUrl] = useState<string>('');
    const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);

    const handleInsertYoutubeVideo = () => {
        if (videoUrl) {
            editor
                .chain()
                .focus()
                .setYoutubeVideo({
                    src: videoUrl,
                    width: 640,
                    height: 480,
                })
                .run();
            setVideoUrl('');
            setIsPopoverOpen(false);
        }
    };

    return (
        <TooltipProvider>
            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <PopoverTrigger asChild>
                            <Toggle pressed={isPopoverOpen} aria-label="Insert YouTube video">
                                <YoutubeIcon className="w-4 h-4" />
                            </Toggle>
                        </PopoverTrigger>
                    </TooltipTrigger>
                    <TooltipContent>Insert YouTube Video</TooltipContent>
                </Tooltip>

                <PopoverContent className="w-80">
                    <div className="flex flex-col gap-4">
                        <Input
                            type="text"
                            placeholder="Enter YouTube URL"
                            value={videoUrl}
                            onChange={e => setVideoUrl(e.target.value)}
                        />
                        <Button onClick={handleInsertYoutubeVideo} disabled={!videoUrl}>
                            Insert Video
                        </Button>
                    </div>
                </PopoverContent>
            </Popover>
        </TooltipProvider>
    );
};

export default YoutubeOptions;
