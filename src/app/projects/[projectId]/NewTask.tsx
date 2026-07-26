'use client';

import { Button } from '@/components/ui/button';
import { ColumnType, TaskType } from '@/types/task.types';
import { Plus, Check, X } from 'lucide-react';
import React, { FC, useState, useEffect, useRef } from 'react';
import { useAppState } from '@/context/AppContext';
import { SelectMenu } from '@/components/SelectMenu';
import PRIORITY from '@/dummyData/priority.json';
import TASK_TYPE from '@/dummyData/task_type.json';
import { Textarea } from '@/components/ui/textarea';
import Assignee from '@/components/Assignee';
import DueDate from '@/components/DueDate';

interface NewTaskProps {
    onCreateTask: (task: TaskType) => void;
    column: ColumnType;
    task?: TaskType;
    activeEditId?: string | number | null;
    setActiveEditId?: (id: string | number | null) => void;
}

const getInitialValue = (column: ColumnType, task?: TaskType) => {
    return {
        taskId: task?.taskId || '',
        taskTitle: task?.taskTitle || '',
        taskDescription: task?.taskDescription || '',
        priorityType: task?.priorityType || '',
        taskType: task?.taskType || '',
        taskStatus: task?.taskStatus || 'Pending',
        columnId: column?.id || '',
        createdAt: task?.createdAt || "",
        createdBy: task?.createdBy || null,
        updatedAt: task?.updatedAt || "",
        updatedBy: task?.updatedBy || null,
        assignee: task?.assignee || [],
        dueDate: task?.dueDate || ''
    };
};

const NewTask: FC<NewTaskProps> = ({ onCreateTask, column, task, activeEditId, setActiveEditId }) => {
    const ctx = useAppState();

    const [formData, setFormData] = useState<TaskType>(getInitialValue(column, task));
    const cardRef = useRef<HTMLDivElement | null>(null);
    const formDataRef = useRef<TaskType>(formData);

    useEffect(() => {
        formDataRef.current = formData;
    }, [formData]);

    const myEditId = `newtask-${column?.id}`;
    const isOpen = activeEditId?.toString() === myEditId.toString();

    const handleOnChange = (_name: string, _value?: string | number[]): void => {
        setFormData(prevState => ({
            ...prevState,
            [_name]: _value,
        }));
    };

    const handleAddTask = (): void => {
        const fData = { ...formDataRef.current };
        if (fData?.taskTitle?.trim()) {
            onCreateTask({
                ...fData,
                taskId: task?.taskId || `task-${Date.now()}`,
                createdBy: task?.createdBy || ctx?.state?.user || null,
                createdAt: task?.createdAt || new Date().toDateString(),
                updatedBy: task?.updatedBy || ctx?.state?.user || null,
                updatedAt: new Date().toDateString(),
            });
        }
        setFormData(getInitialValue(column));
        setActiveEditId?.(null);
    };

    const handleCancel = (): void => {
        setFormData(getInitialValue(column));
        setActiveEditId?.(null);
    };

    // Click outside / Blur detection for NewTask card
    useEffect(() => {
        if (!isOpen) return;

        const handlePointerDownOutside = (event: PointerEvent | MouseEvent) => {
            const target = event.target as Node | null;
            if (!target) return;

            // Inside NewTask card -> do nothing
            if (cardRef.current && cardRef.current.contains(target)) {
                return;
            }

            // Inside dropdown, popover, or dialog portal -> do nothing
            const isInsidePortal = (target as HTMLElement)?.closest?.(
                '[data-slot="dropdown-content"], [data-slot="popover-content"], [data-slot="dialog"], [role="menu"], [role="dialog"]'
            );
            if (isInsidePortal) {
                return;
            }

            // Outside click: create if title is filled, otherwise close!
            const currentTitle = formDataRef.current?.taskTitle?.trim();
            if (currentTitle) {
                const fData = { ...formDataRef.current };
                onCreateTask({
                    ...fData,
                    taskId: task?.taskId || `task-${Date.now()}`,
                    createdBy: task?.createdBy || ctx?.state?.user || null,
                    createdAt: task?.createdAt || new Date().toDateString(),
                    updatedBy: task?.updatedBy || ctx?.state?.user || null,
                    updatedAt: new Date().toDateString(),
                });
            }
            setFormData(getInitialValue(column));
            setActiveEditId?.(null);
        };

        const timer = setTimeout(() => {
            document.addEventListener('pointerdown', handlePointerDownOutside);
        }, 50);

        return () => {
            clearTimeout(timer);
            document.removeEventListener('pointerdown', handlePointerDownOutside);
        };
    }, [isOpen, column, onCreateTask, task, setActiveEditId, ctx?.state?.user]);

    return (
        <div className="border-t border-zinc-100 dark:border-zinc-800 flex flex-col gap-2 pt-2">
            {!isOpen ? (
                <Button
                    onClick={() => {
                        setFormData(getInitialValue(column, task));
                        setActiveEditId?.(myEditId);
                    }}
                    size="sm"
                    variant="secondary"
                    className="w-full bg-white dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 h-8 text-xs font-medium cursor-pointer"
                >
                    <Plus size={14} className="mr-1" /> Add Task
                </Button>
            ) : (
                <div ref={cardRef} className="p-2 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-950 shadow-sm flex flex-col gap-2">
                    <div className="py-1 flex items-start gap-1">
                        <div className="flex pr-1 text-zinc-400 items-center pl-1 pt-2">
                            <Plus size={14} />
                        </div>
                        <div className="flex-1">
                            <Textarea
                                placeholder="New task title..."
                                value={formData?.taskTitle}
                                onChange={(e) => handleOnChange('taskTitle', e?.target?.value || '')}
                                className="bg-white dark:bg-zinc-900 min-h-[36px] text-xs font-medium resize-none"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleAddTask();
                                    } else if (e.key === 'Escape') {
                                        handleCancel();
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
                            onClick={handleCancel}
                            size="sm"
                            variant="outline"
                            className="flex-1 h-8 border-rose-200 hover:border-rose-300 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:border-rose-900/60 dark:hover:bg-rose-950/40 cursor-pointer flex items-center justify-center"
                            title="Cancel"
                        >
                            <X size={18} className="text-rose-600 dark:text-rose-400" />
                        </Button>
                        <Button
                            type="button"
                            onClick={handleAddTask}
                            size="sm"
                            variant="outline"
                            className="flex-1 h-8 border-emerald-200 hover:border-emerald-300 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:border-emerald-900/60 dark:hover:bg-emerald-950/40 cursor-pointer flex items-center justify-center"
                            title="Add Task"
                        >
                            <Check size={18} className="text-emerald-600 dark:text-emerald-400" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NewTask;