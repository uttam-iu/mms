/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
    Plus,
    Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    generateMonthlyMealData,
} from '@/dummyData/mealData';
import { MonthlyMealData, BazarExpense, MemberDeposit } from '@/types/meal.types';
import { MonthFilter } from './MonthFilter';
import { SummaryCard } from './SummaryCard';
import { TotalCostDialog } from './TotalCostDialog';
import { TotalMealDialog } from './TotalMealDialog';
import { CuttentMealRateDialog } from './CuttentMealRateDialog';
import { TotalExtraCostDialog } from './TotalExtraCostDialog';
import { BazarCostDialog } from './BazarCostDialog';
import { DepositDialog } from './DepositDialog';
import { NetBalanceDialog } from './NetBalanceDialog';
import { AddBazarExpenceDialog } from './AddBazarExpenceDialog';
import { DepositRecordDialog } from './DepositRecordDialog';
import { SummaryTabs } from './SummaryTabs';
import { PersonwiseSummaryTable } from './PersonwiseSummaryTable';
import { DatewiseSummaryTable } from './DatewiseSummaryTable';
import { BazarwiseExpenseSummaryTable } from './BazarExpenseSumaryTable';
import { MemberDepositLogTable } from './MemberDepositLogTable';
import { ExtraExpenseTable } from './ExtraExpenseTable';
import { useTitle } from '@/hooks/useTitle';

export default function MonthDetailPage() {
    const searchParams = useSearchParams();

    const paramYear = searchParams.get('year') || 2026;
    const paramMonth = searchParams.get('month') || 'january';

    const [mealData, setMealData] = useState<MonthlyMealData>(() =>
        generateMonthlyMealData(Number(paramYear), paramMonth)
    );

    useEffect(() => {
        setMealData(generateMonthlyMealData(Number(paramYear), paramMonth));
    }, [paramYear, paramMonth]);

    const [activeTab, setActiveTab] = useState<'datewise' | 'personwise' | 'bazar' | 'deposits' | 'extra'>('personwise');

    const [activeCardDialog, setActiveCardDialog] = useState<
        'totalCost' | 'totalMeal' | 'mealRate' | 'totalExtra' | 'bazarCost' | 'deposits' | 'netBalance' | null
    >(null);

    const [isAddBazarOpen, setIsAddBazarOpen] = useState(false);

    const [isAddDepositOpen, setIsAddDepositOpen] = useState(false);


    const handleAddBazarSubmit = (e: React.FormEvent, newBazar: { itemsDescription: string; amount: string | number; shopperUserId: string | number; category: 'Groceries' | 'Vegetables' | 'Meat & Fish' | 'Spices & Cooking' | 'Others' }) => {
        e.preventDefault();
        if (!newBazar.itemsDescription || !newBazar.amount) return;

        const amountNum = parseFloat(String(newBazar.amount));
        if (isNaN(amountNum) || amountNum <= 0) return;

        const shopper = mealData.activeMembers.find((m) => m.userId === Number(newBazar.shopperUserId));

        const newExpense: BazarExpense = {
            id: `bazar-new-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            shopperUserId: Number(newBazar.shopperUserId),
            shopperName: shopper?.fullName || 'User',
            shopperPhoto: shopper?.photoUrl || 'https://github.com/shadcn.png',
            itemsDescription: newBazar.itemsDescription,
            amount: amountNum,
            category: newBazar.category,
            receiptNote: 'Newly added expense',
        };

        setMealData((prev) => {
            const updatedBazar = [newExpense, ...prev.bazarExpenses];
            const newTotalBazar = prev.totalBazarCost + amountNum;
            const newMealRate = prev.totalMeals > 0 ? Number((newTotalBazar / prev.totalMeals).toFixed(2)) : 0;
            const newGrossCost = newTotalBazar + prev.totalExtraCost;

            const updatedMembers = prev.activeMembers.map((m) => {
                const mealCost = Number((m.totalMeals * newMealRate).toFixed(2));
                const grossCost = Number((mealCost + m.extraShare).toFixed(2));
                const net = Number((m.totalDeposit - grossCost).toFixed(2));
                let status: 'paid' | 'due' | 'excess' = 'paid';
                if (net < -10) status = 'due';
                else if (net > 10) status = 'excess';

                return {
                    ...m,
                    mealCost,
                    grossTotalCost: grossCost,
                    netBalance: net,
                    status,
                };
            });

            return {
                ...prev,
                bazarExpenses: updatedBazar,
                totalBazarCost: newTotalBazar,
                mealRate: newMealRate,
                totalGrossCost: newGrossCost,
                netBalance: prev.totalDeposits - newGrossCost,
                activeMembers: updatedMembers,
            };
        });


        setIsAddBazarOpen(false);
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

    useTitle('Monthly Summary');

    return (
        <div className="min-h-screen w-full min-w-0 bg-zinc-50/60 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans pb-12">
            <div className="sticky top-[-8px] z-20 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-2 py-2 shadow-xs w-full min-w-0">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-end gap-3 w-full min-w-0">
                    <MonthFilter />
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 pt-6 space-y-6 w-full min-w-0">
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                            <Sparkles size={14} className="text-amber-500" /> Monthly Summary
                        </h2>
                        <div className="flex items-center gap-2">
                            <Button
                                onClick={() => setIsAddBazarOpen(true)}
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs font-medium cursor-pointer border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950"
                            >
                                <Plus size={13} className="mr-1" /> Add Bazar Expense
                            </Button>
                            <Button
                                onClick={() => setIsAddDepositOpen(true)}
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs font-medium cursor-pointer border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950"
                            >
                                <Plus size={13} className="mr-1" /> Record Deposit
                            </Button>
                        </div>
                    </div>

                    <SummaryCard mealData={mealData} setActiveCardDialog={setActiveCardDialog} />
                </div>

                <div className="space-y-4">
                    <SummaryTabs setActiveTab={setActiveTab} mealData={mealData} activeTab={activeTab} />

                    {activeTab === 'personwise' && (
                        <PersonwiseSummaryTable mealData={mealData} />
                    )}

                    {activeTab === 'datewise' && (
                        <DatewiseSummaryTable mealData={mealData} />
                    )}

                    {activeTab === 'bazar' && (
                        <BazarwiseExpenseSummaryTable mealData={mealData} setIsAddBazarOpen={setIsAddBazarOpen} />
                    )}

                    {activeTab === 'deposits' && (
                        <MemberDepositLogTable mealData={mealData} setIsAddDepositOpen={setIsAddDepositOpen} />
                    )}

                    {/* TAB 5: FIXED UTILITIES & EXTRA EXPENSES TABLE */}
                    {activeTab === 'extra' && (
                        <ExtraExpenseTable mealData={mealData} />
                    )}
                </div>
            </div>

            <TotalCostDialog mealData={mealData} isOpen={activeCardDialog === 'totalCost'} onCancel={() => setActiveCardDialog(null)} />
            <TotalMealDialog mealData={mealData} isOpen={activeCardDialog === 'totalMeal'} onCancel={() => setActiveCardDialog(null)} />
            <CuttentMealRateDialog mealData={mealData} isOpen={activeCardDialog === 'mealRate'} onCancel={() => setActiveCardDialog(null)} />
            <TotalExtraCostDialog mealData={mealData} isOpen={activeCardDialog === 'totalExtra'} onCancel={() => setActiveCardDialog(null)} />
            <BazarCostDialog mealData={mealData} isOpen={activeCardDialog === 'bazarCost'} onCancel={() => setActiveCardDialog(null)} />
            <DepositDialog mealData={mealData} isOpen={activeCardDialog === 'deposits'} onCancel={() => setActiveCardDialog(null)} />
            <NetBalanceDialog mealData={mealData} isOpen={activeCardDialog === 'netBalance'} onCancel={() => setActiveCardDialog(null)} />
            <AddBazarExpenceDialog isAddBazarOpen={isAddBazarOpen} setIsAddBazarOpen={setIsAddBazarOpen} mealData={mealData} handleAddBazarSubmit={handleAddBazarSubmit} />
            <DepositRecordDialog isAddDepositOpen={isAddDepositOpen} setIsAddDepositOpen={setIsAddDepositOpen} mealData={mealData} handleAddDepositSubmit={handleAddDepositSubmit} />

        </div>
    );
}
