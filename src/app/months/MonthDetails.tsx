/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { generateMonthlyMealData } from '@/dummyData/mealData';
import { MonthlyMealData, BazarExpense, MemberDeposit, ExtraExpense, DailyMealEntry } from '@/types/meal.types';
import { MonthFilter } from './MonthFilter';
import { SummaryCard } from './SummaryCard';
import { TotalCostDialog } from './TotalCostDialog';
import { TotalMealDialog } from './TotalMealDialog';
import { CuttentMealRateDialog } from './CuttentMealRateDialog';
import { TotalExtraCostDialog } from './TotalExtraCostDialog';
import { BazarCostDialog } from './BazarCostDialog';
import { NetBalanceDialog } from './NetBalanceDialog';
import { AddBazarExpenceDialog } from './AddBazarExpenceDialog';
import { DepositRecordDialog } from './DepositRecordDialog';
import { SummaryTabs, TabKey } from './SummaryTabs';
import { PersonwiseSummaryTable } from './PersonwiseSummaryTable';
import { DatewiseSummaryTable } from './DatewiseSummaryTable';
import { BazarwiseExpenseSummaryTable } from './BazarExpenseSumaryTable';
import { ExtraExpenseTable } from './ExtraExpenseTable';
import { ExtraExpenseDialog } from './ExtraExpenseDialog';
import { MealEntryDialog } from './MealEntryDialog';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import { useTitle } from '@/hooks/useTitle';

export default function MonthDetailPage() {
    const searchParams = useSearchParams();

    const paramYear = searchParams.get('year') || 2026;
    const paramMonth = searchParams.get('month') || 'january';
    const paramTab = (searchParams.get('tab') as TabKey) || 'personwise';

    const [mealData, setMealData] = useState<MonthlyMealData>(() =>
        generateMonthlyMealData(Number(paramYear), paramMonth)
    );

    useEffect(() => {
        setMealData(generateMonthlyMealData(Number(paramYear), paramMonth));
    }, [paramYear, paramMonth]);

    const [activeTab, setActiveTab] = useState<TabKey>(paramTab);

    useEffect(() => {
        if (paramTab && ['datewise', 'personwise', 'bazar', 'extra'].includes(paramTab)) {
            setActiveTab(paramTab);
        }
    }, [paramTab]);

    const [activeCardDialog, setActiveCardDialog] = useState<
        'totalCost' | 'totalMeal' | 'mealRate' | 'totalExtra' | 'bazarCost' | 'deposits' | 'netBalance' | null
    >(null);

    // Dialog state management
    const [isAddBazarOpen, setIsAddBazarOpen] = useState(false);
    const [editingBazar, setEditingBazar] = useState<BazarExpense | null>(null);

    const [isAddDepositOpen, setIsAddDepositOpen] = useState(false);

    const [isAddMealOpen, setIsAddMealOpen] = useState(false);
    const [editingMealEntry, setEditingMealEntry] = useState<DailyMealEntry | null>(null);

    const [isAddExtraOpen, setIsAddExtraOpen] = useState(false);
    const [editingExtra, setEditingExtra] = useState<ExtraExpense | null>(null);

    // Delete confirmation state
    const [deleteTarget, setDeleteTarget] = useState<{
        type: 'bazar' | 'extra' | 'meal';
        idOrDate: string;
        title?: string;
    } | null>(null);

    // Re-calculate helper function
    const recalculateTotals = (
        bazarExpenses: BazarExpense[],
        extraExpenses: ExtraExpense[],
        dailyMeals: DailyMealEntry[],
        activeMembers: MonthlyMealData['activeMembers']
    ) => {
        const totalBazarCost = bazarExpenses.reduce((sum, item) => sum + item.amount, 0);
        const totalExtraCost = extraExpenses.reduce((sum, item) => sum + item.amount, 0);

        // Recalculate member total meals from daily meals
        const memberMealsMap: { [userId: number]: number } = {};
        let totalMealsCount = 0;

        dailyMeals.forEach((daily) => {
            Object.entries(daily.memberMeals).forEach(([uIdStr, mMeal]) => {
                const uId = Number(uIdStr);
                memberMealsMap[uId] = (memberMealsMap[uId] || 0) + mMeal.total;
            });
        });

        activeMembers.forEach((m) => {
            if (memberMealsMap[m.userId] !== undefined) {
                totalMealsCount += memberMealsMap[m.userId];
            } else {
                totalMealsCount += m.totalMeals;
            }
        });

        const mealRate = totalMealsCount > 0 ? Number((totalBazarCost / totalMealsCount).toFixed(2)) : 0;
        const totalGrossCost = totalBazarCost + totalExtraCost;
        const extraSharePerHead = activeMembers.length > 0 ? Number((totalExtraCost / activeMembers.length).toFixed(2)) : 0;

        const updatedMembers = activeMembers.map((m) => {
            const memberTotalMeals = memberMealsMap[m.userId] !== undefined ? memberMealsMap[m.userId] : m.totalMeals;
            const mealCost = Number((memberTotalMeals * mealRate).toFixed(2));
            const grossCost = Number((mealCost + extraSharePerHead).toFixed(2));
            const net = Number((m.totalDeposit - grossCost).toFixed(2));

            let status: 'paid' | 'due' | 'excess' = 'paid';
            if (net < -10) status = 'due';
            else if (net > 10) status = 'excess';

            return {
                ...m,
                totalMeals: memberTotalMeals,
                mealCost,
                extraShare: extraSharePerHead,
                grossTotalCost: grossCost,
                netBalance: net,
                status,
            };
        });

        const totalDeposits = updatedMembers.reduce((sum, m) => sum + m.totalDeposit, 0);

        return {
            totalBazarCost,
            totalExtraCost,
            totalMeals: totalMealsCount,
            mealRate,
            totalGrossCost,
            totalDeposits,
            netBalance: totalDeposits - totalGrossCost,
            activeMembers: updatedMembers,
        };
    };

    // --- BAZAR HANDLERS ---
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

        setMealData((prev) => {
            let updatedBazar: BazarExpense[];
            if (editingId) {
                updatedBazar = prev.bazarExpenses.map((exp) =>
                    exp.id === editingId
                        ? {
                            ...exp,
                            shopperUserId: Number(bazarForm.shopperUserId),
                            shopperName: shopper?.fullName || exp.shopperName,
                            shopperPhoto: shopper?.photoUrl || exp.shopperPhoto,
                            itemsDescription: bazarForm.itemsDescription,
                            amount: amountNum,
                            category: bazarForm.category,
                            receiptNote: bazarForm.receiptNote || '',
                        }
                        : exp
                );
            } else {
                const newExpense: BazarExpense = {
                    id: `bazar-new-${Date.now()}`,
                    date: new Date().toISOString().split('T')[0],
                    shopperUserId: Number(bazarForm.shopperUserId),
                    shopperName: shopper?.fullName || 'User',
                    shopperPhoto: shopper?.photoUrl || 'https://github.com/shadcn.png',
                    itemsDescription: bazarForm.itemsDescription,
                    amount: amountNum,
                    category: bazarForm.category,
                    receiptNote: bazarForm.receiptNote || '',
                };
                updatedBazar = [newExpense, ...prev.bazarExpenses];
            }

            const recals = recalculateTotals(updatedBazar, prev.extraExpenses, prev.dailyMeals, prev.activeMembers);
            return {
                ...prev,
                bazarExpenses: updatedBazar,
                ...recals,
            };
        });

        setIsAddBazarOpen(false);
        setEditingBazar(null);
    };

    const handleDeleteBazar = (id: string) => {
        setMealData((prev) => {
            const updatedBazar = prev.bazarExpenses.filter((item) => item.id !== id);
            const recals = recalculateTotals(updatedBazar, prev.extraExpenses, prev.dailyMeals, prev.activeMembers);
            return {
                ...prev,
                bazarExpenses: updatedBazar,
                ...recals,
            };
        });
        setDeleteTarget(null);
    };

    // --- FIXED UTILITY (EXTRA EXPENSE) HANDLERS ---
    const handleSaveExtraSubmit = (expenseData: Omit<ExtraExpense, 'id'> & { id?: string }) => {
        setMealData((prev) => {
            let updatedExtra: ExtraExpense[];
            if (expenseData.id) {
                updatedExtra = prev.extraExpenses.map((item) =>
                    item.id === expenseData.id ? ({ ...item, ...expenseData } as ExtraExpense) : item
                );
            } else {
                const newExtra: ExtraExpense = {
                    ...expenseData,
                    id: `extra-new-${Date.now()}`,
                };
                updatedExtra = [...prev.extraExpenses, newExtra];
            }

            const recals = recalculateTotals(prev.bazarExpenses, updatedExtra, prev.dailyMeals, prev.activeMembers);
            return {
                ...prev,
                extraExpenses: updatedExtra,
                ...recals,
            };
        });
        setIsAddExtraOpen(false);
        setEditingExtra(null);
    };

    const handleDeleteExtra = (id: string) => {
        setMealData((prev) => {
            const updatedExtra = prev.extraExpenses.filter((item) => item.id !== id);
            const recals = recalculateTotals(prev.bazarExpenses, updatedExtra, prev.dailyMeals, prev.activeMembers);
            return {
                ...prev,
                extraExpenses: updatedExtra,
                ...recals,
            };
        });
        setDeleteTarget(null);
    };

    // --- DATE-WISE MEAL ENTRY HANDLERS ---
    const handleSaveMealEntrySubmit = (
        targetDate: string,
        memberMealsMap: { [userId: number]: { breakfast: number; lunch: number; dinner: number; total: number } }
    ) => {
        setMealData((prev) => {
            const dailyTotal = Object.values(memberMealsMap).reduce((sum, item) => sum + item.total, 0);

            const existingIndex = prev.dailyMeals.findIndex((d) => d.date === targetDate);
            let updatedDaily: DailyMealEntry[];

            if (existingIndex >= 0) {
                updatedDaily = [...prev.dailyMeals];
                updatedDaily[existingIndex] = {
                    ...updatedDaily[existingIndex],
                    memberMeals: memberMealsMap,
                    dailyTotalMeals: dailyTotal,
                };
            } else {
                const dateObj = new Date(targetDate);
                const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                const dayNumber = dateObj.getDate();
                const newEntry: DailyMealEntry = {
                    date: targetDate,
                    dayNumber,
                    dayName,
                    memberMeals: memberMealsMap,
                    dailyTotalMeals: dailyTotal,
                };
                updatedDaily = [...prev.dailyMeals, newEntry].sort((a, b) => a.date.localeCompare(b.date));
            }

            const recals = recalculateTotals(prev.bazarExpenses, prev.extraExpenses, updatedDaily, prev.activeMembers);
            return {
                ...prev,
                dailyMeals: updatedDaily,
                ...recals,
            };
        });
        setIsAddMealOpen(false);
        setEditingMealEntry(null);
    };

    const handleDeleteMealEntry = (targetDate: string) => {
        setMealData((prev) => {
            const updatedDaily = prev.dailyMeals.filter((d) => d.date !== targetDate);
            const recals = recalculateTotals(prev.bazarExpenses, prev.extraExpenses, updatedDaily, prev.activeMembers);
            return {
                ...prev,
                dailyMeals: updatedDaily,
                ...recals,
            };
        });
        setDeleteTarget(null);
    };

    // Handle Quick Add Deposit
    const handleAddDepositSubmit = (e: React.FormEvent, newDeposit: { amount: string | number; userId: string | number; paymentMethod?: 'bKash' | 'Nagad' | 'Cash' | 'Bank Transfer'; note?: string }) => {
        e.preventDefault();
        if (!newDeposit.amount) return;

        const amountNum = typeof newDeposit.amount === 'string' ? parseFloat(newDeposit.amount) : newDeposit.amount;
        if (isNaN(amountNum) || amountNum <= 0) return;

        const member = mealData.activeMembers.find((m) => m.userId === Number(newDeposit.userId));

        const newDep: MemberDeposit = {
            id: `dep-new-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            userId: Number(newDeposit.userId),
            userName: member?.fullName || 'User',
            amount: amountNum,
            paymentMethod: newDeposit.paymentMethod || 'Cash',
            note: newDeposit.note || 'Manual Deposit',
        };

        setMealData((prev) => {
            const updatedDeposits = [newDep, ...prev.deposits];
            const newTotalDeposits = prev.totalDeposits + amountNum;

            const updatedMembers = prev.activeMembers.map((m) => {
                if (m.userId === Number(newDeposit.userId)) {
                    const newDepTotal = m.totalDeposit + amountNum;
                    const net = Number((newDepTotal - m.grossTotalCost).toFixed(2));
                    let status: 'paid' | 'due' | 'excess' = 'paid';
                    if (net < -10) status = 'due';
                    else if (net > 10) status = 'excess';
                    return {
                        ...m,
                        totalDeposit: newDepTotal,
                        netBalance: net,
                        status,
                    };
                }
                return m;
            });

            return {
                ...prev,
                deposits: updatedDeposits,
                totalDeposits: newTotalDeposits,
                netBalance: newTotalDeposits - prev.totalGrossCost,
                activeMembers: updatedMembers,
            };
        });

        setIsAddDepositOpen(false);
    };

    const getTitle = useCallback(() => {
        const month = searchParams?.get('month') || '';
        const year = searchParams?.get('year') || '';
        return `Monthly Summary (${month.charAt(0).toUpperCase() + month.slice(1)} ${year})`;
    }, [searchParams]);

    useTitle(getTitle());

    return (
        <div className="min-h-screen w-full min-w-0 bg-zinc-50/60 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans pb-12">
            <div className="sticky top-[-8px] z-20 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-2 py-2 shadow-xs w-full min-w-0">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-end gap-3 w-full min-w-0">
                    <MonthFilter />
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 pt-6 space-y-6 w-full min-w-0">
                <div>
                    <SummaryCard mealData={mealData} setActiveCardDialog={setActiveCardDialog} />
                </div>

                <div className="space-y-4">
                    <SummaryTabs setActiveTab={setActiveTab} mealData={mealData} activeTab={activeTab} />

                    {activeTab === 'personwise' && (
                        <PersonwiseSummaryTable mealData={mealData} />
                    )}

                    {activeTab === 'datewise' && (
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
                    )}

                    {activeTab === 'bazar' && (
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
                    )}

                    {activeTab === 'extra' && (
                        <ExtraExpenseTable
                            mealData={mealData}
                            setIsAddExtraOpen={() => {
                                setEditingExtra(null);
                                setIsAddExtraOpen(true);
                            }}
                            onEditExtra={(item) => {
                                setEditingExtra(item);
                                setIsAddExtraOpen(true);
                            }}
                            onDeleteExtra={(itemId) => {
                                const item = mealData.extraExpenses.find((e) => e.id === itemId);
                                setDeleteTarget({
                                    type: 'extra',
                                    idOrDate: itemId,
                                    title: `Delete Utility Bill (${item?.title || 'Bill'})`,
                                });
                            }}
                        />
                    )}
                </div>
            </div>

            {/* Dialogs */}
            <TotalCostDialog mealData={mealData} isOpen={activeCardDialog === 'totalCost'} onCancel={() => setActiveCardDialog(null)} />
            <TotalMealDialog mealData={mealData} isOpen={activeCardDialog === 'totalMeal'} onCancel={() => setActiveCardDialog(null)} />
            <CuttentMealRateDialog mealData={mealData} isOpen={activeCardDialog === 'mealRate'} onCancel={() => setActiveCardDialog(null)} />
            <TotalExtraCostDialog mealData={mealData} isOpen={activeCardDialog === 'totalExtra'} onCancel={() => setActiveCardDialog(null)} />
            <BazarCostDialog mealData={mealData} isOpen={activeCardDialog === 'bazarCost'} onCancel={() => setActiveCardDialog(null)} />
            <NetBalanceDialog mealData={mealData} isOpen={activeCardDialog === 'netBalance'} onCancel={() => setActiveCardDialog(null)} />

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

            <DepositRecordDialog
                isAddDepositOpen={isAddDepositOpen}
                setIsAddDepositOpen={setIsAddDepositOpen}
                mealData={mealData}
                handleAddDepositSubmit={handleAddDepositSubmit}
            />

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

            <ExtraExpenseDialog
                isOpen={isAddExtraOpen}
                onClose={() => {
                    setIsAddExtraOpen(false);
                    setEditingExtra(null);
                }}
                onSubmit={handleSaveExtraSubmit}
                editingExpense={editingExtra}
            />

            {/* Reusable Delete Dialog */}
            <DeleteConfirmDialog
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={() => {
                    if (!deleteTarget) return;
                    if (deleteTarget.type === 'bazar') {
                        handleDeleteBazar(deleteTarget.idOrDate);
                    } else if (deleteTarget.type === 'extra') {
                        handleDeleteExtra(deleteTarget.idOrDate);
                    } else if (deleteTarget.type === 'meal') {
                        handleDeleteMealEntry(deleteTarget.idOrDate);
                    }
                }}
                title={deleteTarget?.title || 'Confirm Deletion'}
                description="Are you sure you want to delete this item? This action will immediately recalculate all monthly totals and member balances."
            />
        </div>
    );
}
