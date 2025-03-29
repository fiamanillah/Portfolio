import React, { useState, useEffect } from 'react';
import { Editor } from '@tiptap/react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LinkIcon, UnlinkIcon } from 'lucide-react';
import { Toggle } from '@/components/ui/toggle';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';

interface LinkOptionsProps {
    editor: Editor;
}

const LinkOptions = ({ editor }: LinkOptionsProps) => {
    const [url, setUrl] = useState<string>('');
    const [isUrlValid, setIsUrlValid] = useState<boolean>(true);

    const isLinkActive = editor.isActive('link');

    useEffect(() => {
        if (isLinkActive) {
            const linkAttributes = editor.getAttributes('link');
            setUrl(linkAttributes.href || '');
        } else {
            setUrl('');
        }
    }, [isLinkActive, editor]);

    useEffect(() => {
        if (url) {
            const isValid = validateUrl(url);
            setIsUrlValid(isValid);
        } else {
            setIsUrlValid(true);
        }
    }, [url]);

    const validateUrl = (inputUrl: string): boolean => {
        const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
        return urlPattern.test(inputUrl);
    };

    const handleSetLink = () => {
        if (url && isUrlValid) {
            editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
        }
    };

    const handleRemoveLink = () => {
        editor.chain().focus().unsetLink().run();
    };

    return (
        <TooltipProvider>
            <Popover>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <PopoverTrigger asChild>
                            <Toggle pressed={isLinkActive}>
                                <LinkIcon className="w-4 h-4" />
                            </Toggle>
                        </PopoverTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                        {isLinkActive ? 'Remove Link' : 'Add/Edit Link'}
                    </TooltipContent>
                </Tooltip>

                <PopoverContent className="w-80">
                    <div className="flex flex-col gap-4">
                        <Input
                            type="text"
                            placeholder="Enter URL"
                            value={url}
                            onChange={e => setUrl(e.target.value)}
                            className={!isUrlValid ? 'border-destructive' : ''}
                        />
                        {!isUrlValid && (
                            <p className="text-sm text-destructive">Please enter a valid URL.</p>
                        )}

                        <div className="flex gap-2">
                            <Button
                                onClick={handleSetLink}
                                disabled={!url || !isUrlValid}
                                className="flex-1"
                            >
                                {isLinkActive ? 'Update Link' : 'Set Link'}
                            </Button>
                            {isLinkActive && (
                                <Button
                                    onClick={handleRemoveLink}
                                    variant="destructive"
                                    className="flex-1"
                                >
                                    <UnlinkIcon className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </TooltipProvider>
    );
};

export default LinkOptions;
