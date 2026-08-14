/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { generateMonthlyMealData } from '@/dummyData/mealData';
import { ExtraExpense, MonthlyMealData } from '@/types/meal.types';
import { useTitle } from '@/hooks/useTitle';
import { SummaryFilter } from '../../components/SummaryFilter';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';
import { ExtraExpenseTable } from './ExtraExpenseTable';
import { ExtraExpenseDialog } from './ExtraExpenseDialog';
import { useSocket } from '@/hooks/useSocket';

export default function FixedCostPage() {
    const searchParams = useSearchParams();

    const paramYear = searchParams.get('year');
    const paramMonth = searchParams.get('month');

    const { data: monthwiseFixedCost, isLoading, refetch } = useSocket<{ data: { fixedCosts: ExtraExpense[], activeMembers: number } }>('emit', 'fixed_utility_cost', {
        month: paramMonth,
        year: paramYear,
    });


    const [dialogProps, setDialogProps] = useState<{ type: 'ADD' | 'EDIT' | 'DELETE', row: ExtraExpense | null } | null>(null);

    const getTitle = useCallback(() => {
        const month = searchParams?.get('month') || '';
        const year = searchParams?.get('year') || '';
        return `Fixed Utilities (${month.charAt(0).toUpperCase() + month.slice(1)} ${year})`;
    }, [searchParams]);

    useTitle(getTitle());

    return (
        <div className="w-full min-w-0 bg-zinc-50/60 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans pb-6">
            <div className="sticky top-[-8px] z-20 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-2 py-2 shadow-xs w-full min-w-0">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-end gap-3 w-full min-w-0">
                    <SummaryFilter pathName={'fixed-utilities'} />
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-2 pt-2 space-y-6 w-full min-w-0">
                <ExtraExpenseTable
                    monthwiseFixedCostData={monthwiseFixedCost?.data?.fixedCosts || []}
                    isLoading={isLoading}
                    totalActiveMember={monthwiseFixedCost?.data?.activeMembers || 1}
                    onAddNew={() => setDialogProps({ type: 'ADD', row: null })}
                    onUpdate={(row) => setDialogProps({ type: 'EDIT', row })}
                    onDelete={(row) => setDialogProps({ type: 'DELETE', row })}
                />
            </div>
            {dialogProps?.type === 'DELETE' && <DeleteConfirmDialog
                onCancel={() => setDialogProps(null)}
                refetch={refetch}
                title={'Confirmirmation'}
                emitKey='delete_utility_cost'
                payload={{ id: dialogProps?.row?.billId || '' }}
                body={
                    <div>
                        <div className='flex gap-1'>
                            <div className='text-sm w-[100px]'>Bill Title</div>
                            <div className='text-sm text-muted-foreground'> : {dialogProps?.row?.billTitle}</div>
                        </div>
                        <div className='flex  gap-1'>
                            <div className='text-sm w-[100px]'>Category</div>
                            <div className='text-sm text-muted-foreground'> : {dialogProps?.row?.category}</div>
                        </div>
                        <div className='flex gap-1'>
                            <div className='text-sm w-[100px]'>Amount</div>
                            <div className='text-sm text-muted-foreground'> : {dialogProps?.row?.amount}</div>
                        </div>
                        <div className='flex gap-1'>
                            <div className='text-sm w-[100px]'>Description</div>
                            <div className='text-sm text-muted-foreground'> : {dialogProps?.row?.description}</div>
                        </div>
                    </div>
                }
                description={`This action will immediately recalculate all monthly totals. Are you sure you want to delete this item?`}
            />}

            {(dialogProps?.type === 'EDIT' || dialogProps?.type === 'ADD') && <ExtraExpenseDialog
                onCancel={() => setDialogProps(null)}
                row={dialogProps?.row}
                type={dialogProps?.type}
                refetch={refetch}
                year={paramYear || ''}
                month={paramMonth || ''}
            />}

        </div>
    );
}
