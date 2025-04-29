'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Typography from '@tiptap/extension-typography';
import Image from '@tiptap/extension-image';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Details from '@tiptap-pro/extension-details';
import DetailsContent from '@tiptap-pro/extension-details-content';
import DetailsSummary from '@tiptap-pro/extension-details-summary';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { all, createLowlight } from 'lowlight';
import Youtube from '@tiptap/extension-youtube';
import { Skeleton } from '@/components/ui/skeleton';
import Toolbar from './toolbar/Toolbar';
import { useEffect, useMemo } from 'react';
import { debounce } from 'lodash';

// Create a lowlight instance with all languages loaded
const lowlight = createLowlight(all);

type WordEditorProps = {
    onContentChange: (content: string) => void;
    initialContent?: string;
    editable?: boolean;
};

const WordEditor = ({ onContentChange, initialContent, editable = true }: WordEditorProps) => {
    const debouncedOnChange = useMemo(() => {
        return debounce((html: string) => {
            onContentChange(html);
        }, 300);
    }, [onContentChange]); // Dependency array

    const extensions = useMemo(
        () => [
            StarterKit.configure({
                codeBlock: false,
            }),
            Underline,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
                alignments: ['left', 'center', 'right', 'justify'],
            }),
            CodeBlockLowlight.configure({
                lowlight,
            }),
            Table.configure({
                resizable: true,
                HTMLAttributes: {
                    class: 'table-fixed',
                },
            }),
            Youtube.configure({
                inline: false,
                width: 1000,
                height: 480,
                controls: true,
                modestBranding: true,
                allowFullscreen: true,
                HTMLAttributes: {
                    class: 'youtube-embed',
                },
            }),
            TableRow,
            TableHeader,
            TableCell,
            Typography,
            Image.configure({
                HTMLAttributes: {
                    class: 'editor-image',
                },
            }),
            Subscript,
            Superscript,
            Highlight.configure({
                multicolor: true,
                HTMLAttributes: {
                    class: 'editor-highlight',
                },
            }),
            Details.configure({
                persist: true,
                HTMLAttributes: {
                    class: 'details',
                },
            }),
            DetailsSummary,
            DetailsContent,
            Link.configure({
                openOnClick: false,
                autolink: true,
                defaultProtocol: 'https',
                protocols: ['http', 'https'],
                HTMLAttributes: {
                    class: 'editor-link',
                    rel: 'noopener noreferrer',
                    target: '_blank',
                },
                isAllowedUri: (url, ctx) => {
                    try {
                        const parsedUrl = url.includes(':')
                            ? new URL(url)
                            : new URL(`${ctx.defaultProtocol}://${url}`);

                        const disallowedProtocols = ['ftp', 'file', 'mailto'];
                        const protocol = parsedUrl.protocol.replace(':', '');

                        if (disallowedProtocols.includes(protocol)) {
                            return false;
                        }

                        return true;
                    } catch {
                        return false;
                    }
                },
                shouldAutoLink: url => {
                    try {
                        const parsedUrl = url.includes(':')
                            ? new URL(url)
                            : new URL(`https://${url}`);

                        const disallowedDomains = [
                            'example-no-autolink.com',
                            'another-no-autolink.com',
                        ];
                        const domain = parsedUrl.hostname;

                        return !disallowedDomains.includes(domain);
                    } catch {
                        return false;
                    }
                },
            }),
        ],
        []
    );

    const editor = useEditor({
        editable,
        editorProps: {
            attributes: {
                class: 'bg-background min-h-[82vh] border rounded-lg p-2 outline-none focus:ring-2 focus:ring-accent/20 whitespace-pre-line',
            },
        },
        extensions,
        immediatelyRender: false,
        content: initialContent || '<p>Start writing here...</p>',
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            debouncedOnChange(html);
        },
    });

    useEffect(() => {
        if (editor && initialContent !== undefined) {
            // Only update if content is actually different
            const currentContent = editor.getHTML();
            if (currentContent !== initialContent) {
                editor.commands.setContent(initialContent);
            }
        }
    }, [editor, initialContent]);

    useEffect(() => {
        return () => {
            debouncedOnChange.cancel();
            if (editor) {
                editor.destroy();
            }
        };
    }, [editor, debouncedOnChange]);

    if (!editor) {
        return (
            <div className="w-full mx-auto mt-5">
                <Skeleton className="h-[90vh] rounded-xl border">
                    <Skeleton className="h-12 m-2 border" />
                    <Skeleton className="h-[90%] m-2 border" />
                </Skeleton>
            </div>
        );
    }

    return (
        <div className="mdx-prose  bg-card border rounded-2xl w-full mx-auto mt-5 shadow-md overflow-hidden relative">
            <div>
                {editable && (
                    <div className=" sticky top-0 bg-card p-2 border-b z-10">
                        <Toolbar editor={editor} />
                    </div>
                )}
                <div className="p-2">
                    <EditorContent editor={editor} />
                </div>
            </div>
        </div>
    );
};

export default WordEditor;
