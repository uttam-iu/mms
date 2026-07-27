'use client'

import React, { useState } from 'react'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import TaskCard from './TaskCard';
import { ColumnType, TaskType } from '@/types/task.types'
import NewTask from './NewTask'
import { GripHorizontal, Pencil, Trash2, Check, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';

interface Props {
    column: ColumnType;
    tasks: TaskType[];
    onCreateTask: (newTask: TaskType) => void;
    onUpdateTask?: (updatedTask: TaskType) => void;
    onDeleteTask?: (taskId: string | number) => void;
    onUpdateColumn?: (columnId: string | number, newTitle: string) => void;
    onDeleteColumn?: (columnId: string | number) => void;
    isOverlay?: boolean;
    activeEditId?: string | number | null;
    setActiveEditId?: (id: string | number | null) => void;
}

export default function BoardColumn({
    column,
    tasks,
    onCreateTask,
    onUpdateTask,
    onDeleteTask,
    onUpdateColumn,
    onDeleteColumn,
    isOverlay,
    activeEditId,
    setActiveEditId,
}: Props) {
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [titleInput, setTitleInput] = useState(column.title);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const taskIds = tasks.map((t) => t?.taskId)

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: column.id,
        data: {
            type: 'Column',
            column,
        },
        disabled: isOverlay || isEditingTitle,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const handleSaveTitle = () => {
        const trimmed = titleInput.trim();
        if (trimmed && trimmed !== column.title) {
            onUpdateColumn?.(column.id, trimmed);
        } else {
            setTitleInput(column.title);
        }
        setIsEditingTitle(false);
    };

    const handleCancelTitle = () => {
        setTitleInput(column.title);
        setIsEditingTitle(false);
    };

    const handleConfirmDeleteColumn = () => {
        onDeleteColumn?.(column.id);
        setIsDeleteDialogOpen(false);
    };

    if (isOverlay) {
        return (
            <div
                className="w-[300px] min-w-[300px] bg-white dark:bg-zinc-900 border border-zinc-300 shadow-2xl rounded-xl flex flex-col p-4 opacity-95 ring-1 ring-zinc-400/30"
            >
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center gap-2">
                        <div className="text-zinc-500 cursor-grabbing">
                            <GripHorizontal size={18} />
                        </div>
                        <h3 className="font-semibold text-zinc-800 dark:text-zinc-200 text-sm tracking-tight">
                            {column?.title}
                        </h3>
                    </div>
                    <span className="text-xs bg-zinc-200/60 dark:bg-zinc-800 px-2 py-0.5 rounded-full font-medium text-zinc-600 dark:text-zinc-400">
                        {tasks?.length}
                    </span>
                </div>
                <div className="flex-1 space-y-2 pr-1 min-h-[100px]">
                    {tasks?.map((task) => (
                        <TaskCard key={task?.taskId} task={task} column={column} isOverlay />
                    ))}
                </div>
            </div>
        );
    }

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="w-[300px] min-w-[300px] min-h-[500px] opacity-40 bg-zinc-50 dark:bg-zinc-900 border-2 border-dashed border-zinc-300 rounded-xl"
            />
        );
    }

    return (
        <>
            <div
                ref={setNodeRef}
                style={{ ...style, maxHeight: `calc(-110px + 100vh)` }}
                className="w-[300px] min-w-[300px] bg-zinc-50/50 dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800 rounded-xl flex flex-col p-4"
            >
                {/* Column Header */}
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center gap-2 flex-1 min-w-0 mr-2">
                        <button
                            {...attributes}
                            {...listeners}
                            className="cursor-grab active:cursor-grabbing text-zinc-400 hover:text-zinc-600 shrink-0"
                            title="Drag section"
                        >
                            <GripHorizontal size={18} />
                        </button>

                        {isEditingTitle ? (
                            <div className="flex items-center gap-1 flex-1">
                                <Input
                                    value={titleInput}
                                    onChange={(e) => setTitleInput(e.target.value)}
                                    className="h-7 text-xs font-semibold px-2 py-0 bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleSaveTitle();
                                        if (e.key === 'Escape') handleCancelTitle();
                                    }}
                                    onBlur={handleSaveTitle}
                                    autoFocus
                                />
                                <button
                                    type="button"
                                    onClick={handleSaveTitle}
                                    className="text-emerald-600 hover:text-emerald-700 p-1 cursor-pointer"
                                    title="Save"
                                >
                                    <Check size={14} />
                                </button>
                            </div>
                        ) : (
                            <div className="group flex items-center gap-1.5 flex-1 min-w-0">
                                <h3
                                    onClick={() => {
                                        setTitleInput(column.title);
                                        setIsEditingTitle(true);
                                    }}
                                    className="font-semibold text-zinc-800 dark:text-zinc-200 text-sm tracking-tight truncate cursor-pointer hover:text-primary transition-colors"
                                    title="Click to edit section title"
                                >
                                    {column?.title}
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setTitleInput(column.title);
                                        setIsEditingTitle(true);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-0.5 rounded transition-opacity cursor-pointer"
                                    title="Edit section title"
                                >
                                    <Pencil size={12} />
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-xs bg-zinc-200/60 dark:bg-zinc-800 px-2 py-0.5 rounded-full font-medium text-zinc-600 dark:text-zinc-400">
                            {tasks?.length}
                        </span>
                        {onDeleteColumn && (
                            <button
                                type="button"
                                onClick={() => setIsDeleteDialogOpen(true)}
                                className="text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 p-1 rounded transition-colors cursor-pointer"
                                title="Delete section"
                            >
                                <Trash2 size={14} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Task List Context */}
                <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar min-h-[100px]">
                    <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
                        {tasks?.map((task) => (
                            <TaskCard
                                key={task?.taskId}
                                task={task}
                                column={column}
                                onUpdateTask={onUpdateTask}
                                onDeleteTask={onDeleteTask}
                                activeEditId={activeEditId}
                                setActiveEditId={setActiveEditId}
                            />
                        ))}
                    </SortableContext>
                </div>

                <div className={tasks?.length > 0 ? 'pt-2' : ''}>
                    <NewTask
                        column={column}
                        onCreateTask={onCreateTask}
                        activeEditId={activeEditId}
                        setActiveEditId={setActiveEditId}
                    />
                </div>
            </div>

            {/* Delete Column Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="sm:max-w-[420px] p-6 space-y-4">
                    <DialogHeader className="space-y-2">
                        <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                            <AlertTriangle size={20} />
                            <DialogTitle className="text-base font-semibold">Delete Section</DialogTitle>
                        </div>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                            Are you sure you want to delete <strong className="text-zinc-800 dark:text-zinc-200">&quot;{column?.title}&quot;</strong>? All ({tasks?.length || 0}) tasks in this section will also be removed.
                        </p>
                    </DialogHeader>
                    <DialogFooter className="flex items-center justify-end gap-2 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setIsDeleteDialogOpen(false)}
                            className="text-xs font-medium cursor-pointer"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={handleConfirmDeleteColumn}
                            className="text-xs font-medium bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
                        >
                            Delete Section
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
