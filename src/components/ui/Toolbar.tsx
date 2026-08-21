'use client'

import React from 'react';
import { LogOutIcon, User } from 'lucide-react';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from './dropdown-menu';
import { Button } from './button';
import { useAppState } from '@/context/AppContext';
import Dummy_Users from "@/dummyData/users.json";
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import Link from 'next/link';
import { disconnectSocket } from '@/lib/socket';
import { useRouter } from 'next/navigation';
import { removeDataFromLocalStorage } from '@/lib/localStorageHelper';

export default function Toolbar({
	children,
	showLogoutBtn = true
}: Readonly<{
	children?: React.ReactNode;
	showLogoutBtn?: boolean;
}>) {
	const ctx = useAppState();
	const router = useRouter();

	React.useEffect(() => {
		if (typeof window === 'undefined') return;
		if (window.location.pathname === '/login') return;

		const cookies = new URLSearchParams(document.cookie.replaceAll('; ', '&'));
		const userId = cookies?.get('user') || '';
		const userIndb = Dummy_Users?.find(ec => ec?.userId?.toString() === userId?.toString()) || null;

		if (userId && userIndb) {
			ctx?.setUser?.(userIndb);
			return;
		}

		if (!ctx?.state?.user) {
			router.replace('/login');
		}
	}, [ctx?.state?.user, router]);

	const onLogout = async () => {
		try {
			const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, '')}/user/logout`, {
				method: 'POST',
				credentials: 'include'
			});

			const data = await res.json();

			if (data?.success) {
				disconnectSocket();
				ctx?.resetContext();
				removeDataFromLocalStorage('user');
				window.location.href = "/login";
			}
		} catch (error) {
			console.error("Logout failed:", error);
		}

	};

	return (
		<div className="w-full h-[48px] bg-white dark:bg-zinc-950 sticky top-0 z-20 border-b border-zinc-200 dark:border-zinc-800 pl-2 flex justify-between items-center">
			<div className="flex items-center gap-3">
				{children}
				<div className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
					{ctx?.state?.title || ''}
				</div>
			</div>
			{showLogoutBtn && <div className="flex items-center gap-3">
				<DropdownMenu>
					<DropdownMenuTrigger className="cursor-pointer" render={<Button style={{ background: 'transparent' }} />}>
						<Avatar className="h-8 w-8 rounded-lg cursor-pointer">
							<AvatarImage src={ctx?.state?.user?.photoUrl || ''} alt={ctx?.state?.user?.fullName || 'User'} />
							<AvatarFallback className="rounded-lg bg-zinc-200 dark:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
								{ctx?.state?.user?.fullName?.[0] || 'U'}
							</AvatarFallback>
						</Avatar>
					</DropdownMenuTrigger>
					<DropdownMenuContent className="w-48">
						<DropdownMenuGroup>
							<DropdownMenuLabel className="font-semibold text-xs text-zinc-800 dark:text-zinc-200">
								{ctx?.state?.user?.fullName || 'User Account'}
							</DropdownMenuLabel>
							<DropdownMenuItem className="cursor-pointer text-xs">
								<Link className='flex w-full' href={'/profile'}><User className="h-4 w-4 mr-2 text-zinc-500" /> Profile</Link>
							</DropdownMenuItem>
							<DropdownMenuItem onClick={onLogout} className="cursor-pointer text-xs text-rose-600 focus:text-rose-600 dark:text-rose-400">
								<LogOutIcon className="h-4 w-4 mr-2 text-rose-500" /> Log Out
							</DropdownMenuItem>
						</DropdownMenuGroup>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>}
		</div>
	);
}
