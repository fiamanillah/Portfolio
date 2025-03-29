import React from 'react';
import { Editor } from '@tiptap/react';
import { Minus } from 'lucide-react';
import { Toggle } from '@/components/ui/toggle';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface HorizontalRuleOptionProps {
    editor: Editor;
}

const HorizontalRuleOption = ({ editor }: HorizontalRuleOptionProps) => {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Toggle
                        onPressedChange={() => editor.chain().focus().setHorizontalRule().run()}
                    >
                        <Minus size={16} />
                    </Toggle>
                </TooltipTrigger>
                <TooltipContent>Insert Horizontal Rule</TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};

export default HorizontalRuleOption;
