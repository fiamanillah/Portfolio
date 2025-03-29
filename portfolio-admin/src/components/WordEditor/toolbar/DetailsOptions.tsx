import React, { useEffect, useState } from 'react';
import { Editor } from '@tiptap/react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Toggle } from '@/components/ui/toggle';
import { ListCollapse, XCircle } from 'lucide-react';

interface DetailsOptionsProps {
    editor: Editor;
}

const DetailsOptions = ({ editor }: DetailsOptionsProps) => {
    const [isActive, setIsActive] = useState(editor.isActive('details'));

    useEffect(() => {
        const updateState = () => setIsActive(editor.isActive('details'));
        editor.on('transaction', updateState);
        return () => {
            editor.off('transaction', updateState);
        };
    }, [editor]);

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <div
                    role="button"
                    tabIndex={0}
                    onClick={() =>
                        isActive
                            ? editor.chain().focus().unsetDetails().run()
                            : editor.chain().focus().setDetails().run()
                    }
                    onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            if (isActive) {
                                editor.chain().focus().unsetDetails().run();
                            } else {
                                editor.chain().focus().setDetails().run();
                            }
                        }
                    }}
                    aria-label={isActive ? 'Remove Details' : 'Add Details'}
                >
                    <Toggle pressed={isActive}>
                        {isActive ? (
                            <XCircle className="w-4 h-4" />
                        ) : (
                            <ListCollapse className="w-4 h-4" />
                        )}
                    </Toggle>
                </div>
            </TooltipTrigger>
            <TooltipContent>
                {isActive ? 'Remove Details Section' : 'Add Details Section'}
            </TooltipContent>
        </Tooltip>
    );
};

export default DetailsOptions;
