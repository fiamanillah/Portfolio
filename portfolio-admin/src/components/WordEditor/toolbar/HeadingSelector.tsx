import React from 'react';
import { Editor } from '@tiptap/react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
    PilcrowIcon,
    Heading1Icon,
    Heading2Icon,
    Heading3Icon,
    Heading4Icon,
    Heading5Icon,
    Heading6Icon,
} from 'lucide-react';

interface HeadingSelectorProps {
    editor: Editor;
}

const HeadingSelector = ({ editor }: HeadingSelectorProps) => {
    if (!editor) return null;

    const getCurrentHeading = () => {
        const levels = [1, 2, 3, 4, 5, 6] as const;
        for (const level of levels) {
            if (editor.isActive('heading', { level })) {
                return `heading${level}`;
            }
        }
        return 'paragraph';
    };

    const handleSelectChange = (value: string) => {
        if (value === 'paragraph') {
            editor.chain().focus().setParagraph().run();
        } else if (value.startsWith('heading')) {
            const level = parseInt(value.replace('heading', ''), 10) as 1 | 2 | 3 | 4 | 5 | 6;
            editor.chain().focus().toggleHeading({ level }).run();
        }
    };

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div>
                        <Select onValueChange={handleSelectChange} value={getCurrentHeading()}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Heading" />
                            </SelectTrigger>
                            <SelectContent>
                                {[
                                    { value: 'paragraph', icon: PilcrowIcon },
                                    { value: 'heading1', icon: Heading1Icon },
                                    { value: 'heading2', icon: Heading2Icon },
                                    { value: 'heading3', icon: Heading3Icon },
                                    { value: 'heading4', icon: Heading4Icon },
                                    { value: 'heading5', icon: Heading5Icon },
                                    { value: 'heading6', icon: Heading6Icon },
                                ].map(({ value, icon: Icon }) => (
                                    <SelectItem key={value} value={value}>
                                        <Icon size={16} />
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </TooltipTrigger>
                <TooltipContent>Select heading level</TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};

export default HeadingSelector;
