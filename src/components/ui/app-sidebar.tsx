
'use client';

import * as React from 'react';
import {
  Users,
  User,
  icons,
} from 'lucide-react';
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
import { usePathname, useSearchParams } from 'next/navigation';
import logoIcon from '../../../public/logo.png';
import { useAppState } from '@/context/AppContext';
import { cn } from '@/lib/utils';
import axios from 'axios';
import Loader from '../Loader';
import { useApiCall } from '@/hooks/useApiCall';

interface MONTH_META {
  monthId: string;
  monthName: string;
  monthIndex: number; // 0 to 11
  icon: React.ComponentType<{ className?: string }>;
  colorClass: string;
  bgClass: string;
  isCurrentMonth: boolean;
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const ctx = useAppState();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { isLoading, resp } = useApiCall('menus', 'GET', {});

  return (
    <Sidebar collapsible="icon" className="border-r border-zinc-200 dark:border-zinc-800" {...props}>

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

      <SidebarContent className="custom-scrollbar space-y-1">

        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="My Profile"
                isActive={pathname === '/profile'}
                render={<Link href="/profile" />}
              >
                <User className="size-4 text-teal-600 dark:text-teal-400 shrink-0" />
                <span className="truncate text-xs font-bold text-zinc-800 dark:text-zinc-200">My Profile</span>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="Members Management"
                isActive={pathname === '/members' || pathname?.startsWith('/members?')}
                render={<Link href="/members" />}
              >
                <Users className="size-4 text-teal-600 dark:text-teal-400 shrink-0" />
                <span className="truncate text-xs font-bold text-zinc-800 dark:text-zinc-200">House Members</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {isLoading ? <div className="flex items-center justify-center p-4"><Loader /></div> : <SidebarGroup>
          <SidebarMenu className="mt-1 space-y-0.5">
            {resp?.data?.map((month: MONTH_META) => {
              const currentMonthParam = searchParams?.get('month');

              const href = `/months?month=${month?.monthId}&year=${new Date().getFullYear()?.toString()}`;
              const isActive =
                pathname === '/months' && currentMonthParam?.toLowerCase() === month.monthId.toLowerCase()

              const IconComp = icons?.[month?.icon] || '';

              return (
                <SidebarMenuItem key={month.monthId}>
                  <SidebarMenuButton tooltip={month.monthName} isActive={isActive} render={<Link href={href} />}>
                    <div
                      className={cn(
                        'flex size-5 items-center justify-center rounded-md shrink-0 transition-transform group-hover/menu-button:scale-110',
                        month.bgClass
                      )}
                    >
                      {IconComp && <IconComp className={cn('size-3.5', month.colorClass)} />}
                    </div>
                    <span className={cn('truncate text-xs font-medium', month.isCurrentMonth && 'font-bold text-zinc-900 dark:text-zinc-100')}>
                      {month.monthName}
                    </span>
                    {month.isCurrentMonth && (
                      <span className="ml-auto px-1.5 py-0.2 text-[9px] font-extrabold rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 group-data-[collapsible=icon]:hidden">
                        Current
                      </span>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>}
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
