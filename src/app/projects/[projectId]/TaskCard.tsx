'use client'

import React, { useState, useEffect, useRef } from 'react';
import MyAvatarGroup from '@/components/MyAvatarGroup';
import { AttachmentType, ColumnType, CommentType, TaskType } from '@/types/task.types';
import { USER_TYPE } from '@/types/user.types';
import USERS from '@/dummyData/users.json';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
    CalendarDays,
    GripVertical,
    Pencil,
    Trash2,
    Paperclip,
    MessageSquare,
    Plus,
    FileText,
    ExternalLink,
    Send,
    X,
    Check,
    Smile,
    AtSign,
    AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { SelectMenu } from '@/components/SelectMenu';
import Assignee from '@/components/Assignee';
import DueDate from '@/components/DueDate';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import PRIORITY from '@/dummyData/priority.json';
import TASK_TYPE from '@/dummyData/task_type.json';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { useAppState } from '@/context/AppContext';

interface Props {
    task: TaskType;
    column?: ColumnType;
    isOverlay?: boolean;
    onUpdateTask?: (updatedTask: TaskType) => void;
    onDeleteTask?: (taskId: string | number) => void;
    activeEditId?: string | number | null;
    setActiveEditId?: (id: string | number | null) => void;
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const EMOJI_LIST = [
    '👍', '👎', '❤️', '🔥', '🎉', '🚀', '💡', '👏', '🙏', '😊',
    '😂', '😍', '😎', '🤔', '🙌', '✨', '💯', '✅', '❌', '🐛',
    '📌', '⭐', '👀', '💪', '🎯', '⚡', '💬', '🥳', '🙈', '🍀'
];

const formatDisplayDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split(' ')[0].split('-');
    if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        if (!isNaN(year) && !isNaN(month) && !isNaN(day) && MONTH_NAMES[month]) {
            return `${day} ${MONTH_NAMES[month]}`;
        }
    }
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return `${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`;
};

const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const renderPriorityBadge = (priority?: string) => {
    if (!priority) return null;
    const pLower = priority.toLowerCase();
    if (pLower === 'high') {
        return (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300 border border-orange-200/80 dark:border-orange-800/50">
                {priority}
            </span>
        );
    }
    if (pLower === 'critical') {
        return (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800/50">
                {priority}
            </span>
        );
    }
    if (pLower === 'medium') {
        return (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/50">
                {priority}
            </span>
        );
    }
    return (
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
            {priority}
        </span>
    );
};

const renderTaskTypeBadge = (type?: string) => {
    if (!type) return null;
    const tLower = type.toLowerCase();
    if (tLower === 'bug fix' || tLower === 'bug') {
        return (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/50">
                {type}
            </span>
        );
    }
    if (tLower === 'feature') {
        return (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/50">
                {type}
            </span>
        );
    }
    if (tLower === 'improvement') {
        return (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/50">
                {type}
            </span>
        );
    }
    return (
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
            {type}
        </span>
    );
};

const renderCommentText = (text: string) => {
    if (!text) return null;
    // Regex to match user mentions (@Name or @UserName)
    const mentionRegex = /(@[A-Za-z0-9_.\s]+?(?=\s|$|[^A-Za-z0-9_.]))/g;
    const parts = text.split(mentionRegex);

    return (
        <span>
            {parts.map((part, i) => {
                if (part.startsWith('@')) {
                    return (
                        <span
                            key={i}
                            className="inline-flex items-center px-1.5 py-0.5 mx-0.5 rounded text-[11px] font-semibold bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/80"
                        >
                            {part}
                        </span>
                    );
                }
                return part;
            })}
        </span>
    );
};

export default function TaskCard({ task, column, isOverlay, onUpdateTask, onDeleteTask, activeEditId, setActiveEditId }: Props) {
    const ctx = useAppState();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const [formData, setFormData] = useState<TaskType>(task);
    const [newCommentText, setNewCommentText] = useState('');
    const [isMentionOpen, setIsMentionOpen] = useState(false);
    const [isEmojiOpen, setIsEmojiOpen] = useState(false);

    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const inlineCardRef = useRef<HTMLDivElement | null>(null);
    const formDataRef = useRef<TaskType>(formData);

    useEffect(() => {
        setFormData(task);
    }, [task]);

    useEffect(() => {
        formDataRef.current = formData;
    }, [formData]);

    const myEditId = `card-${task?.taskId}`;
    const isEditingInline = activeEditId?.toString() === myEditId.toString();

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: task?.taskId,
        data: {
            type: 'Task',
            task,
        },
        disabled: isOverlay || isEditingInline,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const handleOnChange = (name: string, value?: any): void => {
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSaveInline = () => {
        if (!formData.taskTitle?.trim()) return;
        const updated = {
            ...formData,
            updatedBy: ctx?.state?.user || null,
            updatedAt: new Date().toDateString(),
        };
        onUpdateTask?.(updated);
        setActiveEditId?.(null);
    };

    const handleCancelInline = () => {
        setFormData(task);
        setActiveEditId?.(null);
    };

    // Click outside / Blur detection for inline edit mode
    useEffect(() => {
        if (!isEditingInline) return;

        const handlePointerDownOutside = (event: PointerEvent | MouseEvent) => {
            const target = event.target as Node | null;
            if (!target) return;

            if (inlineCardRef.current && inlineCardRef.current.contains(target)) {
                return;
            }

            const isInsidePortal = (target as HTMLElement)?.closest?.(
                '[data-slot="dropdown-content"], [data-slot="popover-content"], [data-slot="dialog"], [role="menu"], [role="dialog"]'
            );
            if (isInsidePortal) {
                return;
            }

            const currentTitle = formDataRef.current?.taskTitle?.trim();
            if (currentTitle) {
                const updated = {
                    ...formDataRef.current,
                    updatedBy: ctx?.state?.user || null,
                    updatedAt: new Date().toDateString(),
                };
                onUpdateTask?.(updated);
            } else {
                setFormData(task);
            }
            setActiveEditId?.(null);
        };

        const timer = setTimeout(() => {
            document.addEventListener('pointerdown', handlePointerDownOutside);
        }, 50);

        return () => {
            clearTimeout(timer);
            document.removeEventListener('pointerdown', handlePointerDownOutside);
        };
    }, [isEditingInline, task, onUpdateTask, setActiveEditId, ctx?.state?.user]);

    const handleSaveDialog = () => {
        if (!formData.taskTitle?.trim()) return;
        const updated = {
            ...formData,
            updatedBy: ctx?.state?.user || null,
            updatedAt: new Date().toDateString(),
        };
        onUpdateTask?.(updated);
        setIsEditMode(false);
    };

    const handleCancelDialog = () => {
        setFormData(task);
        setIsEditMode(false);
    };

    const handleConfirmDelete = () => {
        onDeleteTask?.(task.taskId);
        setIsDeleteDialogOpen(false);
        setIsDialogOpen(false);
    };

    // Attachment Handlers
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const newAttachments: AttachmentType[] = Array.from(files).map((file, idx) => ({
            id: `att-${Date.now()}-${idx}`,
            name: file.name,
            url: URL.createObjectURL(file),
            size: formatBytes(file.size),
            type: file.type.startsWith('image/') ? 'image' : 'file',
            uploadedAt: new Date().toLocaleDateString([], { month: 'short', day: 'numeric' })
        }));

        const updatedAttachments = [...(formData.attachments || []), ...newAttachments];
        const updatedTask = {
            ...formData,
            attachments: updatedAttachments,
            updatedBy: ctx?.state?.user || null,
            updatedAt: new Date().toDateString(),
        };

        setFormData(updatedTask);
        onUpdateTask?.(updatedTask);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleDeleteAttachment = (attId: string) => {
        const updatedAttachments = (formData.attachments || []).filter((a) => a.id !== attId);
        const updatedTask = {
            ...formData,
            attachments: updatedAttachments,
            updatedBy: ctx?.state?.user || null,
            updatedAt: new Date().toDateString(),
        };

        setFormData(updatedTask);
        onUpdateTask?.(updatedTask);
    };

    // Comment Handlers
    const handleAddComment = () => {
        if (!newCommentText.trim()) return;

        const currentUser = ctx?.state?.user || {
            userId: 1,
            userName: 'uttam@k.com',
            fullName: 'Uttam Kumar',
            photoUrl: 'https://github.com/shadcn.png'
        };

        const newComment: CommentType = {
            id: `comm-${Date.now()}`,
            text: newCommentText.trim(),
            user: currentUser,
            createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })
        };

        const updatedComments = [...(formData.comments || []), newComment];
        const updatedTask = {
            ...formData,
            comments: updatedComments,
            updatedBy: currentUser,
            updatedAt: new Date().toDateString(),
        };

        setFormData(updatedTask);
        onUpdateTask?.(updatedTask);
        setNewCommentText('');
    };

    const handleDeleteComment = (commId: string) => {
        const updatedComments = (formData.comments || []).filter((c) => c.id !== commId);
        const updatedTask = {
            ...formData,
            comments: updatedComments,
            updatedBy: ctx?.state?.user || null,
            updatedAt: new Date().toDateString(),
        };

        setFormData(updatedTask);
        onUpdateTask?.(updatedTask);
    };

    const handleInsertMention = (user: USER_TYPE) => {
        setNewCommentText((prev) => {
            if (prev.endsWith('@')) {
                return prev.slice(0, -1) + `@${user.fullName} `;
            }
            return prev + `@${user.fullName} `;
        });
    };

    const handleInsertEmoji = (emoji: string) => {
        setNewCommentText((prev) => prev + emoji);
    };

    // Overlay state during drag
    if (isOverlay) {
        return (
            <div className="bg-white dark:bg-zinc-950 p-3.5 rounded-xl border border-zinc-300 dark:border-zinc-700 shadow-2xl flex flex-col gap-2 cursor-grabbing ring-2 ring-primary/20">
                <div className="flex items-center justify-between gap-2">
                    <div className="text-zinc-500">
                        <GripVertical size={16} />
                    </div>
                    <div className="flex items-center gap-1.5">
                        {renderPriorityBadge(task?.priorityType)}
                        {renderTaskTypeBadge(task?.taskType)}
                    </div>
                </div>
                <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                    {task?.taskTitle}
                </span>
                <div className="flex items-center justify-between pt-1">
                    {task?.dueDate && (
                        <div className="flex items-center gap-1 text-[11px] font-medium text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800/80 px-2 py-0.5 rounded-md border border-zinc-200/60 dark:border-zinc-700/60">
                            <CalendarDays size={12} />
                            <span>{formatDisplayDate(task.dueDate)}</span>
                        </div>
                    )}
                    {task?.assignee && task.assignee.length > 0 && (
                        <MyAvatarGroup users={task.assignee} maxItem={3} className="ml-auto shrink-0" />
                    )}
                </div>
            </div>
        );
    }

    // Dragging placeholder state
    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="opacity-30 bg-zinc-100 dark:bg-zinc-800 p-4 min-h-[80px] rounded-xl border border-dashed border-zinc-400 dark:border-zinc-600"
            />
        );
    }

    // Inline Edit Mode
    if (isEditingInline) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                onClick={(e) => e.stopPropagation()}
                className="p-2 border border-zinc-300 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-950 shadow-md flex flex-col gap-2"
            >
                <div ref={inlineCardRef} className="flex flex-col gap-2">
                    <div className="py-1 flex items-start gap-1">
                        <div
                            {...attributes}
                            {...listeners}
                            className="text-zinc-400 pt-2.5 pl-1 cursor-grab active:cursor-grabbing hover:text-zinc-600"
                        >
                            <GripVertical size={16} />
                        </div>
                        <div className="flex-1">
                            <Textarea
                                placeholder="Task title..."
                                value={formData?.taskTitle}
                                onChange={(e) => handleOnChange('taskTitle', e?.target?.value || '')}
                                className="bg-white dark:bg-zinc-900 min-h-[36px] text-xs font-medium resize-none"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSaveInline();
                                    } else if (e.key === 'Escape') {
                                        handleCancelInline();
                                    }
                                }}
                                autoFocus
                            />
                        </div>
                    </div>
                    <div className="pt-1 flex items-center flex-wrap gap-1">
                        <SelectMenu name="priorityType" onChange={handleOnChange} creatable value={formData?.priorityType || ''} label="Priority" items={PRIORITY} />
                        <SelectMenu name="taskType" onChange={handleOnChange} creatable value={formData?.taskType || ''} label="Task Type" items={TASK_TYPE} />
                        <Assignee name="assignee" values={formData?.assignee || []} creatable onChange={handleOnChange} />
                        <DueDate name="dueDate" value={formData?.dueDate || ''} onChange={handleOnChange} />
                    </div>

                    <div className="flex pt-1 gap-2">
                        <Button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleCancelInline();
                            }}
                            size="sm"
                            variant="outline"
                            className="flex-1 h-8 border-rose-200 hover:border-rose-300 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:border-rose-900/60 dark:hover:bg-rose-950/40 cursor-pointer flex items-center justify-center"
                            title="Cancel"
                        >
                            <X size={18} className="text-rose-600 dark:text-rose-400" />
                        </Button>
                        <Button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleSaveInline();
                            }}
                            size="sm"
                            variant="outline"
                            className="flex-1 h-8 border-emerald-200 hover:border-emerald-300 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:border-emerald-900/60 dark:hover:bg-emerald-950/40 cursor-pointer flex items-center justify-center"
                            title="Save Changes"
                        >
                            <Check size={18} className="text-emerald-600 dark:text-emerald-400" />
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    const attachmentsCount = task?.attachments?.length || 0;
    const commentsCount = task?.comments?.length || 0;

    // Default Card Display Mode
    return (
        <>
            <div
                ref={setNodeRef}
                style={style}
                onClick={() => {
                    setIsEditMode(false);
                    setIsDialogOpen(true);
                }}
                className="group relative bg-white dark:bg-zinc-950 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800/80 shadow-xs hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 transition-all flex flex-col gap-2.5 cursor-pointer"
            >
                {/* Header: Grip, Badges & Action Buttons (Delete & Edit) */}
                <div className="flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1.5">
                        <button
                            type="button"
                            {...attributes}
                            {...listeners}
                            onClick={(e) => e.stopPropagation()}
                            className="cursor-grab active:cursor-grabbing text-zinc-400 hover:text-zinc-600 transition-colors p-0.5 rounded"
                        >
                            <GripVertical size={15} />
                        </button>
                        {renderPriorityBadge(task?.priorityType)}
                        {renderTaskTypeBadge(task?.taskType)}
                    </div>

                    <div className="flex items-center gap-1">
                        {onDeleteTask && (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsDeleteDialogOpen(true);
                                }}
                                className="p-1 rounded-md text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                                title="Delete task"
                            >
                                <Trash2 size={13} />
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                setActiveEditId?.(myEditId);
                            }}
                            className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                            title="Edit task inline"
                        >
                            <Pencil size={13} />
                        </button>
                    </div>
                </div>

                {/* Task Title & Description Preview */}
                <div className="space-y-1">
                    <h4 className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 leading-snug line-clamp-2">
                        {task?.taskTitle}
                    </h4>
                    {task?.taskDescription && (
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2 font-normal">
                            {task.taskDescription}
                        </p>
                    )}
                </div>

                {/* Card Footer: Due Date, Badges & Assignees */}
                <div className="flex items-center justify-between pt-1 border-t border-zinc-100 dark:border-zinc-900 mt-0.5">
                    <div className="flex items-center gap-2">
                        {task?.dueDate && (
                            <div className="flex items-center gap-1 text-[11px] font-medium text-zinc-500 dark:text-zinc-400 bg-zinc-100/80 dark:bg-zinc-800/60 px-2 py-0.5 rounded-md border border-zinc-200/60 dark:border-zinc-700/60">
                                <CalendarDays size={12} className="text-zinc-400" />
                                <span>{formatDisplayDate(task.dueDate)}</span>
                            </div>
                        )}
                        {attachmentsCount > 0 && (
                            <div className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-zinc-600 transition-colors">
                                <Paperclip size={12} />
                                <span>{attachmentsCount}</span>
                            </div>
                        )}
                        {commentsCount > 0 && (
                            <div className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-zinc-600 transition-colors">
                                <MessageSquare size={12} />
                                <span>{commentsCount}</span>
                            </div>
                        )}
                    </div>
                    {task?.assignee && task.assignee.length > 0 && (
                        <MyAvatarGroup users={task.assignee} maxItem={3} className="ml-auto shrink-0" />
                    )}
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="sm:max-w-[420px] p-6 space-y-4">
                    <DialogHeader className="space-y-2">
                        <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                            <AlertTriangle size={20} />
                            <DialogTitle className="text-base font-semibold">Delete Task</DialogTitle>
                        </div>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                            Are you sure you want to delete <strong className="text-zinc-800 dark:text-zinc-200">&quot;{task?.taskTitle}&quot;</strong>? This action cannot be undone.
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
                            onClick={handleConfirmDelete}
                            className="text-xs font-medium bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
                        >
                            Delete Task
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal Dialog (View Mode & Edit Mode) */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[640px] max-h-[85vh] p-0 flex flex-col overflow-hidden">
                    {/* Dialog Header */}
                    <DialogHeader className="p-5 pb-3 border-b border-zinc-100 dark:border-zinc-800 shrink-0 flex flex-row items-center justify-between">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                {column && (
                                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                                        {column.title}
                                    </span>
                                )}
                                <span className="text-xs text-zinc-400">Task #{task.taskId}</span>
                            </div>
                            <DialogTitle className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                                {isEditMode ? 'Edit Task Details' : 'Task Details'}
                            </DialogTitle>
                        </div>

                        {/* Edit Mode Pencil Toggle Button */}
                        <div className="flex items-center gap-2 mr-6">
                            {!isEditMode ? (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsEditMode(true)}
                                    className="h-8 text-xs font-medium gap-1.5 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                                >
                                    <Pencil size={13} className="text-primary" /> Edit Task
                                </Button>
                            ) : (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setFormData(task);
                                        setIsEditMode(false);
                                    }}
                                    className="h-8 text-xs font-medium gap-1 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 cursor-pointer"
                                >
                                    <X size={14} /> Cancel Edit
                                </Button>
                            )}
                        </div>
                    </DialogHeader>

                    {/* Scrollable Body Content */}
                    <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
                        {isEditMode ? (
                            /* EDIT MODE FORM */
                            <>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                                        Task Title
                                    </label>
                                    <Textarea
                                        placeholder="Task title..."
                                        value={formData.taskTitle}
                                        onChange={(e) => handleOnChange('taskTitle', e.target.value)}
                                        className="bg-white dark:bg-zinc-900 text-sm font-semibold min-h-[42px] resize-none"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3 bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-lg border border-zinc-200/80 dark:border-zinc-800">
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Priority</label>
                                        <div>
                                            <SelectMenu name="priorityType" onChange={handleOnChange} creatable value={formData.priorityType || ''} label="Priority" items={PRIORITY} />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Task Type</label>
                                        <div>
                                            <SelectMenu name="taskType" onChange={handleOnChange} creatable value={formData.taskType || ''} label="Task Type" items={TASK_TYPE} />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Assignees</label>
                                        <div>
                                            <Assignee name="assignee" values={formData.assignee || []} creatable onChange={handleOnChange} />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Due Date</label>
                                        <div>
                                            <DueDate name="dueDate" value={formData.dueDate || ''} onChange={handleOnChange} />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                                        Description
                                    </label>
                                    <Textarea
                                        placeholder="Add a detailed task description..."
                                        value={formData.taskDescription || ''}
                                        onChange={(e) => handleOnChange('taskDescription', e.target.value)}
                                        className="bg-white dark:bg-zinc-900 text-xs min-h-[80px]"
                                    />
                                </div>
                            </>
                        ) : (
                            /* VIEW MODE DISPLAY */
                            <>
                                {/* Task Title */}
                                <div>
                                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 leading-snug">
                                        {formData.taskTitle}
                                    </h2>
                                </div>

                                {/* Meta Info Summary Grid */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-zinc-50/80 dark:bg-zinc-900/60 p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800">
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider block">Priority</span>
                                        <div>{renderPriorityBadge(formData.priorityType) || <span className="text-xs text-zinc-400">None</span>}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider block">Task Type</span>
                                        <div>{renderTaskTypeBadge(formData.taskType) || <span className="text-xs text-zinc-400">None</span>}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider block">Due Date</span>
                                        <div className="flex items-center gap-1 text-xs font-medium text-zinc-700 dark:text-zinc-300">
                                            <CalendarDays size={13} className="text-zinc-400" />
                                            <span>{formatDisplayDate(formData.dueDate) || 'No due date'}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider block">Assignees</span>
                                        <div>
                                            {formData.assignee && formData.assignee.length > 0 ? (
                                                <MyAvatarGroup users={formData.assignee} maxItem={4} />
                                            ) : (
                                                <span className="text-xs text-zinc-400">Unassigned</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Description View */}
                                <div className="space-y-1.5">
                                    <h4 className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">Description</h4>
                                    <div className="bg-zinc-50/50 dark:bg-zinc-900/40 p-3 rounded-lg border border-zinc-200/60 dark:border-zinc-800/80 min-h-[60px] text-xs text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed">
                                        {formData.taskDescription ? formData.taskDescription : <span className="text-zinc-400 italic">No description provided.</span>}
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Attachments Section */}
                        <div className="space-y-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                    <Paperclip size={15} className="text-zinc-500" />
                                    <h5 className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                                        Attachments ({(formData.attachments || []).length})
                                    </h5>
                                </div>

                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileUpload}
                                    multiple
                                    className="hidden"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="h-7 text-[11px] font-medium px-2.5 flex items-center gap-1 cursor-pointer"
                                >
                                    <Plus size={13} /> Add Attachment
                                </Button>
                            </div>

                            {/* Attachments Grid List */}
                            {(!formData.attachments || formData.attachments.length === 0) ? (
                                <div className="text-[11px] text-zinc-400 italic bg-zinc-50 dark:bg-zinc-900/40 p-3 rounded-lg border border-dashed border-zinc-200 dark:border-zinc-800 text-center">
                                    No attachments added yet. Click &quot;Add Attachment&quot; to upload files.
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-2">
                                    {formData.attachments.map((att) => (
                                        <div
                                            key={att.id}
                                            className="group relative flex items-center gap-2.5 p-2 bg-zinc-50 dark:bg-zinc-900/60 rounded-lg border border-zinc-200/80 dark:border-zinc-800 hover:border-zinc-300 transition-all overflow-hidden"
                                        >
                                            {att.type === 'image' ? (
                                                <div className="w-10 h-10 shrink-0 rounded bg-zinc-200 dark:bg-zinc-800 overflow-hidden relative">
                                                    {/* eslint-disable-next-html-element-suppression */}
                                                    <img
                                                        src={att.url}
                                                        alt={att.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="w-10 h-10 shrink-0 rounded bg-zinc-200/80 dark:bg-zinc-800 flex items-center justify-center text-zinc-500">
                                                    <FileText size={18} />
                                                </div>
                                            )}

                                            <div className="flex-1 min-w-0 pr-6">
                                                <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate" title={att.name}>
                                                    {att.name}
                                                </p>
                                                <div className="flex items-center gap-2 text-[10px] text-zinc-400 mt-0.5">
                                                    {att.size && <span>{att.size}</span>}
                                                    {att.uploadedAt && <span>{att.uploadedAt}</span>}
                                                </div>
                                            </div>

                                            <div className="absolute right-1.5 top-1.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-50/90 dark:bg-zinc-900/90 p-0.5 rounded">
                                                <a
                                                    href={att.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded"
                                                    title="Open file"
                                                >
                                                    <ExternalLink size={12} />
                                                </a>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteAttachment(att.id)}
                                                    className="p-1 text-rose-400 hover:text-rose-600 rounded cursor-pointer"
                                                    title="Delete attachment"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Comments Section with Mention & Emoji */}
                        <div className="space-y-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                    <MessageSquare size={15} className="text-zinc-500" />
                                    <h5 className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                                        Comments ({(formData.comments || []).length})
                                    </h5>
                                </div>
                            </div>

                            {/* Existing Comments List */}
                            <div className="space-y-3">
                                {(!formData.comments || formData.comments.length === 0) ? (
                                    <div className="text-[11px] text-zinc-400 italic bg-zinc-50 dark:bg-zinc-900/40 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800 text-center">
                                        No comments yet. Write a comment below!
                                    </div>
                                ) : (
                                    formData.comments.map((comm) => (
                                        <div key={comm.id} className="flex gap-2.5 group">
                                            <Avatar size="sm" className="mt-0.5 shrink-0">
                                                <AvatarImage src={comm.user?.photoUrl || ''} alt={comm.user?.fullName?.[0]} />
                                                <AvatarFallback>{comm.user?.fullName?.[0] || 'U'}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-0.5">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                                                            {comm.user?.fullName || 'User'}
                                                        </span>
                                                        <span className="text-[10px] text-zinc-400">
                                                            {comm.createdAt}
                                                        </span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteComment(comm.id)}
                                                        className="text-zinc-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer p-0.5"
                                                        title="Delete comment"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </div>
                                                <div className="text-xs text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-900/80 p-2.5 rounded-lg border border-zinc-100 dark:border-zinc-800 leading-relaxed font-normal break-words">
                                                    {renderCommentText(comm.text)}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* New Comment Input Box with Mention & Emoji Controls */}
                            <div className="flex gap-2.5 pt-2 items-start">
                                <Avatar size="sm" className="mt-1 shrink-0">
                                    <AvatarImage src={ctx?.state?.user?.photoUrl || 'https://github.com/shadcn.png'} />
                                    <AvatarFallback>{ctx?.state?.user?.fullName?.[0] || 'U'}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 space-y-2">
                                    <Textarea
                                        placeholder="Write a comment... (Type @ to mention someone)"
                                        value={newCommentText}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setNewCommentText(val);
                                            if (val.endsWith('@')) {
                                                setIsMentionOpen(true);
                                            }
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleAddComment();
                                            }
                                        }}
                                        className="bg-white dark:bg-zinc-900 text-xs min-h-[56px] resize-none"
                                    />

                                    {/* Action Bar for Comment (Mention Popover, Emoji Popover & Send) */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1.5">
                                            {/* Mention Popover */}
                                            <Popover open={isMentionOpen} onOpenChange={setIsMentionOpen}>
                                                <PopoverTrigger
                                                    render={
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-7 px-2 text-[11px] text-zinc-500 hover:text-primary gap-1 border-zinc-200 dark:border-zinc-800 cursor-pointer"
                                                            title="Mention team member"
                                                        >
                                                            <AtSign size={13} /> Mention
                                                        </Button>
                                                    }
                                                />
                                                <PopoverContent className="w-56 p-1.5 shadow-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-xl">
                                                    <div className="px-2 py-1 text-[11px] font-semibold text-zinc-400 border-b border-zinc-100 dark:border-zinc-800 mb-1">
                                                        Mention Team Member
                                                    </div>
                                                    <div className="max-h-48 overflow-y-auto space-y-0.5 custom-scrollbar">
                                                        {USERS.map((user) => (
                                                            <button
                                                                key={user.userId}
                                                                type="button"
                                                                onClick={() => {
                                                                    handleInsertMention(user);
                                                                    setIsMentionOpen(false);
                                                                }}
                                                                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 text-left transition-colors cursor-pointer"
                                                            >
                                                                <Avatar size="sm" className="w-5 h-5">
                                                                    <AvatarImage src={user.photoUrl} alt={user.fullName} />
                                                                    <AvatarFallback className="text-[10px]">{user.fullName[0]}</AvatarFallback>
                                                                </Avatar>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-xs font-medium text-zinc-800 dark:text-zinc-200 truncate">{user.fullName}</p>
                                                                </div>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </PopoverContent>
                                            </Popover>

                                            {/* Emoji Popover */}
                                            <Popover open={isEmojiOpen} onOpenChange={setIsEmojiOpen}>
                                                <PopoverTrigger
                                                    render={
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-7 px-2 text-[11px] text-zinc-500 hover:text-amber-500 gap-1 border-zinc-200 dark:border-zinc-800 cursor-pointer"
                                                            title="Add emoji"
                                                        >
                                                            <Smile size={13} /> Emoji
                                                        </Button>
                                                    }
                                                />
                                                <PopoverContent className="w-64 p-2 shadow-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-xl">
                                                    <div className="px-1 py-0.5 text-[11px] font-semibold text-zinc-400 border-b border-zinc-100 dark:border-zinc-800 mb-2">
                                                        Pick an Emoji
                                                    </div>
                                                    <div className="grid grid-cols-6 gap-1 max-h-44 overflow-y-auto custom-scrollbar">
                                                        {EMOJI_LIST.map((emoji, idx) => (
                                                            <button
                                                                key={idx}
                                                                type="button"
                                                                onClick={() => {
                                                                    handleInsertEmoji(emoji);
                                                                    setIsEmojiOpen(false);
                                                                }}
                                                                className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded text-base flex items-center justify-center transition-transform hover:scale-125 cursor-pointer"
                                                            >
                                                                {emoji}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </PopoverContent>
                                            </Popover>
                                        </div>

                                        <Button
                                            type="button"
                                            size="sm"
                                            onClick={handleAddComment}
                                            disabled={!newCommentText.trim()}
                                            className="h-7 text-xs font-medium px-3 flex items-center gap-1.5 cursor-pointer"
                                        >
                                            <Send size={12} /> Comment
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Metadata Footer info */}
                        {(task.createdAt || task.createdBy) && (
                            <div className="text-[11px] text-zinc-400 flex items-center gap-4 pt-1 border-t border-zinc-100 dark:border-zinc-800">
                                {task.createdBy?.fullName && (
                                    <span>Created by <strong className="text-zinc-600 dark:text-zinc-300">{task.createdBy.fullName}</strong></span>
                                )}
                                {task.createdAt && <span>Created {task.createdAt}</span>}
                            </div>
                        )}
                    </div>

                    {/* Dialog Footer Actions */}
                    <DialogFooter className="p-4 bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between shrink-0">
                        {onDeleteTask ? (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsDeleteDialogOpen(true)}
                                className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-medium cursor-pointer"
                            >
                                <Trash2 size={14} className="mr-1" /> Delete
                            </Button>
                        ) : <div />}
                        <div className="flex items-center gap-2">
                            {isEditMode ? (
                                <>
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        size="sm"
                                        onClick={handleCancelDialog}
                                        className="text-xs font-medium cursor-pointer"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="button"
                                        size="sm"
                                        onClick={handleSaveDialog}
                                        className="text-xs font-medium cursor-pointer"
                                    >
                                        Save Changes
                                    </Button>
                                </>
                            ) : (
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => setIsDialogOpen(false)}
                                    className="text-xs font-medium cursor-pointer"
                                >
                                    Close
                                </Button>
                            )}
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
