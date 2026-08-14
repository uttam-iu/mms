/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { generateMonthlyMealData } from '@/dummyData/mealData';
import { BazarExpense, MonthlyMealData } from '@/types/meal.types';
import { useTitle } from '@/hooks/useTitle';
import { SummaryFilter } from '../../components/SummaryFilter';
import { BazarwiseExpenseSummaryTable } from './BazarExpenseSumaryTable';
import { AddBazarExpenceDialog } from './AddBazarExpenceDialog';

export default function MonthDetailPage() {
    const searchParams = useSearchParams();

    const paramYear = searchParams.get('year') || 2026;
    const paramMonth = searchParams.get('month') || 'january';
    const [mealData, setMealData] = useState<MonthlyMealData>(() =>
        generateMonthlyMealData(Number(paramYear), paramMonth)
    );
    const [isAddBazarOpen, setIsAddBazarOpen] = useState(false);
    const [editingBazar, setEditingBazar] = useState<BazarExpense | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<{
        type: 'bazar' | 'extra' | 'meal';
        idOrDate: string;
        title?: string;
    } | null>(null);

    useEffect(() => {
        setMealData(generateMonthlyMealData(Number(paramYear), paramMonth));
    }, [paramYear, paramMonth]);

    const handleDeleteBazar = (targetDate: string) => {
        console.log('df')
        setDeleteTarget(null);
    };

    const handleAddOrEditBazarSubmit = (
        e: React.FormEvent,
        bazarForm: any,
        editingId?: string
    ) => {
        e.preventDefault();
        if (!bazarForm.itemsDescription || !bazarForm.amount) return;

        const amountNum = parseFloat(String(bazarForm.amount));
        if (isNaN(amountNum) || amountNum <= 0) return;

        const shopper = mealData.activeMembers.find((m) => m.userId === Number(bazarForm.shopperUserId));

        setIsAddBazarOpen(false);
        setEditingBazar(null);
    };


    const getTitle = useCallback(() => {
        const month = searchParams?.get('month') || '';
        const year = searchParams?.get('year') || '';
        return `Bazar Expenses (${month.charAt(0).toUpperCase() + month.slice(1)} ${year})`;
    }, [searchParams]);

    useTitle(getTitle());

    return (
        <div className="min-h-screen w-full min-w-0 bg-zinc-50/60 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans pb-12">
            <div className="sticky top-[-8px] z-20 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-2 py-2 shadow-xs w-full min-w-0">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-end gap-3 w-full min-w-0">
                    <SummaryFilter pathName={'bazar-expenses'} />
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-2 pt-2 space-y-6 w-full min-w-0">
                <BazarwiseExpenseSummaryTable
                    mealData={mealData}
                    setIsAddBazarOpen={() => {
                        setEditingBazar(null);
                        setIsAddBazarOpen(true);
                    }}
                    onEditBazar={(expense) => {
                        setEditingBazar(expense);
                        setIsAddBazarOpen(true);
                    }}
                    onDeleteBazar={(expenseId) => {
                        const exp = mealData.bazarExpenses.find((b) => b.id === expenseId);
                        setDeleteTarget({
                            type: 'bazar',
                            idOrDate: expenseId,
                            title: `Delete Bazar Expense (${exp?.itemsDescription || 'Item'})`,
                        });
                    }}
                />
            </div>
            {/* <DeleteConfirmDialog
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={() => {
                    if (!deleteTarget) return;
                    handleDeleteBazar(deleteTarget.idOrDate);

                }}
                title={deleteTarget?.title || 'Confirm Deletion'}
                description="Are you sure you want to delete this item? This action will immediately recalculate all monthly totals and member balances."
            /> */}

            <AddBazarExpenceDialog
                isAddBazarOpen={isAddBazarOpen}
                setIsAddBazarOpen={(open) => {
                    setIsAddBazarOpen(open);
                    if (!open) setEditingBazar(null);
                }}
                mealData={mealData}
                handleAddBazarSubmit={handleAddOrEditBazarSubmit}
                editingBazar={editingBazar}
            />

        </div>
    );
}
