/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { generateMonthlyMealData } from '@/dummyData/mealData';
import { DailyMealEntry, MonthlyMealData } from '@/types/meal.types';
import { useTitle } from '@/hooks/useTitle';
import { SummaryFilter } from '../../components/SummaryFilter';
import { DatewiseSummaryTable } from './DatewiseSummaryTable';
import { MealEntryDialog } from './MealEntryDialog';

export default function MonthDetailPage() {
    const searchParams = useSearchParams();

    const paramYear = searchParams.get('year') || 2026;
    const paramMonth = searchParams.get('month') || 'january';
    const [mealData, setMealData] = useState<MonthlyMealData>(() =>
        generateMonthlyMealData(Number(paramYear), paramMonth)
    );
    const [isAddMealOpen, setIsAddMealOpen] = useState(false);
    const [editingMealEntry, setEditingMealEntry] = useState<DailyMealEntry | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<{
        type: 'bazar' | 'extra' | 'meal';
        idOrDate: string;
        title?: string;
    } | null>(null);

    useEffect(() => {
        setMealData(generateMonthlyMealData(Number(paramYear), paramMonth));
    }, [paramYear, paramMonth]);

    const handleDeleteMealEntry = (targetDate: string) => {
        console.log('df')
        setDeleteTarget(null);
    };

    const handleSaveMealEntrySubmit = (
        targetDate: string,
        memberMealsMap: { [userId: number]: { breakfast: number; lunch: number; dinner: number; total: number } }
    ) => {
        console.log('fsf')
        setIsAddMealOpen(false);
        setEditingMealEntry(null);
    };


    const getTitle = useCallback(() => {
        const month = searchParams?.get('month') || '';
        const year = searchParams?.get('year') || '';
        return `Meal Matrix (${month.charAt(0).toUpperCase() + month.slice(1)} ${year})`;
    }, [searchParams]);

    useTitle(getTitle());

    return (
        <div className="min-h-screen w-full min-w-0 bg-zinc-50/60 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans pb-12">
            <div className="sticky top-[-8px] z-20 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-2 py-2 shadow-xs w-full min-w-0">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-end gap-3 w-full min-w-0">
                    <SummaryFilter pathName={'meal-matrix'} />
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-2 pt-2 space-y-6 w-full min-w-0">
                <DatewiseSummaryTable
                    mealData={mealData}
                    setIsAddMealOpen={() => {
                        setEditingMealEntry(null);
                        setIsAddMealOpen(true);
                    }}
                    onEditMeal={(entry) => {
                        setEditingMealEntry(entry);
                        setIsAddMealOpen(true);
                    }}
                    onDeleteMeal={(date) => {
                        setDeleteTarget({
                            type: 'meal',
                            idOrDate: date,
                            title: `Delete Meal Entry for ${date}`,
                        });
                    }}
                />
            </div>
            {/* <DeleteConfirmDialog
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={() => {
                    if (!deleteTarget) return;
                    handleDeleteMealEntry(deleteTarget.idOrDate);
                }}
                title={deleteTarget?.title || 'Confirm Deletion'}
                description="Are you sure you want to delete this item? This action will immediately recalculate all monthly totals and member balances."
            /> */}

            <MealEntryDialog
                isOpen={isAddMealOpen}
                onClose={() => {
                    setIsAddMealOpen(false);
                    setEditingMealEntry(null);
                }}
                onSubmit={handleSaveMealEntrySubmit}
                mealData={mealData}
                editingEntry={editingMealEntry}
            />

        </div>
    );
}
