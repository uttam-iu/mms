import { AVAILABLE_YEARS, MONTH_LIST } from "@/lib/utils";
import { Filter } from "lucide-react";
import { Button } from '@/components/ui/button';
import React from "react";
import { useRouter, useSearchParams } from "next/navigation";

export const MonthFilter = () => {
    const searchParams = useSearchParams();
    const router = useRouter();


    // Search parameters or default
    const paramYear = searchParams.get('year');
    const paramMonth = searchParams.get('month');

    // Filter local state
    const [selectedYear, setSelectedYear] = React.useState<number>(
        paramYear ? parseInt(paramYear, 10) : 2026
    );
    const [selectedMonth, setSelectedMonth] = React.useState<string>(
        paramMonth || 'january'
    );

    // Sync state if URL changes
    React.useEffect(() => {
        if (paramYear) {
            setSelectedYear(parseInt(paramYear, 10));
        }
        if (paramMonth) {
            setSelectedMonth(paramMonth);
        }
    }, [paramYear, paramMonth]);


    // Handle Filter Perform Action
    const handleApplyFilter = () => {
        const query = new URLSearchParams({
            year: selectedYear.toString(),
            month: selectedMonth.toLowerCase(),
        }).toString();

        router.push(`/months?${query}`);
    };

    return (
        <div className="flex items-center gap-2.5 flex-wrap w-full md:w-auto bg-zinc-100/80 dark:bg-zinc-800/60 p-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700/60">
            {/* Mandatory Year Dropdown */}
            <div className="flex items-center gap-1.5">
                <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="h-8 text-xs font-semibold rounded-lg bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 px-2 text-zinc-800 dark:text-zinc-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500 cursor-pointer"
                >
                    {AVAILABLE_YEARS.map((yr) => (
                        <option key={yr} value={yr}>
                            {yr}
                        </option>
                    ))}
                </select>
            </div>

            {/* Mandatory Month Dropdown */}
            <div className="flex items-center gap-1.5">
                <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="h-8 text-xs font-semibold rounded-lg bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 px-2 text-zinc-800 dark:text-zinc-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500 cursor-pointer"
                >
                    {MONTH_LIST.map((m) => (
                        <option key={m.value} value={m.value}>
                            {m.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* Filter Perform Button */}
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