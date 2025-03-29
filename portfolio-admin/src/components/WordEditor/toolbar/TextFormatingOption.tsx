import React from 'react';
import { Editor } from '@tiptap/react';
import {
    BoldIcon,
    ItalicIcon,
    UnderlineIcon,
    StrikethroughIcon,
    QuoteIcon,
    SubscriptIcon,
    SuperscriptIcon,
    ListIcon,
    ListOrderedIcon,
    Code2Icon,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
} from 'lucide-react';
import { ToggleGroup } from '@/components/ui/toggle-group';
import { Toggle } from '@/components/ui/toggle';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface EditorToolbarProps {
    editor: Editor;
}

const toolbarOptions = [
    {
        label: 'Bold',
        icon: BoldIcon,
        action: (editor: Editor) => editor.chain().focus().toggleBold().run(),
        type: 'formatting',
        isActive: (editor: Editor) => editor.isActive('bold'),
    },
    {
        label: 'Italic',
        icon: ItalicIcon,
        action: (editor: Editor) => editor.chain().focus().toggleItalic().run(),
        type: 'formatting',
        isActive: (editor: Editor) => editor.isActive('italic'),
    },
    {
        label: 'Underline',
        icon: UnderlineIcon,
        action: (editor: Editor) => editor.chain().focus().toggleUnderline().run(),
        type: 'formatting',
        isActive: (editor: Editor) => editor.isActive('underline'),
    },
    {
        label: 'Strikethrough',
        icon: StrikethroughIcon,
        action: (editor: Editor) => editor.chain().focus().toggleStrike().run(),
        type: 'formatting',
        isActive: (editor: Editor) => editor.isActive('strike'),
    },
    {
        label: 'Blockquote',
        icon: QuoteIcon,
        action: (editor: Editor) => editor.chain().focus().toggleBlockquote().run(),
        type: 'formatting',
        isActive: (editor: Editor) => editor.isActive('blockquote'),
    },
    {
        label: 'Subscript',
        icon: SubscriptIcon,
        action: (editor: Editor) => editor.chain().focus().toggleSubscript().run(),
        type: 'formatting',
        isActive: (editor: Editor) => editor.isActive('subscript'),
    },
    {
        label: 'Superscript',
        icon: SuperscriptIcon,
        action: (editor: Editor) => editor.chain().focus().toggleSuperscript().run(),
        type: 'formatting',
        isActive: (editor: Editor) => editor.isActive('superscript'),
    },
    {
        label: 'Bullet List',
        icon: ListIcon,
        action: (editor: Editor) => editor.chain().focus().toggleBulletList().run(),
        type: 'list',
        isActive: (editor: Editor) => editor.isActive('bulletList'),
    },
    {
        label: 'Ordered List',
        icon: ListOrderedIcon,
        action: (editor: Editor) => editor.chain().focus().toggleOrderedList().run(),
        type: 'list',
        isActive: (editor: Editor) => editor.isActive('orderedList'),
    },
    {
        label: 'Code',
        icon: Code2Icon,
        action: (editor: Editor) => editor.chain().focus().toggleCode().run(),
        type: 'list',
        isActive: (editor: Editor) => editor.isActive('code'),
    },
    {
        label: 'Code Block',
        icon: Code2Icon,
        action: (editor: Editor) => editor.chain().focus().toggleCodeBlock().run(),
        type: 'list',
        isActive: (editor: Editor) => editor.isActive('codeBlock'),
    },
    {
        label: 'Left Align',
        icon: AlignLeft,
        action: (editor: Editor) => editor.chain().focus().setTextAlign('left').run(),
        type: 'align',
        isActive: (editor: Editor) => editor.isActive({ textAlign: 'left' }),
    },
    {
        label: 'Center Align',
        icon: AlignCenter,
        action: (editor: Editor) => editor.chain().focus().setTextAlign('center').run(),
        type: 'align',
        isActive: (editor: Editor) => editor.isActive({ textAlign: 'center' }),
    },
    {
        label: 'Right Align',
        icon: AlignRight,
        action: (editor: Editor) => editor.chain().focus().setTextAlign('right').run(),
        type: 'align',
        isActive: (editor: Editor) => editor.isActive({ textAlign: 'right' }),
    },
    {
        label: 'Justify Align',
        icon: AlignJustify,
        action: (editor: Editor) => editor.chain().focus().setTextAlign('justify').run(),
        type: 'align',
        isActive: (editor: Editor) => editor.isActive({ textAlign: 'justify' }),
    },
];

const TextFormatingOption = ({ editor }: EditorToolbarProps) => {
    return (
        <TooltipProvider>
            <div className="flex">
                <ToggleGroup type="multiple" className="flex flex-wrap">
                    {toolbarOptions.map(({ label, icon: Icon, action, isActive }) => (
                        <Tooltip key={label}>
                            <TooltipTrigger asChild>
                                <div
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => action(editor)}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            action(editor);
                                        }
                                    }}
                                >
                                    <Toggle pressed={isActive(editor)}>
                                        <Icon size={16} />
                                    </Toggle>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>{label}</TooltipContent>
                        </Tooltip>
                    ))}
                </ToggleGroup>
            </div>
        </TooltipProvider>
    );
};

export default TextFormatingOption;
