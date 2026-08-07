import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Filter, Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import React from "react";

export const MemberFilter = () => {
    const searchParams = useSearchParams();
    const router = useRouter();

    const paramSearch = searchParams.get('search') || '';
    const paramStatus = searchParams.get('status') || 'all';

    const [searchInput, setSearchInput] = React.useState('');
    const [statusSelect, setStatusSelect] = React.useState<'all' | 'active' | 'inactive'>(
        ['all', 'active', 'inactive'].includes(paramStatus) ? (paramStatus as any) : 'all'
    );

    React.useEffect(() => {
        setSearchInput(paramSearch);
        if (['all', 'active', 'inactive'].includes(paramStatus)) {
            setStatusSelect(paramStatus as any);
        }
    }, [paramSearch, paramStatus]);

    const handleApplyFilter = () => {
        const params = new URLSearchParams();
        if (searchInput.trim()) params.set('search', searchInput.trim());
        if (statusSelect && statusSelect !== 'all') params.set('status', statusSelect);

        const queryString = params.toString();
        router.push(`/members${queryString ? `?${queryString}` : ''}`);
    };

    return <div className="bg-white dark:bg-zinc-900 rounded-xl p-2 border border-zinc-200/80 dark:border-zinc-800 shadow-2xs">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-wrap w-full md:w-auto">

                <div className="relative w-full md:w-80">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <Input
                        placeholder="Search by name, phone, email..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleApplyFilter();
                        }}
                        className="pl-9 h-9 text-xs bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800"
                    />
                </div>

                <div className="flex items-center gap-1.5">
                    <select
                        value={statusSelect}
                        onChange={(e) => setStatusSelect(e.target.value as any)}
                        className="h-9 text-xs font-semibold rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-3 text-zinc-800 dark:text-zinc-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500 cursor-pointer"
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active Members</option>
                        <option value="inactive">Inactive Members</option>
                    </select>
                </div>
            </div>

            <Button
                onClick={handleApplyFilter}
                size="sm"
                className="h-9 text-xs font-semibold bg-teal-700 hover:bg-teal-800 text-white px-4 shadow-xs cursor-pointer flex items-center gap-1.5 rounded-lg w-full md:w-auto justify-center"
            >
                <Filter size={14} /> Filter
            </Button>
        </div>
    </div>
}