import React from 'react';
import { Editor } from '@tiptap/react';
import HeadingSelector from './HeadingSelector';
import ImageUploadDialog from './ImageUploadDialog';
import TextHighlighter from './TextHighlighter';
import LinkOptions from './LinkOptions';
import HorizontalRuleOption from './HorizontalRuleOption';
import UndoRedoOptions from './UndoRedoOptions';
import TableOptions from './TableOptions';
import DetailsOptions from './DetailsOptions';
import YoutubeOptions from './YoutubeOptions';
import TextFormatingOption from './TextFormatingOption';

interface ToolbarProps {
    editor: Editor;
}

const Toolbar = ({ editor }: ToolbarProps) => {
    return (
        <div className="bg-background  rounded-xl border p-1 sticky top-0">
            <div className="flex gap-2 items-center flex-wrap">
                <UndoRedoOptions editor={editor} />
                <HeadingSelector editor={editor} />
                <TextFormatingOption editor={editor} />
                <HorizontalRuleOption editor={editor} />
                <ImageUploadDialog editor={editor} />
                <TextHighlighter editor={editor} />
                <LinkOptions editor={editor} />
                <TableOptions editor={editor} />
                <DetailsOptions editor={editor} />
                <YoutubeOptions editor={editor} />
            </div>
        </div>
    );
};

export default Toolbar;
