'use client';

import { PiggyBank, Utensils, Wallet } from "lucide-react";

export default function SummaryCard() {
    return <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-zinc-200/80 dark:border-zinc-800 shadow-2xs flex items-center justify-between">
            <div>
                <span className="text-xs font-semibold text-zinc-500">Monthly Meals Consumed</span>
                <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-0.5">72 Meals</div>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600">
                <Utensils size={20} />
            </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-zinc-200/80 dark:border-zinc-800 shadow-2xs flex items-center justify-between">
            <div>
                <span className="text-xs font-semibold text-zinc-500">Total Deposits Paid</span>
                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">৳3,500</div>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600">
                <PiggyBank size={20} />
            </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-zinc-200/80 dark:border-zinc-800 shadow-2xs flex items-center justify-between">
            <div>
                <span className="text-xs font-semibold text-zinc-500">House Account Status</span>
                <div className="text-2xl font-black text-teal-600 dark:text-teal-400 mt-0.5">+৳250 <span className="text-xs font-normal text-zinc-400">Surplus</span></div>
            </div>
            <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600">
                <Wallet size={20} />
            </div>
        </div>
    </div>

}