'use client'

import * as React from "react"
import { useState } from "react"
import {
    LayoutGrid,
    CheckCircle2,
    FolderKanban,
    ChevronDown,
    ChevronRight,
    MessageSquare,
    Users,
    Plus,
    UserCheck,
} from "lucide-react"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"

import logoIcon from '../../../public/logo.png';
import { useAppState } from "@/context/AppContext"
import { getProjects } from "@/dummyData/projects"
import { PROJECT_TYPE } from "@/types/project.types"
import USERS from "@/dummyData/users.json"
import { ChatTarget, GroupType } from "@/types/chat.types"
import { USER_TYPE } from "@/types/user.types"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const ctx = useAppState();
    const pathname = usePathname();
    const projects: PROJECT_TYPE[] = getProjects();

    const [isProjectsCollapsed, setIsProjectsCollapsed] = useState(false);
    const [isUsersCollapsed, setIsUsersCollapsed] = useState(false);
    const [isGroupsCollapsed, setIsGroupsCollapsed] = useState(false);

    // Initial dummy groups
    const [groups, setGroups] = useState<GroupType[]>([
        {
            id: 'g-1',
            name: 'Frontend Team',
            description: 'Core UI/UX & React development',
            members: [USERS[0], USERS[1], USERS[2]],
            lastMessage: 'Assaduzzaman: Ready for the sprint.',
            lastMessageTime: '09:20 AM'
        },
        {
            id: 'g-2',
            name: 'Project Leads',
            description: 'Sprint planning and architecture',
            members: [USERS[0], USERS[3]],
            lastMessage: 'Uttam: Architecture plan approved!',
            lastMessageTime: 'Yesterday'
        }
    ]);

    // Group Creation Dialog State
    const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [selectedMemberIds, setSelectedMemberIds] = useState<number[]>([USERS[0].userId]);

    const initialUserChats = [
        {
            user: USERS[0],
            online: true,
            lastMessage: 'Hey there! How is the project going?',
            lastMessageTime: '10:30 AM'
        },
        {
            user: USERS[1],
            online: true,
            lastMessage: 'I reviewed the pull request.',
            lastMessageTime: '09:45 AM'
        },
        {
            user: USERS[2],
            online: false,
            lastMessage: 'Can you check the API schema?',
            lastMessageTime: 'Yesterday'
        },
        {
            user: USERS[3],
            online: true,
            lastMessage: 'Task assignment updated.',
            lastMessageTime: 'Jul 26'
        },
        {
            user: USERS[4],
            online: false,
            lastMessage: 'Design mockup attached.',
            lastMessageTime: 'Jul 25'
        }
    ];

    const handleOpenUserChat = (userChat: typeof initialUserChats[0]) => {
        const target: ChatTarget = {
            id: userChat.user.userId,
            type: 'user',
            name: userChat.user.fullName,
            avatar: userChat.user.photoUrl,
            online: userChat.online,
            lastMessage: userChat.lastMessage,
            lastMessageTime: userChat.lastMessageTime
        };
        ctx?.openChat(target);
    };

    const handleOpenGroupChat = (group: GroupType) => {
        const target: ChatTarget = {
            id: group.id,
            type: 'group',
            name: group.name,
            members: group.members,
            lastMessage: group.lastMessage,
            lastMessageTime: group.lastMessageTime
        };
        ctx?.openChat(target);
    };

    const handleCreateGroup = () => {
        if (!newGroupName.trim()) return;
        const selectedMembers = USERS.filter((u) => selectedMemberIds.includes(u.userId));
        const newGroup: GroupType = {
            id: `g-${Date.now()}`,
            name: newGroupName.trim(),
            members: selectedMembers.length > 0 ? selectedMembers : [USERS[0]],
            lastMessage: 'Group created!',
            lastMessageTime: 'Just now'
        };
        setGroups((prev) => [...prev, newGroup]);
        setNewGroupName('');
        setSelectedMemberIds([USERS[0].userId]);
        setIsCreateGroupOpen(false);

        ctx?.openChat({
            id: newGroup.id,
            type: 'group',
            name: newGroup.name,
            members: newGroup.members,
            lastMessage: newGroup.lastMessage,
            lastMessageTime: newGroup.lastMessageTime
        });
    };

    const toggleMemberSelection = (userId: number) => {
        setSelectedMemberIds((prev) =>
            prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
        );
    };

    return (
        <>
            <Sidebar collapsible="icon" className="border-r border-zinc-200 dark:border-zinc-800" {...props}>
                {/* Header: ZenFlow App Brand */}
                <SidebarHeader>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton size="lg" render={<Link href="/projects" />}>
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg text-white">
                                    <Image alt='Z' height={40} width={40} src={logoIcon} className="object-contain" />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <div className='px-1 text-[24px] cursor-pointer text-teal-800 dark:text-teal-400 font-extrabold'>ZenFlow</div>
                                </div>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarHeader>

                {/* Content Body */}
                <SidebarContent className="custom-scrollbar space-y-1">
                    {/* Navigation Group */}
                    <SidebarGroup>
                        <SidebarGroupLabel className="px-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                            Navigation
                        </SidebarGroupLabel>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    tooltip="All Projects"
                                    isActive={pathname === '/projects'}
                                    render={<Link href="/projects" />}
                                >
                                    <LayoutGrid className="size-4 text-zinc-600 dark:text-zinc-400" />
                                    <span>All Projects</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroup>

                    {/* Collapsible Projects List Group */}
                    <SidebarGroup>
                        <div
                            onClick={() => setIsProjectsCollapsed((prev) => !prev)}
                            className="px-3 py-1 flex items-center justify-between cursor-pointer group hover:text-zinc-800 dark:hover:text-zinc-200 select-none"
                        >
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                                {isProjectsCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                                <span>Projects</span>
                            </div>
                            <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded-full font-semibold">
                                {projects.length}
                            </span>
                        </div>

                        {!isProjectsCollapsed && (
                            <SidebarMenu className="mt-1">
                                {projects.map((proj) => {
                                    const href = `/projects/${proj.projectId}`;
                                    const isActive = pathname === href;

                                    return (
                                        <SidebarMenuItem key={proj.projectId}>
                                            <SidebarMenuButton
                                                tooltip={proj.projectName}
                                                isActive={isActive}
                                                render={<Link href={href} />}
                                            >
                                                {proj.isClosed ? (
                                                    <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                                ) : (
                                                    <FolderKanban className="size-4 text-teal-600 dark:text-teal-400 shrink-0" />
                                                )}
                                                <span className="truncate text-xs font-medium">{proj.projectName}</span>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    );
                                })}
                            </SidebarMenu>
                        )}
                    </SidebarGroup>

                    {/* Direct Messages (Users) Section */}
                    <SidebarGroup>
                        <div
                            onClick={() => setIsUsersCollapsed((prev) => !prev)}
                            className="px-3 py-1 flex items-center justify-between cursor-pointer group hover:text-zinc-800 dark:hover:text-zinc-200 select-none"
                        >
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                                {isUsersCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                                <span>Direct Messages</span>
                            </div>
                            <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded-full font-semibold">
                                {initialUserChats.length}
                            </span>
                        </div>

                        {!isUsersCollapsed && (
                            <SidebarMenu className="mt-1">
                                {initialUserChats.map((uc) => (
                                    <SidebarMenuItem key={uc.user.userId}>
                                        <SidebarMenuButton
                                            tooltip={uc.user.fullName}
                                            onClick={() => handleOpenUserChat(uc)}
                                            className="h-auto py-1.5 px-2 flex items-center gap-2.5 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-colors"
                                        >
                                            <div className="relative shrink-0">
                                                <Avatar className="h-6 w-6">
                                                    <AvatarImage src={uc.user.photoUrl} alt={uc.user.fullName} />
                                                    <AvatarFallback className="text-[10px]">{uc.user.fullName[0]}</AvatarFallback>
                                                </Avatar>
                                                {uc.online && (
                                                    <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 rounded-full ring-1 ring-white dark:ring-zinc-950" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0 text-left">
                                                <div className="flex items-center justify-between">
                                                    <span className="truncate text-xs font-medium text-zinc-800 dark:text-zinc-200">
                                                        {uc.user.fullName}
                                                    </span>
                                                    <span className="text-[9px] text-zinc-400 shrink-0 ml-1">
                                                        {uc.lastMessageTime}
                                                    </span>
                                                </div>
                                                <p className="truncate text-[10px] text-zinc-400">
                                                    {uc.lastMessage}
                                                </p>
                                            </div>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        )}
                    </SidebarGroup>

                    {/* Groups Section */}
                    <SidebarGroup>
                        <div className="px-3 py-1 flex items-center justify-between select-none">
                            <div
                                onClick={() => setIsGroupsCollapsed((prev) => !prev)}
                                className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 uppercase tracking-wider cursor-pointer hover:text-zinc-800 dark:hover:text-zinc-200"
                            >
                                {isGroupsCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                                <span>Groups</span>
                            </div>

                            <div className="flex items-center gap-1">
                                <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded-full font-semibold">
                                    {groups.length}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setIsCreateGroupOpen(true)}
                                    className="p-1 text-zinc-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors cursor-pointer"
                                    title="Create New Group"
                                >
                                    <Plus size={14} />
                                </button>
                            </div>
                        </div>

                        {!isGroupsCollapsed && (
                            <SidebarMenu className="mt-1">
                                {groups.map((group) => (
                                    <SidebarMenuItem key={group.id}>
                                        <SidebarMenuButton
                                            tooltip={group.name}
                                            onClick={() => handleOpenGroupChat(group)}
                                            className="h-auto py-1.5 px-2 flex items-center gap-2.5 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-colors"
                                        >
                                            <div className="h-6 w-6 rounded-full bg-teal-600/10 text-teal-600 dark:bg-teal-500/20 dark:text-teal-400 flex items-center justify-center shrink-0">
                                                <Users size={13} />
                                            </div>
                                            <div className="flex-1 min-w-0 text-left">
                                                <div className="flex items-center justify-between">
                                                    <span className="truncate text-xs font-medium text-zinc-800 dark:text-zinc-200">
                                                        {group.name}
                                                    </span>
                                                    <span className="text-[9px] text-zinc-400 shrink-0 ml-1">
                                                        {group.lastMessageTime}
                                                    </span>
                                                </div>
                                                <p className="truncate text-[10px] text-zinc-400">
                                                    {group.lastMessage || `${group.members?.length || 0} members`}
                                                </p>
                                            </div>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        )}
                    </SidebarGroup>
                </SidebarContent>

                {/* Footer: User Profile */}
                <SidebarFooter>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton size="lg">
                                <Avatar className="h-8 w-8 rounded-lg">
                                    <AvatarImage src={ctx?.state?.user?.photoUrl || ''} alt={ctx?.state?.user?.fullName || 'User'} />
                                    <AvatarFallback className="rounded-lg">{ctx?.state?.user?.fullName?.[0] || 'U'}</AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold text-xs">{ctx?.state?.user?.fullName || 'User'}</span>
                                    <span className="truncate text-[11px] text-zinc-500">{ctx?.state?.user?.userName || 'user@zenflow.com'}</span>
                                </div>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarFooter>
            </Sidebar>

            {/* Create Group Dialog */}
            <Dialog open={isCreateGroupOpen} onOpenChange={setIsCreateGroupOpen}>
                <DialogContent className="sm:max-w-[420px] p-5 space-y-4">
                    <DialogHeader>
                        <DialogTitle className="text-sm font-semibold flex items-center gap-2">
                            <Users size={16} className="text-teal-600" /> Create New Chat Group
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-3">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                                Group Name
                            </label>
                            <Input
                                placeholder="e.g. Design System Team"
                                value={newGroupName}
                                onChange={(e) => setNewGroupName(e.target.value)}
                                className="text-xs h-9 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                                autoFocus
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                                Add Initial Members
                            </label>
                            <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar border border-zinc-200/80 dark:border-zinc-800 rounded-lg p-2 bg-zinc-50/50 dark:bg-zinc-900/40">
                                {USERS.map((user) => {
                                    const isSelected = selectedMemberIds.includes(user.userId);
                                    return (
                                        <div
                                            key={user.userId}
                                            onClick={() => toggleMemberSelection(user.userId)}
                                            className={`flex items-center justify-between p-1.5 rounded-md cursor-pointer transition-colors ${
                                                isSelected ? 'bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-6 w-6">
                                                    <AvatarImage src={user.photoUrl} alt={user.fullName} />
                                                    <AvatarFallback className="text-[10px]">{user.fullName[0]}</AvatarFallback>
                                                </Avatar>
                                                <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200">{user.fullName}</span>
                                            </div>
                                            {isSelected && <UserCheck size={14} className="text-teal-600 dark:text-teal-400" />}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setIsCreateGroupOpen(false)}
                            className="text-xs font-medium cursor-pointer"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            onClick={handleCreateGroup}
                            disabled={!newGroupName.trim()}
                            className="text-xs font-medium bg-teal-700 hover:bg-teal-800 text-white cursor-pointer"
                        >
                            Create Group
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
