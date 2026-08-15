/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { MemberWiseSummary, MonthlyMealData } from '@/types/meal.types';
import { useTitle } from '@/hooks/useTitle';
import { SummaryFilter } from '../../components/SummaryFilter';
import { SummaryCard } from './SummaryCard';
import { TotalCostDialog } from './TotalCostDialog';
import { CuttentMealRateDialog } from './CuttentMealRateDialog';
import { TotalMealDialog } from './TotalMealDialog';
import { TotalExtraCostDialog } from './TotalExtraCostDialog';
import { BazarCostDialog } from './BazarCostDialog';
import { NetBalanceDialog } from './NetBalanceDialog';
import { PersonwiseSummaryTable } from './PersonwiseSummaryTable';
import { initcap } from '@/lib/utils';
import { useSocket } from '@/hooks/useSocket';

interface MonthlySummaryRespType {
    summary: MonthlyMealData;
    memberWiseSummary: MemberWiseSummary[] | [];
    month: string;
    year: string;
}

export default function MonthDetailPage() {
    const searchParams = useSearchParams();

    const year = searchParams.get('year');
    const month = searchParams.get('month') || '';

    const { data: monthlySummaryResp, isLoading, refetch } = useSocket<{ data: MonthlySummaryRespType }>('emit', 'monthly_summary', {
        month,
        year,
    });
    console.log(monthlySummaryResp)

    const [activeCardDialog, setActiveCardDialog] = useState<
        'totalCost' | 'totalMeal' | 'mealRate' | 'totalExtra' | 'bazarCost' | 'deposits' | 'netBalance' | null
    >(null);

    const getTitle = useCallback(() => {
        return `Monthly Summary (${initcap(month)} ${year})`;
    }, [searchParams]);

    useTitle(getTitle());

    return (
        <div className="w-full min-w-0 bg-zinc-50/60 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans pb-6">
            <div className="sticky top-[-8px] z-20 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-2 py-2 shadow-xs w-full min-w-0">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-end gap-3 w-full min-w-0">
                    <SummaryFilter pathName={'summary'} />
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-2 pt-2 space-y-6 w-full min-w-0">
                <div>
                    <SummaryCard isLoading={isLoading} summary={monthlySummaryResp?.data?.summary} setActiveCardDialog={setActiveCardDialog} />
                </div>
                <PersonwiseSummaryTable isLoading={isLoading} mealRate={monthlySummaryResp?.data?.summary?.mealRate || 0} memberWiseSummary={monthlySummaryResp?.data?.memberWiseSummary || []} />
            </div>

            {/* <TotalCostDialog mealData={mealData} isOpen={activeCardDialog === 'totalCost'} onCancel={() => setActiveCardDialog(null)} />
            <TotalMealDialog mealData={mealData} isOpen={activeCardDialog === 'totalMeal'} onCancel={() => setActiveCardDialog(null)} />
            <CuttentMealRateDialog mealData={mealData} isOpen={activeCardDialog === 'mealRate'} onCancel={() => setActiveCardDialog(null)} />
            <TotalExtraCostDialog mealData={mealData} isOpen={activeCardDialog === 'totalExtra'} onCancel={() => setActiveCardDialog(null)} />
            <BazarCostDialog mealData={mealData} isOpen={activeCardDialog === 'bazarCost'} onCancel={() => setActiveCardDialog(null)} />
            <NetBalanceDialog mealData={mealData} isOpen={activeCardDialog === 'netBalance'} onCancel={() => setActiveCardDialog(null)} /> */}

        </div>
    );
}
