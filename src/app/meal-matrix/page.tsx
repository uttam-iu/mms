/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { DailyMealEntry } from '@/types/meal.types';
import { useTitle } from '@/hooks/useTitle';
import { SummaryFilter } from '../../components/SummaryFilter';
import { DatewiseSummaryTable } from './DatewiseSummaryTable';
import { useSocket } from '@/hooks/useSocket';
import { initcap } from '@/lib/utils';

interface DailyMealEntriesRespType {
    dailyMealEntries: DailyMealEntry[],
    memberMeta: { label: string, value: string }[] | []
}

export default function MonthDetailPage() {
    const searchParams = useSearchParams();

    const year = searchParams.get('year');
    const month = searchParams.get('month') || '';

    const { data: dailyMealEntriesResp, isLoading, refetch } = useSocket<{ data: DailyMealEntriesRespType }>('emit', 'meal_matrix', {
        month,
        year,
    });

    const getTitle = useCallback(() => {
        return `Meal Matrix (${initcap(month)} ${year})`;
    }, [month, year]);

    useTitle(getTitle());

    return (
        <div className="w-full min-w-0 bg-zinc-50/60 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans pb-6">
            <div className="sticky top-[-8px] z-20 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-2 py-2 shadow-xs w-full min-w-0">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-end gap-3 w-full min-w-0">
                    <SummaryFilter pathName={'meal-matrix'} />
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-2 pt-2 space-y-6 w-full min-w-0">
                <DatewiseSummaryTable
                    dailyMealEntries={dailyMealEntriesResp?.data?.dailyMealEntries || []}
                    isLoading={isLoading}
                    refetch={refetch}
                    memberMeta={dailyMealEntriesResp?.data?.memberMeta || []}
                />
            </div>
        </div>
    );
}
