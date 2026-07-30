'use client';

import * as React from 'react';
import {
  Users,
  User,
  Snowflake,
  Heart,
  Sprout,
  CloudRain,
  Sun,
  Flame,
  SunMedium,
  TreePalm,
  Leaf,
  Wind,
  Coffee,
  Gift,
  Sparkles,
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
import { usePathname } from 'next/navigation';

import logoIcon from '../../../public/logo.png';
import { useAppState } from '@/context/AppContext';
import { cn } from '@/lib/utils';

interface MONTH_META {
  monthId: string;
  monthName: string;
  monthIndex: number; // 0 to 11
  icon: React.ComponentType<{ className?: string }>;
  colorClass: string;
  bgClass: string;
}

const ALL_MONTHS: MONTH_META[] = [
  { monthId: 'january', monthName: 'January', monthIndex: 0, icon: Snowflake, colorClass: 'text-cyan-500', bgClass: 'bg-cyan-500/10' },
  { monthId: 'february', monthName: 'February', monthIndex: 1, icon: Heart, colorClass: 'text-rose-500', bgClass: 'bg-rose-500/10' },
  { monthId: 'march', monthName: 'March', monthIndex: 2, icon: Sprout, colorClass: 'text-emerald-500', bgClass: 'bg-emerald-500/10' },
  { monthId: 'april', monthName: 'April', monthIndex: 3, icon: CloudRain, colorClass: 'text-sky-500', bgClass: 'bg-sky-500/10' },
  { monthId: 'may', monthName: 'May', monthIndex: 4, icon: Sun, colorClass: 'text-amber-500', bgClass: 'bg-amber-500/10' },
  { monthId: 'june', monthName: 'June', monthIndex: 5, icon: Flame, colorClass: 'text-orange-500', bgClass: 'bg-orange-500/10' },
  { monthId: 'july', monthName: 'July', monthIndex: 6, icon: SunMedium, colorClass: 'text-teal-500', bgClass: 'bg-teal-500/10' },
  { monthId: 'august', monthName: 'August', monthIndex: 7, icon: TreePalm, colorClass: 'text-lime-500', bgClass: 'bg-lime-500/10' },
  { monthId: 'september', monthName: 'September', monthIndex: 8, icon: Leaf, colorClass: 'text-amber-600', bgClass: 'bg-amber-600/10' },
  { monthId: 'october', monthName: 'October', monthIndex: 9, icon: Wind, colorClass: 'text-purple-500', bgClass: 'bg-purple-500/10' },
  { monthId: 'november', monthName: 'November', monthIndex: 10, icon: Coffee, colorClass: 'text-indigo-500', bgClass: 'bg-indigo-500/10' },
  { monthId: 'december', monthName: 'December', monthIndex: 11, icon: Gift, colorClass: 'text-red-500', bgClass: 'bg-red-500/10' },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const ctx = useAppState();
  const pathname = usePathname();

  // Reorder months list dynamically so that the current RUNNING month is the FIRST item
  const orderedMonths = React.useMemo(() => {
    const currentMonthIndex = new Date().getMonth(); // 0 to 11
    const runningMonth = ALL_MONTHS.find((m) => m.monthIndex === currentMonthIndex) || ALL_MONTHS[0];
    const otherMonths = ALL_MONTHS.filter((m) => m.monthIndex !== currentMonthIndex);
    return [runningMonth, ...otherMonths];
  }, []);

  const currentMonthIndex = new Date().getMonth();

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

      {/* Content Body: Navigation Menu */}
      <SidebarContent className="custom-scrollbar space-y-1">
        {/* Navigation Group: Members & Profile */}
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

        {/* Dynamic Months Navigation Menu (Running Month First, Distinct Colorful Icons) */}
        <SidebarGroup>
          <SidebarMenu className="mt-1 space-y-0.5">
            {orderedMonths.map((month) => {
              const href = `/months/${month.monthId}`;
              const isActive = pathname === href || pathname?.startsWith(`${href}?`);
              const isRunningMonth = month.monthIndex === currentMonthIndex;
              const IconComp = month.icon;

              return (
                <SidebarMenuItem key={month.monthId}>
                  <SidebarMenuButton tooltip={month.monthName} isActive={isActive} render={<Link href={href} />}>
                    <div
                      className={cn(
                        'flex size-5 items-center justify-center rounded-md shrink-0 transition-transform group-hover/menu-button:scale-110',
                        month.bgClass
                      )}
                    >
                      <IconComp className={cn('size-3.5', month.colorClass)} />
                    </div>
                    <span className={cn('truncate text-xs font-medium', isRunningMonth && 'font-bold text-zinc-900 dark:text-zinc-100')}>
                      {month.monthName}
                    </span>
                    {isRunningMonth && (
                      <span className="ml-auto px-1.5 py-0.2 text-[9px] font-extrabold rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 group-data-[collapsible=icon]:hidden">
                        Current
                      </span>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer: User Profile Card (Clickable to /profile) */}
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
