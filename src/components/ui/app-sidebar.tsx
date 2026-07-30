'use client';

import * as React from 'react';
import { FolderKanban } from 'lucide-react';
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

interface MONTH_TYPE {
  monthId: string;
  monthName: string;
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const ctx = useAppState();
  const pathname = usePathname();

  const months: MONTH_TYPE[] = [
    { monthId: 'january', monthName: 'January' },
    { monthId: 'february', monthName: 'February' },
    { monthId: 'march', monthName: 'March' },
    { monthId: 'april', monthName: 'April' },
    { monthId: 'may', monthName: 'May' },
    { monthId: 'june', monthName: 'June' },
    { monthId: 'july', monthName: 'July' },
    { monthId: 'august', monthName: 'August' },
    { monthId: 'september', monthName: 'September' },
    { monthId: 'october', monthName: 'October' },
    { monthId: 'november', monthName: 'November' },
    { monthId: 'december', monthName: 'December' },
  ];

  return (
    <Sidebar collapsible="icon" className="border-r border-zinc-200 dark:border-zinc-800" {...props}>
      {/* Header: MMS App Brand */}
      <SidebarHeader className="bg-white">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/months" />}>
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

      {/* Content Body: January - December Navigation Menu */}
      <SidebarContent className="custom-scrollbar space-y-1">
        <SidebarGroup>
          <SidebarMenu className="mt-1">
            {months?.map((month) => {
              const href = `/months/${month.monthId}`;
              const isActive = pathname === href || pathname?.startsWith(`${href}?`);

              return (
                <SidebarMenuItem key={month.monthId}>
                  <SidebarMenuButton tooltip={month.monthName} isActive={isActive} render={<Link href={href} />}>
                    <FolderKanban className="size-4 text-teal-600 dark:text-teal-400 shrink-0" />
                    <span className="truncate text-xs font-medium">{month.monthName}</span>
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
