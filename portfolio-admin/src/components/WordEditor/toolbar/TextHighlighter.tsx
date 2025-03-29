import React, { useEffect, useState } from 'react';
import { Editor } from '@tiptap/react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Highlighter } from 'lucide-react';

interface TextHighlighterProps {
    editor: Editor;
}

export default function TextHighlighter({ editor }: TextHighlighterProps) {
    // Define the available highlight colors
    const highlightColors = [
        { value: 'hsla(44.92, 97%, 60%, 0.5)', label: 'Yellow' },
        { value: 'hsla(359.58, 90%, 69%, 0.5)', label: 'Red' },
        { value: 'hsla(113.86, 96%, 72%, 0.5)', label: 'Green' },
        { value: 'hsla(235.29, 94%, 68%, 0.5)', label: 'Blue' },
        { value: 'transparent', label: 'None' }, // Option to remove highlight
    ];

    // State to track the current highlight color
    const [currentColor, setCurrentColor] = useState<string | null>(null);

    // Handle color selection
    const handleColorChange = (color: string) => {
        if (color === 'transparent') {
            editor.chain().focus().unsetHighlight().run();
        } else {
            editor.chain().focus().toggleHighlight({ color }).run();
        }
        setCurrentColor(color);
    };

    // Update the current highlight color when the editor selection changes
    useEffect(() => {
        const updateCurrentColor = () => {
            const highlightAttributes = editor.getAttributes('highlight');
            setCurrentColor(highlightAttributes.color || null);
        };

        editor.on('selectionUpdate', updateCurrentColor);
        updateCurrentColor();

        return () => {
            editor.off('selectionUpdate', updateCurrentColor);
        };
    }, [editor]);

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div>
                        <Select onValueChange={handleColorChange} value={currentColor || ''}>
                            <SelectTrigger className="flex items-center gap-2">
                                {/* Show the Highlighter icon as placeholder if no color is selected */}
                                {currentColor ? <></> : <Highlighter className="w-4 h-4" />}
                                <SelectValue placeholder="" />
                            </SelectTrigger>
                            <SelectContent>
                                {highlightColors.map(({ value, label }) => (
                                    <SelectItem key={value} value={value}>
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-4 h-4 rounded-full border"
                                                style={{ backgroundColor: value }}
                                            />
                                            <span>{label}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </TooltipTrigger>
                <TooltipContent>Select highlight color</TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
