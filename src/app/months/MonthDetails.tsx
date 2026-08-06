'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
    Calendar,
    DollarSign,
    Utensils,
    TrendingUp,
    Receipt,
    PiggyBank,
    Wallet,
    Users,
    Plus,
    ShoppingBag,
    Sparkles,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
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


    const handleAddBazarSubmit = (e: React.FormEvent, newBazar: any) => {
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
    const handleAddDepositSubmit = (e: React.FormEvent, newDeposit: any) => {
        e.preventDefault();
        if (!newDeposit.amount) return;

        const amountNum = parseFloat(newDeposit.amount);
        if (isNaN(amountNum) || amountNum <= 0) return;

        const member = mealData.activeMembers.find((m) => m.userId === Number(newDeposit.userId));

        const newDep: MemberDeposit = {
            id: `dep-new-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            userId: Number(newDeposit.userId),
            userName: member?.fullName || 'User',
            amount: amountNum,
            paymentMethod: newDeposit.paymentMethod,
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



    return (
        <div className="min-h-screen bg-zinc-50/60 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans pb-12">
            <div className="sticky top-[-8px] z-20 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-2 py-2 shadow-xs">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-teal-600/10 text-teal-700 dark:bg-teal-500/20 dark:text-teal-400 flex items-center justify-center font-bold">
                            <Calendar size={18} />
                        </div>
                        <div>
                            <h1 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                {mealData.monthName} {mealData.year}
                                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                                    {mealData?.daysInMonth} Days
                                </span>
                            </h1>

                        </div>
                    </div>
                    <MonthFilter />
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 pt-6 space-y-6">
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

                    {/* TAB 1: PERSON-WISE SUMMARY TABLE */}
                    {activeTab === 'personwise' && (
                        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-2xs overflow-hidden">
                            <div className="p-4 border-b border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                        Person-Wise Meal & Financial Summary ({mealData.monthName} {mealData.year})
                                    </h3>
                                    <p className="text-xs text-zinc-500">
                                        Individual meal counts, calculated meal costs (Meals &times; ৳{mealData.mealRate}), extra shared cost, total deposit, and net balance.
                                    </p>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 font-semibold border-b border-zinc-200 dark:border-zinc-800">
                                        <tr>
                                            <th className="py-3 px-4">Member Name</th>
                                            <th className="py-3 px-4 text-center">Meals Consumed</th>
                                            <th className="py-3 px-4 text-right">Meal Cost (৳)</th>
                                            <th className="py-3 px-4 text-right">Fixed Extra Share (৳)</th>
                                            <th className="py-3 px-4 text-right font-bold">Gross Total Cost (৳)</th>
                                            <th className="py-3 px-4 text-right text-emerald-600 dark:text-emerald-400">Total Deposit (৳)</th>
                                            <th className="py-3 px-4 text-right font-bold">Net Balance (৳)</th>
                                            <th className="py-3 px-4 text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60 text-zinc-800 dark:text-zinc-200">
                                        {mealData.activeMembers.map((member) => (
                                            <tr key={member.userId} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors">
                                                <td className="py-3 px-4 font-medium flex items-center gap-3">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarImage src={member.photoUrl} alt={member.fullName} />
                                                        <AvatarFallback>{member.fullName[0]}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="font-semibold text-zinc-900 dark:text-zinc-100">{member.fullName}</div>
                                                        <div className="text-[10px] text-zinc-400">{member.phone}</div>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 text-center font-bold">
                                                    <span className="px-2.5 py-1 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold border border-amber-200 dark:border-amber-800">
                                                        {member.totalMeals}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-right">৳{member.mealCost.toLocaleString()}</td>
                                                <td className="py-3 px-4 text-right">৳{member.extraShare.toLocaleString()}</td>
                                                <td className="py-3 px-4 text-right font-bold text-zinc-900 dark:text-zinc-100">
                                                    ৳{member.grossTotalCost.toLocaleString()}
                                                </td>
                                                <td className="py-3 px-4 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                                                    ৳{member.totalDeposit.toLocaleString()}
                                                </td>
                                                <td className="py-3 px-4 text-right font-bold">
                                                    <span
                                                        className={
                                                            member.netBalance >= 0
                                                                ? 'text-emerald-600 dark:text-emerald-400'
                                                                : 'text-rose-600 dark:text-rose-400'
                                                        }
                                                    >
                                                        {member.netBalance >= 0 ? `+৳${member.netBalance.toLocaleString()}` : `-৳${Math.abs(member.netBalance).toLocaleString()}`}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    {member.status === 'paid' && (
                                                        <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                                                            Settled
                                                        </span>
                                                    )}
                                                    {member.status === 'excess' && (
                                                        <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-cyan-100 text-cyan-800 dark:bg-cyan-950/80 dark:text-cyan-300">
                                                            Cash Back (+৳{member.netBalance})
                                                        </span>
                                                    )}
                                                    {member.status === 'due' && (
                                                        <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300">
                                                            Due (-৳{Math.abs(member.netBalance)})
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-zinc-100 dark:bg-zinc-800 font-bold border-t-2 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100">
                                        <tr>
                                            <td className="py-3 px-4">TOTAL HOUSE SUMMARY</td>
                                            <td className="py-3 px-4 text-center text-amber-700 dark:text-amber-400">{mealData.totalMeals} meals</td>
                                            <td className="py-3 px-4 text-right">৳{mealData.totalBazarCost.toLocaleString()}</td>
                                            <td className="py-3 px-4 text-right">৳{mealData.totalExtraCost.toLocaleString()}</td>
                                            <td className="py-3 px-4 text-right text-teal-700 dark:text-teal-400">
                                                ৳{mealData.totalGrossCost.toLocaleString()}
                                            </td>
                                            <td className="py-3 px-4 text-right text-emerald-600 dark:text-emerald-400">
                                                ৳{mealData.totalDeposits.toLocaleString()}
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <span className={mealData.netBalance >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                                                    {mealData.netBalance >= 0 ? `+৳${mealData.netBalance.toLocaleString()}` : `-৳${Math.abs(mealData.netBalance).toLocaleString()}`}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-center text-xs font-normal text-zinc-500">Rate: ৳{mealData.mealRate}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* TAB 2: DATE-WISE MEAL MATRIX TABLE */}
                    {activeTab === 'datewise' && (
                        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-2xs overflow-hidden">
                            <div className="p-4 border-b border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                        Date-Wise Meal Matrix ({mealData.monthName} 1 to {mealData.daysInMonth}, {mealData.year})
                                    </h3>
                                    <p className="text-xs text-zinc-500">
                                        Daily recorded meals per member (B = Breakfast 0.5, L = Lunch 1.0, D = Dinner 1.0).
                                    </p>
                                </div>
                            </div>

                            <div className="overflow-x-auto max-h-[550px] custom-scrollbar">
                                <table className="w-full text-left text-xs border-collapse">
                                    <thead className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold sticky top-0 z-10">
                                        <tr>
                                            <th className="py-2.5 px-3 border-b border-zinc-200 dark:border-zinc-700 min-w-[100px]">Date</th>
                                            <th className="py-2.5 px-3 border-b border-zinc-200 dark:border-zinc-700 text-center min-w-[60px]">Day</th>
                                            {mealData.activeMembers.map((m) => (
                                                <th key={m.userId} className="py-2.5 px-3 border-b border-zinc-200 dark:border-zinc-700 text-center min-w-[120px]">
                                                    <div className="font-bold text-zinc-900 dark:text-zinc-100">{m.fullName.split(' ')[0]}</div>
                                                    <div className="text-[10px] font-normal text-zinc-400">{m.totalMeals} meals</div>
                                                </th>
                                            ))}
                                            <th className="py-2.5 px-3 border-b border-zinc-200 dark:border-zinc-700 text-center font-bold text-teal-700 dark:text-teal-400 min-w-[100px]">
                                                Daily Total
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/80">
                                        {mealData.dailyMeals.map((daily) => (
                                            <tr key={daily.date} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
                                                <td className="py-2 px-3 font-semibold text-zinc-800 dark:text-zinc-200">
                                                    {daily.date}
                                                </td>
                                                <td className="py-2 px-3 text-center text-zinc-500 font-medium">
                                                    {daily.dayName}
                                                </td>
                                                {mealData.activeMembers.map((m) => {
                                                    const mData = daily.memberMeals[m.userId] || { total: 0 };
                                                    return (
                                                        <td key={m.userId} className="py-2 px-3 text-center">
                                                            <span
                                                                className={`px-2 py-0.5 rounded text-xs font-semibold inline-block ${mData.total > 0
                                                                    ? 'bg-teal-50 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800/60'
                                                                    : 'text-zinc-400 bg-zinc-100/50 dark:bg-zinc-800/30'
                                                                    }`}
                                                            >
                                                                {mData.total}
                                                            </span>
                                                        </td>
                                                    );
                                                })}
                                                <td className="py-2 px-3 text-center font-bold text-teal-700 dark:text-teal-400 bg-teal-50/30 dark:bg-teal-950/20">
                                                    {daily.dailyTotalMeals}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-zinc-100 dark:bg-zinc-800 font-bold sticky bottom-0 border-t-2 border-zinc-300 dark:border-zinc-700">
                                        <tr>
                                            <td colSpan={2} className="py-3 px-3 text-zinc-900 dark:text-zinc-100">
                                                MONTH TOTALS
                                            </td>
                                            {mealData.activeMembers.map((m) => (
                                                <td key={m.userId} className="py-3 px-3 text-center text-amber-600 dark:text-amber-400 font-extrabold text-sm">
                                                    {m.totalMeals}
                                                </td>
                                            ))}
                                            <td className="py-3 px-3 text-center text-teal-700 dark:text-teal-300 font-black text-sm">
                                                {mealData.totalMeals}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* TAB 3: BAZAR EXPENSES TABLE */}
                    {activeTab === 'bazar' && (
                        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-2xs overflow-hidden">
                            <div className="p-4 border-b border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between flex-wrap gap-2">
                                <div>
                                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                        Bazar Expenses Log ({mealData.monthName} {mealData.year})
                                    </h3>
                                    <p className="text-xs text-zinc-500">
                                        Detailed breakdown of all shopping items bought by active house members.
                                    </p>
                                </div>
                                <Button
                                    onClick={() => setIsAddBazarOpen(true)}
                                    size="sm"
                                    className="h-8 text-xs font-semibold bg-teal-700 hover:bg-teal-800 text-white cursor-pointer"
                                >
                                    <Plus size={14} className="mr-1" /> Add Bazar Entry
                                </Button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 font-semibold border-b border-zinc-200 dark:border-zinc-800">
                                        <tr>
                                            <th className="py-3 px-4">Date</th>
                                            <th className="py-3 px-4">Bazar Performed By</th>
                                            <th className="py-3 px-4">Category</th>
                                            <th className="py-3 px-4">Items / Details Description</th>
                                            <th className="py-3 px-4 text-right font-bold">Amount (৳)</th>
                                            <th className="py-3 px-4">Memo / Note</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60 text-zinc-800 dark:text-zinc-200">
                                        {mealData.bazarExpenses.map((expense) => (
                                            <tr key={expense.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors">
                                                <td className="py-3 px-4 font-semibold text-zinc-700 dark:text-zinc-300">{expense.date}</td>
                                                <td className="py-3 px-4 font-medium flex items-center gap-2.5">
                                                    <Avatar className="h-7 w-7">
                                                        <AvatarImage src={expense.shopperPhoto} alt={expense.shopperName} />
                                                        <AvatarFallback>{expense.shopperName[0]}</AvatarFallback>
                                                    </Avatar>
                                                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">{expense.shopperName}</span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                                                        {expense.category}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 max-w-xs truncate text-zinc-700 dark:text-zinc-300">{expense.itemsDescription}</td>
                                                <td className="py-3 px-4 text-right font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                                                    ৳{expense.amount.toLocaleString()}
                                                </td>
                                                <td className="py-3 px-4 text-[11px] text-zinc-400 italic">{expense.receiptNote || 'N/A'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-zinc-100 dark:bg-zinc-800 font-bold border-t-2 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100">
                                        <tr>
                                            <td colSpan={4} className="py-3 px-4">TOTAL BAZAR EXPENSES</td>
                                            <td className="py-3 px-4 text-right text-teal-700 dark:text-teal-400 text-base font-extrabold">
                                                ৳{mealData.totalBazarCost.toLocaleString()}
                                            </td>
                                            <td className="py-3 px-4 text-xs font-normal text-zinc-500">{mealData.bazarExpenses.length} Total Receipts</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* TAB 4: MEMBER DEPOSITS LOG TABLE */}
                    {activeTab === 'deposits' && (
                        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-2xs overflow-hidden">
                            <div className="p-4 border-b border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between flex-wrap gap-2">
                                <div>
                                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                        Member Advance Deposits Log ({mealData.monthName} {mealData.year})
                                    </h3>
                                    <p className="text-xs text-zinc-500">
                                        History of advance payments and meal money deposits given by active house members.
                                    </p>
                                </div>
                                <Button
                                    onClick={() => setIsAddDepositOpen(true)}
                                    size="sm"
                                    className="h-8 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer"
                                >
                                    <Plus size={14} className="mr-1" /> Log Deposit
                                </Button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 font-semibold border-b border-zinc-200 dark:border-zinc-800">
                                        <tr>
                                            <th className="py-3 px-4">Date</th>
                                            <th className="py-3 px-4">Member Name</th>
                                            <th className="py-3 px-4">Payment Method</th>
                                            <th className="py-3 px-4">Transaction ID / Reference</th>
                                            <th className="py-3 px-4 text-right font-bold">Deposit Amount (৳)</th>
                                            <th className="py-3 px-4">Notes</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60 text-zinc-800 dark:text-zinc-200">
                                        {mealData.deposits.map((dep) => (
                                            <tr key={dep.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors">
                                                <td className="py-3 px-4 font-semibold text-zinc-700 dark:text-zinc-300">{dep.date}</td>
                                                <td className="py-3 px-4 font-bold text-zinc-900 dark:text-zinc-100">{dep.userName}</td>
                                                <td className="py-3 px-4">
                                                    <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-emerald-50 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                                        {dep.paymentMethod}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-zinc-500 font-mono text-[11px]">{dep.transactionId || 'N/A'}</td>
                                                <td className="py-3 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                                                    ৳{dep.amount.toLocaleString()}
                                                </td>
                                                <td className="py-3 px-4 text-[11px] text-zinc-400">{dep.note || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-zinc-100 dark:bg-zinc-800 font-bold border-t-2 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100">
                                        <tr>
                                            <td colSpan={4} className="py-3 px-4">TOTAL DEPOSITS RECEIVED</td>
                                            <td className="py-3 px-4 text-right text-emerald-600 dark:text-emerald-400 text-base font-extrabold">
                                                ৳{mealData.totalDeposits.toLocaleString()}
                                            </td>
                                            <td className="py-3 px-4 text-xs font-normal text-zinc-500">{mealData.deposits.length} Payments</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* TAB 5: FIXED UTILITIES & EXTRA EXPENSES TABLE */}
                    {activeTab === 'extra' && (
                        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-2xs overflow-hidden">
                            <div className="p-4 border-b border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                        Fixed Extra & Utility Bills ({mealData.monthName} {mealData.year})
                                    </h3>
                                    <p className="text-xs text-zinc-500">
                                        Shared house expenses (cook salary, gas bill, internet, cleaning) equally divided among {mealData.activeMembers.length} members.
                                    </p>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 font-semibold border-b border-zinc-200 dark:border-zinc-800">
                                        <tr>
                                            <th className="py-3 px-4">Bill Title</th>
                                            <th className="py-3 px-4">Category</th>
                                            <th className="py-3 px-4">Description</th>
                                            <th className="py-3 px-4 text-right font-bold">Total Bill (৳)</th>
                                            <th className="py-3 px-4 text-right font-bold text-purple-600 dark:text-purple-400">Per Head Share (৳)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60 text-zinc-800 dark:text-zinc-200">
                                        {mealData.extraExpenses.map((item) => (
                                            <tr key={item.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors">
                                                <td className="py-3 px-4 font-bold text-zinc-900 dark:text-zinc-100">{item.title}</td>
                                                <td className="py-3 px-4">
                                                    <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-purple-50 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                                                        {item.category}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400">{item.description || '-'}</td>
                                                <td className="py-3 px-4 text-right font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                                                    ৳{item.amount.toLocaleString()}
                                                </td>
                                                <td className="py-3 px-4 text-right font-semibold text-purple-600 dark:text-purple-400">
                                                    ৳{(item.amount / (mealData.activeMembers.length || 1)).toFixed(2)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-zinc-100 dark:bg-zinc-800 font-bold border-t-2 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100">
                                        <tr>
                                            <td colSpan={3} className="py-3 px-4">TOTAL FIXED EXTRA BILLS</td>
                                            <td className="py-3 px-4 text-right text-purple-600 dark:text-purple-400 text-base font-extrabold">
                                                ৳{mealData.totalExtraCost.toLocaleString()}
                                            </td>
                                            <td className="py-3 px-4 text-right text-purple-600 dark:text-purple-400 font-extrabold">
                                                ৳{(mealData.totalExtraCost / (mealData.activeMembers.length || 1)).toFixed(2)} / member
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
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
