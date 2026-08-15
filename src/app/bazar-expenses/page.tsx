/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { BazarExpense } from '@/types/meal.types';
import { useTitle } from '@/hooks/useTitle';
import { SummaryFilter } from '../../components/SummaryFilter';
import { BazarwiseExpenseSummaryTable } from './BazarExpenseSumaryTable';
import { AddBazarExpenceDialog } from './AddBazarExpenceDialog';
import { useSocket } from '@/hooks/useSocket';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';
import { displayFormattedDate, initcap } from '@/lib/utils';

interface BazarExpenseResp {
    bazarExpenses: BazarExpense[],
    totalMealNumber: number,
    activeMemberMeta: { label: string, value: string }[] | []
}

export default function MonthDetailPage() {
    const searchParams = useSearchParams();
    const year = searchParams.get('year');
    const month = searchParams.get('month');
    const [dialogProps, setDialogProps] = useState<{ type: 'ADD' | 'EDIT' | 'DELETE', row: BazarExpense | null } | null>(null);

    const { data: bazarExpensesResp, isLoading, refetch } = useSocket<{ data: BazarExpenseResp }>('emit', 'bazar_expenses', {
        month,
        year,
    });

    const getTitle = useCallback(() => {
        return `Bazar Expenses (${initcap(month || '')} ${year})`;
    }, [month, year]);

    useTitle(getTitle());

    return (
        <div className="w-full min-w-0 bg-zinc-50/60 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans pb-6">
            <div className="sticky top-[-8px] z-20 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-2 py-2 shadow-xs w-full min-w-0">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-end gap-3 w-full min-w-0">
                    <SummaryFilter pathName={'bazar-expenses'} />
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-2 pt-2 space-y-6 w-full min-w-0">
                <BazarwiseExpenseSummaryTable
                    bazarExpenses={bazarExpensesResp?.data?.bazarExpenses || []}
                    isLoading={isLoading}
                    totalMealNumber={bazarExpensesResp?.data?.totalMealNumber || 1}
                    onAddNew={() => setDialogProps({ type: 'ADD', row: null })}
                    onUpdate={(row) => setDialogProps({ type: 'EDIT', row })}
                    onDelete={(row) => setDialogProps({ type: 'DELETE', row })}
                />
            </div>
            {dialogProps?.type === 'DELETE' && <DeleteConfirmDialog
                onCancel={() => setDialogProps(null)}
                refetch={refetch}
                title={'Confirmirmation'}
                emitKey='delete_bazar_expense'
                payload={{ id: dialogProps?.row?.bazarId || '' }}
                body={
                    <div>
                        <div className='flex gap-1'>
                            <div className='text-sm w-[100px]'>Date</div>
                            <div className='text-sm text-muted-foreground'> : {`${displayFormattedDate(dialogProps?.row?.date || '')}`}</div>
                        </div>
                        <div className='flex  gap-1'>
                            <div className='text-sm w-[100px]'>Shopper</div>
                            <div className='text-sm text-muted-foreground'> : {dialogProps?.row?.shopper?.fullName}</div>
                        </div>
                        <div className='flex gap-1'>
                            <div className='text-sm w-[100px]'>Category</div>
                            <div className='text-sm text-muted-foreground'> : {dialogProps?.row?.category}</div>
                        </div>
                        <div className='flex gap-1'>
                            <div className='text-sm w-[100px]'>Amount</div>
                            <div className='text-sm text-muted-foreground'> : {dialogProps?.row?.amount}</div>
                        </div>
                        <div className='flex gap-1'>
                            <div className='text-sm w-[100px]'>Description</div>
                            <div className='text-sm text-muted-foreground'> : {dialogProps?.row?.itemsDescription}</div>
                        </div>
                    </div>
                }
                description={`This action will immediately recalculate all monthly totals. Are you sure you want to delete this item?`}
            />}

            {(dialogProps?.type === 'EDIT' || dialogProps?.type === 'ADD') && <AddBazarExpenceDialog
                onCancel={() => setDialogProps(null)}
                row={dialogProps?.row}
                type={dialogProps?.type}
                refetch={refetch}
                year={year || ''}
                month={month || ''}
                activeMemberMeta={bazarExpensesResp?.data?.activeMemberMeta || []}
            />}
        </div>
    );
}
