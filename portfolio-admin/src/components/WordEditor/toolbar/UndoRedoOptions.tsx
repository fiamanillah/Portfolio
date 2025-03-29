import React from 'react';
import { Editor } from '@tiptap/react';
import { Undo2, Redo2 } from 'lucide-react';
import { Toggle } from '@/components/ui/toggle';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';

interface UndoRedoOptionsProps {
    editor: Editor;
}

const UndoRedoOptions = ({ editor }: UndoRedoOptionsProps) => {
    return (
        <TooltipProvider>
            <div className="flex flex-wrap">
                {/* Undo Button with Tooltip */}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Toggle
                            pressed={false}
                            onPressedChange={() => editor.chain().focus().undo().run()}
                            disabled={!editor.can().undo()}
                            aria-label="Undo"
                        >
                            <Undo2 className="w-4 h-4" />
                        </Toggle>
                    </TooltipTrigger>
                    <TooltipContent>Undo</TooltipContent>
                </Tooltip>

                {/* Redo Button with Tooltip */}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Toggle
                            pressed={false}
                            onPressedChange={() => editor.chain().focus().redo().run()}
                            disabled={!editor.can().redo()}
                            aria-label="Redo"
                        >
                            <Redo2 className="w-4 h-4" />
                        </Toggle>
                    </TooltipTrigger>
                    <TooltipContent>Redo</TooltipContent>
                </Tooltip>
            </div>
        </TooltipProvider>
    );
};

export default UndoRedoOptions;
