'use client'

import * as React from "react"
import {
    Folder,
    LayoutGrid,
    CheckCircle2,
    FolderKanban,
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
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"

import logoIcon from '../../../public/logo.png';
import { useAppState } from "@/context/AppContext"
import { getProjects } from "@/dummyData/projects"
import { PROJECT_TYPE } from "@/types/project.types"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const ctx = useAppState();
    const pathname = usePathname();
    const projects: PROJECT_TYPE[] = getProjects();

    return (
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
            <SidebarContent className="custom-scrollbar">
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

                {/* Projects List Group */}
                <SidebarGroup>
                    <SidebarGroupLabel className="px-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
                        <span>Projects</span>
                        <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded-full font-semibold">
                            {projects.length}
                        </span>
                    </SidebarGroupLabel>
                    <SidebarMenu>
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
    );
}
