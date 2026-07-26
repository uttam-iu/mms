'use client'

import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Loader, Plus, Search, ArrowRight, FolderKanban, CalendarDays, CheckCircle2, Pencil, Trash2, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import { PROJECT_TYPE } from '@/types/project.types';
import MyAvatarGroup from '@/components/MyAvatarGroup';
import Assignee from '@/components/Assignee';
import { getProjects } from '@/dummyData/projects';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { useAppState } from '@/context/AppContext';
import { USER_TYPE } from '@/types/user.types';

export default function ProjectsPage() {
    const ctx = useAppState();
    const [projects, setProjects] = useState<PROJECT_TYPE[]>(getProjects());
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'in_progress' | 'completed'>('all');

    // Dialog & Form state for Create / Edit
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<PROJECT_TYPE | null>(null);
    const [formData, setFormData] = useState<{
        projectName: string;
        projectDescription: string;
        isClosed: boolean;
        participants: USER_TYPE[];
    }>({
        projectName: '',
        projectDescription: '',
        isClosed: false,
        participants: [],
    });

    // State for Delete Confirmation Dialog
    const [deletingProject, setDeletingProject] = useState<PROJECT_TYPE | null>(null);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

    const handleOpenCreate = () => {
        setEditingProject(null);
        setFormData({
            projectName: '',
            projectDescription: '',
            isClosed: false,
            participants: ctx?.state?.user ? [ctx.state.user] : [],
        });
        setIsDialogOpen(true);
    };

    const handleOpenEdit = (pro: PROJECT_TYPE, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setEditingProject(pro);
        setFormData({
            projectName: pro.projectName,
            projectDescription: pro.projectDescription || '',
            isClosed: pro.isClosed,
            participants: pro.participants || [],
        });
        setIsDialogOpen(true);
    };

    const handleOpenDeleteProject = (pro: PROJECT_TYPE, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDeletingProject(pro);
        setIsDeleteConfirmOpen(true);
    };

    const handleConfirmDeleteProject = () => {
        if (deletingProject) {
            setProjects((prev) => prev.filter((p) => p.projectId !== deletingProject.projectId));
            setDeletingProject(null);
            setIsDeleteConfirmOpen(false);
        }
    };

    const handleSaveProject = () => {
        if (!formData.projectName.trim()) return;

        if (editingProject) {
            // Update existing project
            setProjects((prev) =>
                prev.map((p) =>
                    p.projectId === editingProject.projectId
                        ? {
                              ...p,
                              projectName: formData.projectName.trim(),
                              projectDescription: formData.projectDescription.trim(),
                              isClosed: formData.isClosed,
                              closedAt: formData.isClosed ? new Date().toISOString() : null,
                              participants: formData.participants,
                          }
                        : p
                )
            );
        } else {
            // Create new project
            const newProj: PROJECT_TYPE = {
                projectId: Date.now(),
                projectName: formData.projectName.trim(),
                projectDescription: formData.projectDescription.trim(),
                createdAt: new Date().toLocaleDateString([], { year: 'numeric', month: '2-digit', day: '2-digit' }),
                createdBy: ctx?.state?.user || {
                    userId: 1,
                    userName: 'uttam@k.com',
                    fullName: 'Uttam Kumar',
                    photoUrl: 'https://github.com/shadcn.png',
                },
                participants: formData.participants,
                isClosed: formData.isClosed,
                closedAt: formData.isClosed ? new Date().toISOString() : null,
            };
            setProjects((prev) => [newProj, ...prev]);
        }

        setIsDialogOpen(false);
    };

    const filteredProjects = projects.filter((project) => {
        const matchesSearch =
            project.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            project.projectDescription?.toLowerCase().includes(searchQuery.toLowerCase());

        if (statusFilter === 'in_progress') {
            return matchesSearch && !project.isClosed;
        }
        if (statusFilter === 'completed') {
            return matchesSearch && project.isClosed;
        }
        return matchesSearch;
    });

    return (
        <div className="h-[calc(100vh-56px)] flex flex-col bg-zinc-50/50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans overflow-hidden">
            {/* Sticky Filter Controls Header */}
            <div className="sticky top-0 z-10 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md p-2 border-b border-zinc-200/80 dark:border-zinc-800 shrink-0">
                <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-wrap">
                        {/* Search Bar */}
                        <div className="relative w-64">
                            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                            <Input
                                placeholder="Search projects..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-8 h-8 text-xs bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                            />
                        </div>

                        {/* Status Filter Tabs */}
                        <div className="flex items-center bg-zinc-100 dark:bg-zinc-900 p-0.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs font-medium">
                            <button
                                type="button"
                                onClick={() => setStatusFilter('all')}
                                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                                    statusFilter === 'all'
                                        ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                                        : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                                }`}
                            >
                                All ({projects.length})
                            </button>
                            <button
                                type="button"
                                onClick={() => setStatusFilter('in_progress')}
                                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                                    statusFilter === 'in_progress'
                                        ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                                        : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                                }`}
                            >
                                Active
                            </button>
                            <button
                                type="button"
                                onClick={() => setStatusFilter('completed')}
                                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                                    statusFilter === 'completed'
                                        ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                                        : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                                }`}
                            >
                                Completed
                            </button>
                        </div>
                    </div>

                    {/* Create Project Button */}
                    <Button
                        type="button"
                        onClick={handleOpenCreate}
                        size="sm"
                        className="h-8 text-xs font-semibold px-3 cursor-pointer flex items-center gap-1"
                    >
                        <Plus size={14} /> New Project
                    </Button>
                </div>
            </div>

            {/* Scrollable Projects Container */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pt-4 px-4">
                <div className="max-w-7xl mx-auto w-full">
                    {filteredProjects.length === 0 ? (
                        <div className="p-6 text-center bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-3">
                            <FolderKanban size={32} className="mx-auto text-zinc-300 dark:text-zinc-700" />
                            <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">No projects found</h3>
                            <p className="text-xs text-zinc-400">Try adjusting your search filter or create a new project.</p>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                    setSearchQuery('');
                                    setStatusFilter('all');
                                }}
                                className="text-xs"
                            >
                                Reset Filter
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pb-8">
                            {filteredProjects.map((pro: PROJECT_TYPE) => (
                                <Link href={`/projects/${pro.projectId}`} key={pro.projectId} className="group block">
                                    <Card className="h-full bg-white dark:bg-zinc-900 border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200 flex flex-col justify-between overflow-hidden relative">
                                        <CardHeader className="pb-3 space-y-2">
                                            <div className="flex items-start justify-between gap-2">
                                                <CardTitle className="text-base font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors line-clamp-1">
                                                    {pro.projectName}
                                                </CardTitle>
                                                <div className="flex items-center gap-1.5 shrink-0">
                                                    {pro.isClosed ? (
                                                        <Badge
                                                            variant="outline"
                                                            className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60 text-[10px] font-semibold px-2 py-0.5"
                                                        >
                                                            <CheckCircle2 size={11} className="mr-1 text-emerald-600" />
                                                            Done
                                                        </Badge>
                                                    ) : (
                                                        <Badge
                                                            variant="outline"
                                                            className="bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800/60 text-[10px] font-semibold px-2 py-0.5"
                                                        >
                                                            <Loader size={11} className="mr-1 animate-spin text-amber-600" />
                                                            In Progress
                                                        </Badge>
                                                    )}

                                                    {/* Edit Pencil Button */}
                                                    <button
                                                        type="button"
                                                        onClick={(e) => handleOpenEdit(pro, e)}
                                                        className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                                                        title="Edit project"
                                                    >
                                                        <Pencil size={13} />
                                                    </button>

                                                    {/* Red Delete Icon Button */}
                                                    <button
                                                        type="button"
                                                        onClick={(e) => handleOpenDeleteProject(pro, e)}
                                                        className="p-1 rounded-md text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                                                        title="Delete project"
                                                    >
                                                        <Trash2 size={13} />
                                                    </button>
                                                </div>
                                            </div>
                                            {pro.projectDescription && (
                                                <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 font-normal leading-relaxed">
                                                    {pro.projectDescription}
                                                </p>
                                            )}
                                        </CardHeader>

                                        <CardContent className="py-2 space-y-3">
                                            <div className="flex items-center justify-between text-[11px] text-zinc-400">
                                                <div className="flex items-center gap-1.5">
                                                    <CalendarDays size={12} />
                                                    <span>Created {pro.createdAt?.split(' ')?.[0] || '2026-07-12'}</span>
                                                </div>
                                                <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                    Operational
                                                </div>
                                            </div>
                                        </CardContent>

                                        <CardFooter className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
                                            <MyAvatarGroup users={pro.participants || []} maxItem={4} />
                                            <div className="text-xs font-semibold text-teal-600 dark:text-teal-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                                <span>Open Board</span>
                                                <ArrowRight size={13} />
                                            </div>
                                        </CardFooter>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Dialog for Project Create / Edit */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[500px] p-6">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                            {editingProject ? 'Edit Project' : 'Create New Project'}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        {/* Project Name */}
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                                Project Name
                            </label>
                            <Input
                                placeholder="Enter project name..."
                                value={formData.projectName}
                                onChange={(e) => setFormData((prev) => ({ ...prev, projectName: e.target.value }))}
                                className="text-xs"
                                autoFocus
                            />
                        </div>

                        {/* Project Description */}
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                                Description
                            </label>
                            <Textarea
                                placeholder="Enter project description..."
                                value={formData.projectDescription}
                                onChange={(e) => setFormData((prev) => ({ ...prev, projectDescription: e.target.value }))}
                                className="text-xs min-h-[80px]"
                            />
                        </div>

                        {/* Project Status */}
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                                Status
                            </label>
                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    size="sm"
                                    variant={!formData.isClosed ? 'default' : 'outline'}
                                    onClick={() => setFormData((prev) => ({ ...prev, isClosed: false }))}
                                    className="text-xs h-8 flex-1 cursor-pointer"
                                >
                                    In Progress
                                </Button>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant={formData.isClosed ? 'default' : 'outline'}
                                    onClick={() => setFormData((prev) => ({ ...prev, isClosed: true }))}
                                    className="text-xs h-8 flex-1 cursor-pointer"
                                >
                                    Completed
                                </Button>
                            </div>
                        </div>

                        {/* Participants Selector */}
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                                Team Participants
                            </label>
                            <div>
                                <Assignee
                                    name="participants"
                                    values={formData.participants}
                                    onChange={(_name, val) => setFormData((prev) => ({ ...prev, participants: val || [] }))}
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="flex items-center justify-end gap-2 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setIsDialogOpen(false)}
                            className="h-8 text-rose-600 hover:text-rose-700 border-rose-200 hover:bg-rose-50 dark:border-rose-900/60 dark:hover:bg-rose-950/40 text-xs font-medium cursor-pointer"
                            title="Cancel"
                        >
                            <X size={16} />
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            onClick={handleSaveProject}
                            variant="outline"
                            className="h-8 border-emerald-200 hover:border-emerald-300 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:border-emerald-900/60 dark:hover:bg-emerald-950/40 text-xs font-medium cursor-pointer"
                            title="Save Project"
                        >
                            <Check size={16} />
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal Dialog for Project Delete Confirmation */}
            <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
                <DialogContent className="sm:max-w-[420px] p-6">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                            <Trash2 size={18} className="text-rose-600 dark:text-rose-400" />
                            Delete Project
                        </DialogTitle>
                    </DialogHeader>

                    <div className="py-2 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        Are you sure you want to delete <strong className="text-zinc-900 dark:text-zinc-100">{deletingProject?.projectName}</strong>? This action cannot be undone and will remove all project data.
                    </div>

                    <DialogFooter className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setIsDeleteConfirmOpen(false)}
                            className="h-8 border-rose-200 hover:border-rose-300 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:border-rose-900/60 dark:hover:bg-rose-950/40 text-xs font-medium cursor-pointer"
                            title="Cancel"
                        >
                            <X size={16} />
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            onClick={handleConfirmDeleteProject}
                            className="h-8 bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium cursor-pointer flex items-center gap-1"
                        >
                            <Trash2 size={14} /> Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
