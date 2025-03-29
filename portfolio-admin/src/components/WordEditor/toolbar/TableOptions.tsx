import React from 'react';
import { Editor } from '@tiptap/react';
import {
    Table,
    MinusSquare,
    Trash2,
    ArrowRight,
    ArrowLeft,
    Wrench,
    Table2,
    SplitSquareHorizontal,
    TableCellsMerge,
    BetweenVerticalStart,
    BetweenVerticalEnd,
    BetweenHorizonalStart,
    BetweenHorizontalEnd,
} from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';

interface TableOptionsProps {
    editor: Editor;
}

const TableOptions = ({ editor }: TableOptionsProps) => {
    const actions = [
        {
            label: 'Insert Table',
            icon: Table,
            action: () =>
                editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
        },
        {
            label: 'Add Column Before',
            icon: BetweenVerticalStart,
            action: () => editor.chain().focus().addColumnBefore().run(),
        },
        {
            label: 'Add Column After',
            icon: BetweenVerticalEnd,
            action: () => editor.chain().focus().addColumnAfter().run(),
        },
        {
            label: 'Delete Column',
            icon: MinusSquare,
            action: () => editor.chain().focus().deleteColumn().run(),
        },
        {
            label: 'Add Row Before',
            icon: BetweenHorizonalStart,
            action: () => editor.chain().focus().addRowBefore().run(),
        },
        {
            label: 'Add Row After',
            icon: BetweenHorizontalEnd,
            action: () => editor.chain().focus().addRowAfter().run(),
        },
        {
            label: 'Delete Row',
            icon: MinusSquare,
            action: () => editor.chain().focus().deleteRow().run(),
        },
        {
            label: 'Merge Cells',
            icon: TableCellsMerge,
            action: () => editor.chain().focus().mergeCells().run(),
        },
        {
            label: 'Split Cells',
            icon: SplitSquareHorizontal,
            action: () => editor.chain().focus().splitCell().run(),
        },
        {
            label: 'Toggle Header Column',
            icon: Table2,
            action: () => editor.chain().focus().toggleHeaderColumn().run(),
        },
        {
            label: 'Toggle Header Row',
            icon: Table2,
            action: () => editor.chain().focus().toggleHeaderRow().run(),
        },
        {
            label: 'Set Cell Attribute',
            icon: Wrench,
            action: () => editor.chain().focus().setCellAttribute('colspan', 2).run(),
        },
        {
            label: 'Fix Tables',
            icon: Wrench,
            action: () => editor.chain().focus().fixTables().run(),
        },
        {
            label: 'Go to Next Cell',
            icon: ArrowRight,
            action: () => editor.chain().focus().goToNextCell().run(),
        },
        {
            label: 'Go to Previous Cell',
            icon: ArrowLeft,
            action: () => editor.chain().focus().goToPreviousCell().run(),
        },
        {
            label: 'Delete Table',
            icon: Trash2,
            action: () => editor.chain().focus().deleteTable().run(),
        },
    ];

    return (
        <TooltipProvider>
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" className="flex gap-2">
                        <Table className="w-5 h-5" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-4">
                    <div className="grid grid-cols-4 gap-2">
                        {actions.map(({ label, icon: Icon, action }, index) => (
                            <Tooltip key={index}>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" onClick={action}>
                                        <Icon className="w-5 h-5" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>{label}</TooltipContent>
                            </Tooltip>
                        ))}
                    </div>
                </PopoverContent>
            </Popover>
        </TooltipProvider>
    );
};

export default TableOptions;
