
'use client';

import * as React from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import logoIcon from '../../../public/logo.png';
import { useAppState } from '@/context/AppContext';
import { cn } from '@/lib/utils';
import { getMenuData } from '@/lib/menuData';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const ctx = useAppState();
  const pathname = usePathname();

  const menuItem = getMenuData(pathname)

  return (
    <Sidebar collapsible="icon" className="border-r border-zinc-200 dark:border-zinc-800" {...props}>

      <SidebarHeader className="bg-white">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/summary" />}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg text-white">
                <Image alt="Z" height={40} width={40} src={logoIcon} className="object-none" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <div className="px-1 text-[24px] cursor-pointer text-teal-800 dark:text-teal-400 font-extrabold">
                  MMS
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="custom-scrollbar space-y-1">

        <SidebarGroup>
          <SidebarMenu>
            {menuItem?.map((item, idx) => {
              const IconComp = item.icon;
              return (
                <SidebarMenuItem key={idx}>
                  <SidebarMenuButton
                    tooltip={item.tooltip}
                    isActive={item.isActive}
                    className={cn(
                      item.isActive && 'bg-teal-700! text-white! hover:bg-teal-800! hover:text-white!'
                    )}
                    render={<Link href={item.href} />}
                  >
                    <IconComp
                      className={cn(
                        'size-4 shrink-0',
                        item.isActive ? 'text-white!' : 'text-teal-600 dark:text-teal-400'
                      )}
                    />
                    <span
                      className={cn(
                        'truncate text-xs font-bold',
                        item.isActive ? 'text-white!' : 'text-zinc-800 dark:text-zinc-200'
                      )}
                    >
                      {item.label}
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/profile" />}>
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={ctx?.state?.user?.photoUrl || ''} alt={ctx?.state?.user?.fullName || 'User'} />
                <AvatarFallback className="rounded-lg">{ctx?.state?.user?.fullName?.[0] || 'U'}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold text-xs">{ctx?.state?.user?.fullName || 'User'}</span>
                <span className="truncate text-[11px] text-zinc-500">
                  {ctx?.state?.user?.userName || 'user@MMS.com'}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
