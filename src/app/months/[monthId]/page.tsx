'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  Calendar,
  Filter,
  DollarSign,
  Utensils,
  TrendingUp,
  Receipt,
  PiggyBank,
  Wallet,
  Users,
  Plus,
  Info,
  CheckCircle2,
  AlertCircle,
  ShoppingBag,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  ChevronRight,
  Sparkles,
  RefreshCw
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
  MONTH_LIST,
  AVAILABLE_YEARS,
  generateMonthlyMealData,
} from '@/dummyData/mealData';
import { MonthlyMealData, BazarExpense, MemberDeposit } from '@/types/meal.types';

export default function MonthDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const routeMonthId = (params?.monthId as string) || 'january';

  // Search parameters or default
  const paramYear = searchParams.get('year');
  const paramMonth = searchParams.get('month');

  // Filter local state
  const [selectedYear, setSelectedYear] = useState<number>(
    paramYear ? parseInt(paramYear, 10) : 2026
  );
  const [selectedMonth, setSelectedMonth] = useState<string>(
    paramMonth || routeMonthId || 'january'
  );

  // Sync state if URL changes
  useEffect(() => {
    if (paramYear) {
      setSelectedYear(parseInt(paramYear, 10));
    }
    if (paramMonth) {
      setSelectedMonth(paramMonth);
    } else if (routeMonthId) {
      setSelectedMonth(routeMonthId);
    }
  }, [paramYear, paramMonth, routeMonthId]);

  // Dynamic meal data state
  const [mealData, setMealData] = useState<MonthlyMealData>(() =>
    generateMonthlyMealData(selectedYear, selectedMonth)
  );

  // Refresh data when year or monthId route changes
  useEffect(() => {
    setMealData(generateMonthlyMealData(selectedYear, selectedMonth));
  }, [selectedYear, selectedMonth]);

  // Handle Filter Perform Action
  const handleApplyFilter = () => {
    const targetMonth = selectedMonth.toLowerCase();
    const query = new URLSearchParams({
      year: selectedYear.toString(),
      month: targetMonth,
    }).toString();

    router.push(`/months/${targetMonth}?${query}`);
  };

  // Active Tab for Tables
  const [activeTab, setActiveTab] = useState<'datewise' | 'personwise' | 'bazar' | 'deposits' | 'extra'>('personwise');

  // Active Dialog state for summary cards
  const [activeCardDialog, setActiveCardDialog] = useState<
    'totalCost' | 'totalMeal' | 'mealRate' | 'totalExtra' | 'bazarCost' | 'deposits' | 'netBalance' | null
  >(null);

  // Quick Action Dialog States
  const [isAddBazarOpen, setIsAddBazarOpen] = useState(false);
  const [newBazar, setNewBazar] = useState({
    shopperUserId: 1,
    itemsDescription: '',
    amount: '',
    category: 'Groceries' as const,
  });

  const [isAddDepositOpen, setIsAddDepositOpen] = useState(false);
  const [newDeposit, setNewDeposit] = useState({
    userId: 1,
    amount: '',
    paymentMethod: 'bKash' as const,
    note: '',
  });

  // Handle Quick Add Bazar
  const handleAddBazarSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBazar.itemsDescription || !newBazar.amount) return;

    const amountNum = parseFloat(newBazar.amount);
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

    setNewBazar({ shopperUserId: 1, itemsDescription: '', amount: '', category: 'Groceries' });
    setIsAddBazarOpen(false);
  };

  // Handle Quick Add Deposit
  const handleAddDepositSubmit = (e: React.FormEvent) => {
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

    setNewDeposit({ userId: 1, amount: '', paymentMethod: 'bKash', note: '' });
    setIsAddDepositOpen(false);
  };

  return (
    <div className="min-h-screen bg-zinc-50/60 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans pb-12">
      {/* Top Filter Bar Header */}
      <div className="sticky top-0 z-20 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-4 py-3 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-teal-600/10 text-teal-700 dark:bg-teal-500/20 dark:text-teal-400 flex items-center justify-center font-bold">
              <Calendar size={18} />
            </div>
            <div>
              <h1 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                {mealData.monthName} {mealData.year} Meal Management
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                  {mealData.daysInMonth} Days
                </span>
              </h1>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Filter by year and month to view monthly meal rates, bazar expenses, and per-person breakdown.
              </p>
            </div>
          </div>

          {/* Mandatory Filters Section */}
          <div className="flex items-center gap-2.5 flex-wrap w-full md:w-auto bg-zinc-100/80 dark:bg-zinc-800/60 p-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700/60">
            {/* Mandatory Year Dropdown */}
            <div className="flex items-center gap-1.5 px-2">
              <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Year:</label>
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

            <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-700 hidden sm:block" />

            {/* Mandatory Month Dropdown */}
            <div className="flex items-center gap-1.5 px-2">
              <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Month:</label>
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
        </div>
      </div>

      {/* Main Content Body */}
      <div className="max-w-7xl mx-auto px-4 pt-6 space-y-6">
        {/* SUMMARY CARDS SECTION */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
              <Sparkles size={14} className="text-amber-500" /> Monthly Financial & Meal Summary
              <span className="text-[10px] font-normal text-zinc-400 dark:text-zinc-500 lowercase">(click cards for detailed dialogs)</span>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Monthly Total Cost */}
            <div
              onClick={() => setActiveCardDialog('totalCost')}
              className="group bg-white dark:bg-zinc-900 rounded-xl p-4 border border-zinc-200/80 dark:border-zinc-800 hover:border-teal-500 dark:hover:border-teal-500 shadow-2xs hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <DollarSign size={54} className="text-teal-600 dark:text-teal-400" />
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Total House Cost</span>
                <span className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 group-hover:scale-110 transition-transform">
                  <DollarSign size={16} />
                </span>
              </div>
              <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100">
                ৳{mealData.totalGrossCost.toLocaleString()}
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-500 border-t border-zinc-100 dark:border-zinc-800/80 pt-2">
                <span>Bazar: ৳{mealData.totalBazarCost.toLocaleString()}</span>
                <span>Extra: ৳{mealData.totalExtraCost.toLocaleString()}</span>
              </div>
            </div>

            {/* Card 2: Total Meal Count */}
            <div
              onClick={() => setActiveCardDialog('totalMeal')}
              className="group bg-white dark:bg-zinc-900 rounded-xl p-4 border border-zinc-200/80 dark:border-zinc-800 hover:border-amber-500 dark:hover:border-amber-500 shadow-2xs hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <Utensils size={54} className="text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Total Meals Consumed</span>
                <span className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 group-hover:scale-110 transition-transform">
                  <Utensils size={16} />
                </span>
              </div>
              <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100">
                {mealData.totalMeals} <span className="text-xs font-normal text-zinc-500">meals</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-500 border-t border-zinc-100 dark:border-zinc-800/80 pt-2">
                <span>{mealData.activeMembers.length} Active Members</span>
                <span>Avg: {(mealData.totalMeals / (mealData.activeMembers.length || 1)).toFixed(1)} / user</span>
              </div>
            </div>

            {/* Card 3: Meal Rate */}
            <div
              onClick={() => setActiveCardDialog('mealRate')}
              className="group bg-white dark:bg-zinc-900 rounded-xl p-4 border border-zinc-200/80 dark:border-zinc-800 hover:border-emerald-500 dark:hover:border-emerald-500 shadow-2xs hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <TrendingUp size={54} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Current Meal Rate</span>
                <span className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                  <TrendingUp size={16} />
                </span>
              </div>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                ৳{mealData.mealRate} <span className="text-xs font-normal text-zinc-500">/ meal</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-500 border-t border-zinc-100 dark:border-zinc-800/80 pt-2">
                <span>Formula: Bazar ÷ Meals</span>
                <span className="text-teal-600 dark:text-teal-400 font-medium">View Breakdown &rarr;</span>
              </div>
            </div>

            {/* Card 4: Shared Extra Costs */}
            <div
              onClick={() => setActiveCardDialog('totalExtra')}
              className="group bg-white dark:bg-zinc-900 rounded-xl p-4 border border-zinc-200/80 dark:border-zinc-800 hover:border-purple-500 dark:hover:border-purple-500 shadow-2xs hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <Receipt size={54} className="text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Total Fixed / Extra Bills</span>
                <span className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 group-hover:scale-110 transition-transform">
                  <Receipt size={16} />
                </span>
              </div>
              <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100">
                ৳{mealData.totalExtraCost.toLocaleString()}
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-500 border-t border-zinc-100 dark:border-zinc-800/80 pt-2">
                <span>Per Head: ৳{(mealData.totalExtraCost / (mealData.activeMembers.length || 1)).toFixed(0)}</span>
                <span>{mealData.extraExpenses.length} Items</span>
              </div>
            </div>

            {/* Card 5: Total Bazar Cost */}
            <div
              onClick={() => setActiveCardDialog('bazarCost')}
              className="group bg-white dark:bg-zinc-900 rounded-xl p-4 border border-zinc-200/80 dark:border-zinc-800 hover:border-blue-500 dark:hover:border-blue-500 shadow-2xs hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Total Bazar Expenses</span>
                <span className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 group-hover:scale-110 transition-transform">
                  <ShoppingBag size={16} />
                </span>
              </div>
              <div className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                ৳{mealData.totalBazarCost.toLocaleString()}
              </div>
              <p className="text-[11px] text-zinc-500 mt-1">
                {mealData.bazarExpenses.length} shopping entries in {mealData.monthName}
              </p>
            </div>

            {/* Card 6: Total Deposits */}
            <div
              onClick={() => setActiveCardDialog('deposits')}
              className="group bg-white dark:bg-zinc-900 rounded-xl p-4 border border-zinc-200/80 dark:border-zinc-800 hover:border-cyan-500 dark:hover:border-cyan-500 shadow-2xs hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Deposits Collected</span>
                <span className="p-1.5 rounded-lg bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-400 group-hover:scale-110 transition-transform">
                  <PiggyBank size={16} />
                </span>
              </div>
              <div className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                ৳{mealData.totalDeposits.toLocaleString()}
              </div>
              <p className="text-[11px] text-zinc-500 mt-1">
                Total advance money deposited by members
              </p>
            </div>

            {/* Card 7: Net Balance */}
            <div
              onClick={() => setActiveCardDialog('netBalance')}
              className={`group bg-white dark:bg-zinc-900 rounded-xl p-4 border shadow-2xs hover:shadow-md transition-all cursor-pointer relative overflow-hidden ${
                mealData.netBalance >= 0
                  ? 'border-emerald-200 dark:border-emerald-800/80 hover:border-emerald-500'
                  : 'border-rose-200 dark:border-rose-800/80 hover:border-rose-500'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">House Cash Balance</span>
                <span
                  className={`p-1.5 rounded-lg ${
                    mealData.netBalance >= 0
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                      : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400'
                  }`}
                >
                  <Wallet size={16} />
                </span>
              </div>
              <div
                className={`text-xl font-bold flex items-center gap-1 ${
                  mealData.netBalance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {mealData.netBalance >= 0 ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                ৳{Math.abs(mealData.netBalance).toLocaleString()}
              </div>
              <p className="text-[11px] text-zinc-500 mt-1">
                {mealData.netBalance >= 0 ? 'Surplus Cash in Fund' : 'Deficit / Pending Payments'}
              </p>
            </div>

            {/* Card 8: Quick Action Card */}
            <div className="bg-gradient-to-br from-teal-700 to-teal-900 text-white rounded-xl p-4 flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-medium text-teal-200">
                  <Users size={14} /> Active House Members
                </div>
                <div className="text-2xl font-black mt-1">{mealData.activeMembers.length} Members</div>
              </div>
              <div className="flex items-center justify-between text-xs text-teal-100 border-t border-teal-600/60 pt-2 mt-2">
                <span>{mealData.monthName} Status</span>
                <span className="font-semibold px-2 py-0.5 rounded bg-teal-800 text-teal-100 text-[10px]">
                  Active Month
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* TABLES & DETAILS NAVIGATION TABS */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2 flex-wrap gap-2">
            <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setActiveTab('personwise')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'personwise'
                    ? 'bg-white dark:bg-zinc-800 text-teal-700 dark:text-teal-400 shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                <Users size={14} /> Member Summary Table
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('datewise')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'datewise'
                    ? 'bg-white dark:bg-zinc-800 text-teal-700 dark:text-teal-400 shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                <Calendar size={14} /> Date-Wise Meal Matrix
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('bazar')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'bazar'
                    ? 'bg-white dark:bg-zinc-800 text-teal-700 dark:text-teal-400 shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                <ShoppingBag size={14} /> Bazar Expenses ({mealData.bazarExpenses.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('deposits')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'deposits'
                    ? 'bg-white dark:bg-zinc-800 text-teal-700 dark:text-teal-400 shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                <PiggyBank size={14} /> Deposits Log ({mealData.deposits.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('extra')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'extra'
                    ? 'bg-white dark:bg-zinc-800 text-teal-700 dark:text-teal-400 shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                <Receipt size={14} /> Fixed Utilities ({mealData.extraExpenses.length})
              </button>
            </div>
          </div>

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
                                className={`px-2 py-0.5 rounded text-xs font-semibold inline-block ${
                                  mData.total > 0
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

      {/* SUMMARY CARD DETAILED DIALOGS */}

      {/* 1. Total Cost Dialog */}
      <Dialog open={activeCardDialog === 'totalCost'} onOpenChange={() => setActiveCardDialog(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
              <DollarSign className="text-teal-600" size={20} /> Total House Cost Breakdown
            </DialogTitle>
            <DialogDescription className="text-xs">
              Complete cost breakdown for {mealData.monthName} {mealData.year}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2 text-xs">
            <div className="p-4 rounded-xl bg-teal-50/60 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 flex items-center justify-between">
              <div>
                <span className="text-zinc-500 font-medium">Grand Total Expenditure</span>
                <div className="text-2xl font-black text-teal-700 dark:text-teal-300">
                  ৳{mealData.totalGrossCost.toLocaleString()}
                </div>
              </div>
              <div className="text-right text-zinc-400 text-[11px]">
                <div>Bazar: {((mealData.totalBazarCost / (mealData.totalGrossCost || 1)) * 100).toFixed(0)}%</div>
                <div>Extra: {((mealData.totalExtraCost / (mealData.totalGrossCost || 1)) * 100).toFixed(0)}%</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800">
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">1. Total Bazar Shopping Expenses</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100">৳{mealData.totalBazarCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800">
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">2. Fixed Utility Bills & Cook Salary</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100">৳{mealData.totalExtraCost.toLocaleString()}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button size="sm" onClick={() => setActiveCardDialog(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 2. Total Meal Dialog */}
      <Dialog open={activeCardDialog === 'totalMeal'} onOpenChange={() => setActiveCardDialog(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
              <Utensils className="text-amber-600" size={20} /> Total Meals Consumed Breakdown
            </DialogTitle>
            <DialogDescription className="text-xs">
              Meal distribution per member in {mealData.monthName} {mealData.year}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2 text-xs">
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-center">
              <span className="text-zinc-500 font-medium">Total House Meals</span>
              <div className="text-2xl font-black text-amber-600 dark:text-amber-400">{mealData.totalMeals} Meals</div>
            </div>
            <div className="space-y-1.5 max-h-60 overflow-y-auto">
              {mealData.activeMembers.map((m) => (
                <div key={m.userId} className="flex items-center justify-between p-2 rounded-lg border border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={m.photoUrl} alt={m.fullName} />
                      <AvatarFallback>{m.fullName[0]}</AvatarFallback>
                    </Avatar>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">{m.fullName}</span>
                  </div>
                  <span className="font-bold text-amber-600 dark:text-amber-400">{m.totalMeals} meals</span>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button size="sm" onClick={() => setActiveCardDialog(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 3. Meal Rate Formula Dialog */}
      <Dialog open={activeCardDialog === 'mealRate'} onOpenChange={() => setActiveCardDialog(null)}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
              <TrendingUp className="text-emerald-600" size={20} /> Meal Rate Calculation Formula
            </DialogTitle>
            <DialogDescription className="text-xs">
              Mathematical calculation of the meal rate for {mealData.monthName} {mealData.year}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2 text-xs">
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 font-mono text-center">
              <div className="text-xs text-zinc-500 mb-1">Formula</div>
              <div className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                Meal Rate = Total Bazar Expenses &divide; Total Meals
              </div>
              <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-2">
                ৳{mealData.totalBazarCost.toLocaleString()} &divide; {mealData.totalMeals} = ৳{mealData.mealRate} / meal
              </div>
            </div>
            <div className="space-y-2 text-zinc-600 dark:text-zinc-400">
              <p>&bull; <strong>Bazar Shopping Total:</strong> ৳{mealData.totalBazarCost.toLocaleString()}</p>
              <p>&bull; <strong>Total Meals Consumed:</strong> {mealData.totalMeals} meals</p>
              <p>&bull; <strong>Effective Cost Per Meal:</strong> ৳{mealData.mealRate}</p>
            </div>
          </div>
          <DialogFooter>
            <Button size="sm" onClick={() => setActiveCardDialog(null)}>Got it</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 4. Total Extra Dialog */}
      <Dialog open={activeCardDialog === 'totalExtra'} onOpenChange={() => setActiveCardDialog(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
              <Receipt className="text-purple-600" size={20} /> Shared Extra & Utility Bills Breakdown
            </DialogTitle>
            <DialogDescription className="text-xs">
              Itemized list of fixed house expenses.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2 text-xs">
            {mealData.extraExpenses.map((exp) => (
              <div key={exp.id} className="flex justify-between items-center p-2.5 rounded-lg border border-zinc-100 dark:border-zinc-800">
                <div>
                  <div className="font-semibold text-zinc-800 dark:text-zinc-200">{exp.title}</div>
                  <div className="text-[10px] text-zinc-400">{exp.category}</div>
                </div>
                <span className="font-bold text-purple-600 dark:text-purple-400">৳{exp.amount.toLocaleString()}</span>
              </div>
            ))}
            <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950/40 font-bold flex justify-between">
              <span>Per Member Equal Share</span>
              <span className="text-purple-600 dark:text-purple-400">৳{(mealData.totalExtraCost / (mealData.activeMembers.length || 1)).toFixed(2)}</span>
            </div>
          </div>
          <DialogFooter>
            <Button size="sm" onClick={() => setActiveCardDialog(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 5. Bazar Cost Dialog */}
      <Dialog open={activeCardDialog === 'bazarCost'} onOpenChange={() => setActiveCardDialog(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
              <ShoppingBag className="text-blue-600" size={20} /> Bazar Expenses Breakdown
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-2 text-xs max-h-60 overflow-y-auto">
            {mealData.bazarExpenses.map((b) => (
              <div key={b.id} className="p-2 rounded-lg border border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-zinc-800 dark:text-zinc-200">{b.shopperName} ({b.date})</div>
                  <div className="text-[11px] text-zinc-500">{b.itemsDescription}</div>
                </div>
                <span className="font-bold text-blue-600 dark:text-blue-400">৳{b.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button size="sm" onClick={() => setActiveCardDialog(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 6. Deposits Dialog */}
      <Dialog open={activeCardDialog === 'deposits'} onOpenChange={() => setActiveCardDialog(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
              <PiggyBank className="text-cyan-600" size={20} /> Member Deposits Summary
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-2 text-xs">
            {mealData.activeMembers.map((m) => (
              <div key={m.userId} className="flex justify-between items-center p-2 rounded-lg border border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={m.photoUrl} alt={m.fullName} />
                    <AvatarFallback>{m.fullName[0]}</AvatarFallback>
                  </Avatar>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">{m.fullName}</span>
                </div>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">৳{m.totalDeposit.toLocaleString()}</span>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button size="sm" onClick={() => setActiveCardDialog(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 7. Net Balance Dialog */}
      <Dialog open={activeCardDialog === 'netBalance'} onOpenChange={() => setActiveCardDialog(null)}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
              <Wallet className="text-teal-600" size={20} /> House Fund Position & Balance
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2 text-xs">
            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 space-y-1">
              <div className="flex justify-between">
                <span>Total Deposits Collected:</span>
                <span className="font-bold text-emerald-600">৳{mealData.totalDeposits.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Gross Expenses:</span>
                <span className="font-bold text-rose-600">৳{mealData.totalGrossCost.toLocaleString()}</span>
              </div>
              <div className="border-t border-zinc-200 dark:border-zinc-700 pt-1 flex justify-between font-bold text-sm">
                <span>Net House Surplus / Balance:</span>
                <span className={mealData.netBalance >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                  ৳{mealData.netBalance.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button size="sm" onClick={() => setActiveCardDialog(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* QUICK ACTION MODALS */}

      {/* Add Bazar Expense Modal */}
      <Dialog open={isAddBazarOpen} onOpenChange={setIsAddBazarOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <form onSubmit={handleAddBazarSubmit}>
            <DialogHeader>
              <DialogTitle className="text-sm font-bold flex items-center gap-2">
                <ShoppingBag className="text-teal-600" size={16} /> Log New Bazar Expense
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3 py-3 text-xs">
              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Shopper / Member</label>
                <select
                  value={newBazar.shopperUserId}
                  onChange={(e) => setNewBazar({ ...newBazar, shopperUserId: Number(e.target.value) })}
                  className="w-full h-8 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 text-xs"
                >
                  {mealData.activeMembers.map((m) => (
                    <option key={m.userId} value={m.userId}>
                      {m.fullName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Category</label>
                <select
                  value={newBazar.category}
                  onChange={(e) => setNewBazar({ ...newBazar, category: e.target.value as any })}
                  className="w-full h-8 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 text-xs"
                >
                  <option value="Groceries">Groceries</option>
                  <option value="Meat & Fish">Meat & Fish</option>
                  <option value="Vegetables">Vegetables</option>
                  <option value="Spices & Cooking">Spices & Cooking</option>
                  <option value="Others">Others</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Items Description</label>
                <Input
                  placeholder="e.g. Rice 10kg, Chicken 2kg, Eggs"
                  value={newBazar.itemsDescription}
                  onChange={(e) => setNewBazar({ ...newBazar, itemsDescription: e.target.value })}
                  className="h-8 text-xs"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Amount Spent (৳)</label>
                <Input
                  type="number"
                  placeholder="e.g. 1450"
                  value={newBazar.amount}
                  onChange={(e) => setNewBazar({ ...newBazar, amount: e.target.value })}
                  className="h-8 text-xs"
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setIsAddBazarOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-teal-700 hover:bg-teal-800 text-white">
                Add Expense
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Record Deposit Modal */}
      <Dialog open={isAddDepositOpen} onOpenChange={setIsAddDepositOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <form onSubmit={handleAddDepositSubmit}>
            <DialogHeader>
              <DialogTitle className="text-sm font-bold flex items-center gap-2">
                <PiggyBank className="text-emerald-600" size={16} /> Record Member Payment / Deposit
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3 py-3 text-xs">
              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Member Name</label>
                <select
                  value={newDeposit.userId}
                  onChange={(e) => setNewDeposit({ ...newDeposit, userId: Number(e.target.value) })}
                  className="w-full h-8 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 text-xs"
                >
                  {mealData.activeMembers.map((m) => (
                    <option key={m.userId} value={m.userId}>
                      {m.fullName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Deposit Amount (৳)</label>
                <Input
                  type="number"
                  placeholder="e.g. 2000"
                  value={newDeposit.amount}
                  onChange={(e) => setNewDeposit({ ...newDeposit, amount: e.target.value })}
                  className="h-8 text-xs"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Payment Method</label>
                <select
                  value={newDeposit.paymentMethod}
                  onChange={(e) => setNewDeposit({ ...newDeposit, paymentMethod: e.target.value as any })}
                  className="w-full h-8 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 text-xs"
                >
                  <option value="bKash">bKash</option>
                  <option value="Nagad">Nagad</option>
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Notes / TRX ID</label>
                <Input
                  placeholder="e.g. TRX9832742 - advance meal deposit"
                  value={newDeposit.note}
                  onChange={(e) => setNewDeposit({ ...newDeposit, note: e.target.value })}
                  className="h-8 text-xs"
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setIsAddDepositOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-emerald-700 hover:bg-emerald-800 text-white">
                Record Deposit
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
