"use client";

import { AVAILABLE_YEARS, MONTH_LIST } from "@/lib/utils";
import { Filter } from "lucide-react";
import { Button } from '@/components/ui/button';
import React from "react";
import { useRouter, useSearchParams } from "next/navigation";

export const MonthFilter = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [filterData, setFilterData] = React.useState({
        year: '',
        month: ''
    })

    React.useEffect(() => {
        setFilterData({
            year: searchParams.get('year') || new Date().getFullYear()?.toString(),
            month: searchParams.get('month') || MONTH_LIST[new Date().getMonth()]?.value
        })
    }, [searchParams]);

    const handleApplyFilter = () => {
        const query = new URLSearchParams({
            year: filterData.year.toString(),
            month: filterData.month.toLowerCase(),
        }).toString();

        router.push(`/months?${query}`);
    };

    return (
        <div className="flex items-center gap-2.5 flex-wrap w-full md:w-auto ">
            <div className="flex items-center gap-1.5">
                <select
                    value={filterData.year}
                    onChange={(e) => setFilterData({ ...filterData, year: e.target.value })}
                    className="h-8 text-xs font-semibold rounded-lg bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 px-2 text-zinc-800 dark:text-zinc-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500 cursor-pointer"
                >
                    {AVAILABLE_YEARS?.map((yr) => (
                        <option key={yr} value={yr}>
                            {yr}
                        </option>
                    ))}
                </select>
            </div>

            <div className="flex items-center gap-1.5">
                <select
                    value={filterData.month}
                    onChange={(e) => setFilterData({ ...filterData, month: e.target.value })}
                    className="h-8 text-xs font-semibold rounded-lg bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 px-2 text-zinc-800 dark:text-zinc-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500 cursor-pointer"
                >
                    {MONTH_LIST.map((m) => (
                        <option key={m.value} value={m.value}>
                            {m.label}
                        </option>
                    ))}
                </select>
            </div>

            <Button
                onClick={handleApplyFilter}
                size="sm"
                className="h-8 text-xs font-semibold bg-teal-700 hover:bg-teal-800 text-white px-3 shadow-xs cursor-pointer flex items-center gap-1.5 rounded-lg"
            >
                <Filter size={14} /> Filter
            </Button>
        </div>
    );
};