'use client'

import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import TaskCard from './TaskCard';
import { ColumnType, TaskType } from '@/types/task.types'
import NewTask from './NewTask'
import { GripHorizontal } from 'lucide-react';

interface Props {
    column: ColumnType;
    tasks: TaskType[];
    onCreateTask: (newTask: TaskType) => void;
    onUpdateTask?: (updatedTask: TaskType) => void;
    onDeleteTask?: (taskId: string | number) => void;
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
    isOverlay,
    activeEditId,
    setActiveEditId,
}: Props) {
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
        disabled: isOverlay,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
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
        <div
            ref={setNodeRef}
            style={{ ...style, maxHeight: `calc(-110px + 100vh)` }}
            className="w-[300px] min-w-[300px] bg-zinc-50/50 dark:bg-zinc-900/50 border border-zinc-200/80 rounded-xl flex flex-col p-4"
        >
            {/* Column Header */}
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                    <button
                        {...attributes}
                        {...listeners}
                        className="cursor-grab active:cursor-grabbing text-zinc-400 hover:text-zinc-600"
                    >
                        <GripHorizontal size={18} />
                    </button>
                    <h3 className="font-semibold text-zinc-800 dark:text-zinc-200 text-sm tracking-tight">
                        {column?.title}
                    </h3>
                </div>
                <span className="text-xs bg-zinc-200/60 dark:bg-zinc-800 px-2 py-0.5 rounded-full font-medium text-zinc-600 dark:text-zinc-400">
                    {tasks?.length}
                </span>
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
    );
}
