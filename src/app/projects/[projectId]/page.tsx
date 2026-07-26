'use client'

import React, { useState } from 'react'
import {
    DndContext,
    DragEndEvent,
    DragOverEvent,
    DragOverlay,
    DragStartEvent,
    PointerSensor,
    useSensor,
    useSensors,
    closestCorners,
    pointerWithin,
    CollisionDetection,
} from '@dnd-kit/core'
import { arrayMove, SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable'
import { createPortal } from 'react-dom'
import { ColumnType, TaskType } from '@/types/task.types'
import BoardColumn from './BoardColumn'
import TaskCard from '@/app/projects/[projectId]/TaskCard'
import { useSidebar } from '@/components/ui/sidebar'
import { useAppState } from '@/context/AppContext'
import { getProjects } from '@/dummyData/projects'
import { PROJECT_TYPE } from '@/types/project.types'
import { useParams } from 'next/navigation'
import NewSection from './NewSection'
import { columnData, taskData } from '@/dummyData/tasks'

export default function KanbanBoard() {
    const projects: PROJECT_TYPE[] = getProjects()
    const { projectId } = useParams()
    const [mounted, setMounted] = useState(false)

    React.useEffect(() => {
        setMounted(true)
        const mainContentElem = document.getElementById('main-content');
        if (mainContentElem) mainContentElem.style.overflow = 'hidden'
    }, [])

    const { open, isMobile } = useSidebar()

    const ctx = useAppState()

    React.useEffect(() => {
        const project = projects?.find(ec => ec?.projectId?.toString() === projectId?.toString())
        if (project && ctx?.state?.project?.projectId?.toString() !== projectId?.toString()) ctx?.setProject?.(project)
    }, [ctx, projectId, projects])

    // Dynamic dynamic width calculate structure based on state
    const getMaxWidthClass = () => {
        if (isMobile) return "max-w-full"
        return open ? "max-w-[calc(100vw-266px)]" : "max-w-[calc(100vw-58px)]"
    }

    const [columns, setColumns] = useState<ColumnType[]>(columnData)
    const [tasks, setTasks] = useState<TaskType[]>(taskData)

    const [activeColumn, setActiveColumn] = useState<ColumnType | null>(null)
    const [activeTask, setActiveTask] = useState<TaskType | null>(null)

    // Global single active edit ID across entire board (e.g. 'newtask-1' or 'card-task-123')
    const [activeEditId, setActiveEditId] = useState<string | number | null>(null)

    // Store state before drag starts to restore on drag cancel / drop outside
    const [clonedColumns, setClonedColumns] = useState<ColumnType[] | null>(null)
    const [clonedTasks, setClonedTasks] = useState<TaskType[] | null>(null)

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 8 }, // prevents click conflicts
        })
    )

    // Custom Collision Detection strategy for Kanban
    const collisionDetectionStrategy: CollisionDetection = React.useCallback(
        (args) => {
            if (activeColumn) {
                return closestCorners({
                    ...args,
                    droppableContainers: args.droppableContainers.filter(
                        (container) => container.data.current?.type === 'Column'
                    ),
                })
            }

            const pointerCollisions = pointerWithin(args)
            if (pointerCollisions.length > 0) {
                return pointerCollisions
            }

            return closestCorners(args)
        },
        [activeColumn]
    )

    // Handlers to Create Column / Tasks / Update Tasks
    const createNewSection = (newSection: string): void => {
        const id = `col-${Date.now()}`
        setColumns([...columns, { id, title: newSection }])
    }

    const handleCreateTask = (newTask: TaskType) => {
        setTasks([...tasks, newTask])
    }

    const handleUpdateTask = (updatedTask: TaskType) => {
        setTasks((prev) => prev.map((t) => (t.taskId === updatedTask.taskId ? updatedTask : t)))
    }

    const handleDeleteTask = (taskId: string | number) => {
        setTasks((prev) => prev.filter((t) => t.taskId !== taskId))
    }

    // Drag Handlers
    function handleDragStart(event: DragStartEvent) {
        setClonedColumns(columns)
        setClonedTasks(tasks)

        if (event.active.data.current?.type === 'Column') {
            setActiveColumn(event.active.data.current.column)
            return
        }
        if (event.active.data.current?.type === 'Task') {
            setActiveTask(event.active.data.current.task)
        }
    }

    function handleDragCancel() {
        if (clonedColumns) setColumns(clonedColumns)
        if (clonedTasks) setTasks(clonedTasks)
        setActiveColumn(null)
        setActiveTask(null)
        setClonedColumns(null)
        setClonedTasks(null)
    }

    function handleDragOver(event: DragOverEvent) {
        const { active, over } = event
        if (!over) return

        const activeId = active.id
        const overId = over.id

        if (activeId === overId) return

        const isActiveAColumn = active.data.current?.type === 'Column'
        const isActiveATask = active.data.current?.type === 'Task'
        const isOverATask = over.data.current?.type === 'Task'
        const isOverAColumn = over.data.current?.type === 'Column'

        // Column over Column or Column over Task
        if (isActiveAColumn) {
            setColumns((prevCols) => {
                const activeColumnIndex = prevCols.findIndex((col) => col.id === activeId)
                let overColumnIndex = prevCols.findIndex((col) => col.id === overId)

                if (overColumnIndex === -1 && isOverATask) {
                    const overTaskColumnId = over.data.current?.task?.columnId
                    overColumnIndex = prevCols.findIndex((col) => col.id === overTaskColumnId)
                }

                if (activeColumnIndex !== -1 && overColumnIndex !== -1 && activeColumnIndex !== overColumnIndex) {
                    return arrayMove(prevCols, activeColumnIndex, overColumnIndex)
                }
                return prevCols
            })
            return
        }

        if (!isActiveATask) return

        // Task over Task
        if (isOverATask) {
            setTasks((prevTasks) => {
                const activeIndex = prevTasks.findIndex((t) => t.taskId === activeId)
                const overIndex = prevTasks.findIndex((t) => t.taskId === overId)

                if (activeIndex === -1 || overIndex === -1) return prevTasks

                const activeTask = prevTasks[activeIndex]
                const overTask = prevTasks[overIndex]

                if (activeTask.columnId !== overTask.columnId) {
                    const updatedTasks = [...prevTasks]
                    updatedTasks[activeIndex] = {
                        ...activeTask,
                        columnId: overTask.columnId,
                    }
                    return arrayMove(updatedTasks, activeIndex, overIndex)
                }

                if (activeIndex !== overIndex) {
                    return arrayMove(prevTasks, activeIndex, overIndex)
                }

                return prevTasks
            })
        }

        // Task over Column (e.g. empty column or target column header/container)
        if (isOverAColumn) {
            setTasks((prevTasks) => {
                const activeIndex = prevTasks.findIndex((t) => t.taskId === activeId)
                if (activeIndex === -1) return prevTasks

                const activeTask = prevTasks[activeIndex]
                const targetColumnId = overId.toString()

                if (activeTask.columnId !== targetColumnId) {
                    const updatedTasks = [...prevTasks]
                    updatedTasks[activeIndex] = {
                        ...activeTask,
                        columnId: targetColumnId,
                    }
                    const targetColumnTasks = prevTasks.filter((t) => t.columnId === targetColumnId)
                    if (targetColumnTasks.length > 0) {
                        const lastTask = targetColumnTasks[targetColumnTasks.length - 1]
                        const lastTaskIndex = prevTasks.findIndex((t) => t.taskId === lastTask.taskId)
                        return arrayMove(updatedTasks, activeIndex, lastTaskIndex)
                    }
                    return updatedTasks
                }

                return prevTasks
            })
        }
    }

    function handleDragEnd(event: DragEndEvent) {
        const { over } = event

        if (!over) {
            if (clonedColumns) setColumns(clonedColumns)
            if (clonedTasks) setTasks(clonedTasks)
        }

        setActiveColumn(null)
        setActiveTask(null)
        setClonedColumns(null)
        setClonedTasks(null)
    }

    return (
        <div className="min-h-screen bg-white text-zinc-900 flex flex-col font-sans select-none">
            {/* Main Drag Canvas Context */}
            <div className={`flex-1 flex gap-6 items-start overflow-x-auto pt-1 custom-scrollbar ${getMaxWidthClass()}`}>
                <DndContext
                    sensors={sensors}
                    collisionDetection={collisionDetectionStrategy}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDragEnd={handleDragEnd}
                    onDragCancel={handleDragCancel}
                >
                    <SortableContext items={columns.map((c) => c.id)} strategy={horizontalListSortingStrategy}>
                        {columns.map((col) => (
                            <BoardColumn
                                key={col.id}
                                column={col}
                                tasks={tasks.filter((t) => t.columnId?.toString() === col.id?.toString())}
                                onCreateTask={handleCreateTask}
                                onUpdateTask={handleUpdateTask}
                                onDeleteTask={handleDeleteTask}
                                activeEditId={activeEditId}
                                setActiveEditId={setActiveEditId}
                            />
                        ))}
                    </SortableContext>
                    <NewSection createNewSection={createNewSection} />

                    {/* Smooth Floating Overlay Portal */}
                    {mounted && typeof window !== 'undefined' &&
                        createPortal(
                            <DragOverlay dropAnimation={{ duration: 200, easing: 'cubic-bezier(0.18, 0.89, 0.32, 1.28)' }}>
                                {activeColumn && (
                                    <BoardColumn
                                        column={activeColumn}
                                        tasks={tasks.filter((t) => t.columnId?.toString() === activeColumn.id?.toString())}
                                        onCreateTask={handleCreateTask}
                                        onUpdateTask={handleUpdateTask}
                                        onDeleteTask={handleDeleteTask}
                                        isOverlay
                                    />
                                )}
                                {activeTask && <TaskCard task={activeTask} isOverlay />}
                            </DragOverlay>,
                            document.body
                        )}
                </DndContext>
            </div>
        </div>
    )
}
