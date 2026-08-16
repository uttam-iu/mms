'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowDownRight, ArrowUpRight, PiggyBank, Wallet, Trash2 } from 'lucide-react';
import { useTitle } from '@/hooks/useTitle';
import { useSocket } from '@/hooks/useSocket';
import { SummaryFilter } from '@/components/SummaryFilter';
import { Button } from '@/components/ui/button';
import { MemberWiseSummary, MonthlyMealData } from '@/types/meal.types';
import { initcap, showToast } from '@/lib/utils';
import { useAppState } from '@/context/AppContext';
import { getSocket } from '@/lib/socket';
import { ApiResponse } from '@/types/user.types';
import { DepositCollectionDialog, CollectionDialogType } from './DepositCollectionDialog';

interface DepositCollectionPageResp {
    summary: MonthlyMealData;
    memberWiseSummary: MemberWiseSummary[];
    month: string;
    year: string;
}

interface CollectionRecord {
    id: string;
    memberName: string;
    userId: number;
    type: CollectionDialogType;
    amount: number;
    paymentMethod: string;
    note: string;
    date: string;
}

export default function DepositCollectionPage() {
    const searchParams = useSearchParams();
    const year = searchParams.get('year');
    const month = searchParams.get('month') || '';
    const ctx = useAppState();
    const isAdmin = ctx?.state?.user?.role === 'admin';

    const { data: summaryResp, isLoading, refetch } = useSocket<{ data: DepositCollectionPageResp }>('emit', 'monthly_summary', {
        month,
        year,
    }, undefined, { enabled: !!month && !!year });

    const summary = summaryResp?.data?.summary;
    const memberRows = React.useMemo(() => summaryResp?.data?.memberWiseSummary || [], [summaryResp?.data?.memberWiseSummary]);

    const [dialogMember, setDialogMember] = React.useState<MemberWiseSummary | null>(null);
    const [dialogType, setDialogType] = React.useState<CollectionDialogType>('individual');
    const [collectionRecords, setCollectionRecords] = React.useState<CollectionRecord[]>([
        {
            id: 'demo-1',
            memberName: 'Mizan Rahman',
            userId: 101,
            type: 'individual',
            amount: 1200,
            paymentMethod: 'bKash',
            note: 'Individual cost settlement',
            date: new Date().toISOString(),
        },
        {
            id: 'demo-2',
            memberName: 'Nira Sultana',
            userId: 102,
            type: 'meal',
            amount: 800,
            paymentMethod: 'Cash',
            note: 'Meal cost collection',
            date: new Date().toISOString(),
        },
    ]);

    const totals = React.useMemo(() => {
        const totalIndividual = memberRows.reduce((sum, row) => sum + (Number(row.individualfixedShare) || 0), 0);
        const totalExtra = memberRows.reduce((sum, row) => sum + (Number(row.perHeadextraCost) || 0), 0);
        const totalMeal = memberRows.reduce((sum, row) => sum + (Number(row.mealCost) || 0), 0);
        const totalBill = memberRows.reduce((sum, row) => sum + (Number(row.grossTotal) || 0), 0);
        const totalPaid = memberRows.reduce((sum, row) => sum + (Number(row.totalDeposit) || 0), 0);
        const totalNet = memberRows.reduce((sum, row) => sum + (Number(row.netBalance) || 0), 0);

        return {
            totalIndividual,
            totalExtra,
            totalMeal,
            totalBill,
            totalPaid,
            totalNet,
        };
    }, [memberRows]);

    useTitle(`Deposit Collection (${initcap(month)} ${year})`);

    const handleDeleteCollection = (id: string) => {
        const socket = getSocket();
        socket?.emit('member_deposit_delete', { id }, (res: ApiResponse<{ id?: string }>) => {
            if (res?.success) {
                setCollectionRecords((prev) => prev.filter((item) => item.id !== id));
                showToast(res?.message || 'Deposit deleted successfully.', 'success');
                refetch();
            } else {
                showToast(res?.message || 'Delete failed.', 'error');
            }
        });
    };

    const summaryCards = [
        // {
        //     title: 'Total Extra Cost',
        //     value: `৳${(summary?.totalExtraCost ?? totals.totalExtra).toLocaleString()}`,
        //     subtitle: 'Fixed and extra bills',
        //     icon: <Receipt size={16} className="text-violet-600" />,
        //     bg: 'bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300',
        // },
        // {
        //     title: 'Total Bazar Cost',
        //     value: `৳${(summary?.totalBazarCost ?? 0).toLocaleString()}`,
        //     subtitle: 'Shopping and bazar spend',
        //     icon: <ShoppingBag size={16} className="text-blue-600" />,
        //     bg: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300',
        // },
        {
            title: 'Total House Cost',
            value: `৳${(summary?.totalGrossCost ?? totals.totalBill).toLocaleString()}`,
            subtitle: 'Meal + extra + individual share',
            icon: <Wallet size={16} className="text-teal-600" />,
            bg: 'bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300',
        },
        {
            title: 'Total Collection',
            value: `৳${(summary?.totalDeposits ?? totals.totalPaid).toLocaleString()}`,
            subtitle: 'Cash collected from members',
            icon: <PiggyBank size={16} className="text-emerald-600" />,
            bg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
        },
        {
            title: 'Net Balance',
            value: `৳${Math.abs(summary?.cashInHand ?? totals.totalNet).toLocaleString()}`,
            subtitle: (summary?.cashInHand ?? totals.totalNet) >= 0 ? 'House surplus' : 'Outstanding due',
            icon: (summary?.cashInHand ?? totals.totalNet) >= 0 ? <ArrowUpRight size={16} className="text-emerald-600" /> : <ArrowDownRight size={16} className="text-rose-600" />,
            bg: (summary?.cashInHand ?? totals.totalNet) >= 0 ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
        },
    ];

    return (
        <div className="w-full min-w-0 bg-zinc-50/60 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans pb-6">
            <div className="sticky top-[-8px] z-20 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-2 py-2 shadow-xs w-full min-w-0">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-end gap-3 w-full min-w-0">
                    <SummaryFilter pathName="deposit-collection" />
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-2 pt-2 space-y-6 w-full min-w-0">
                <div className="flex items-center justify-between gap-2">
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-teal-600">Deposit Collection</p>
                        <h1 className="text-lg font-black text-zinc-900 dark:text-zinc-100">
                            {initcap(month || 'current')} {year || new Date().getFullYear()}
                        </h1>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
                    {summaryCards.map((card, idx) => (
                        <div key={`${card.title}-${idx}`} className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-zinc-200/80 dark:border-zinc-800 shadow-2xs">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">{card.title}</span>
                                <span className={`p-1.5 rounded-lg ${card.bg}`}>
                                    {card.icon}
                                </span>
                            </div>
                            <div className="text-xl font-black text-zinc-900 dark:text-zinc-100">{card.value}</div>
                            <p className="mt-2 text-[11px] text-zinc-500 dark:text-zinc-400">{card.subtitle}</p>
                        </div>
                    ))}
                </div>

                <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-2xs overflow-hidden">
                    <div className="p-3 border-b border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between">
                        <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Member Collection Ledger</h2>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
                            {memberRows.length} Members
                        </span>
                    </div>

                    {isLoading ? (
                        <div className="p-12 text-center text-xs text-zinc-500">Loading deposit ledger...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 font-semibold border-b border-zinc-200 dark:border-zinc-800">
                                    <tr>
                                        <th className="p-2">Member</th>
                                        <th className="p-2 text-right">Individual</th>
                                        <th className="p-2 text-right">Extra</th>
                                        <th className="p-2 text-right">Meal</th>
                                        <th className="p-2 text-right">Total Bill</th>
                                        <th className="p-2 text-right">Paid</th>
                                        <th className="p-2 text-right">Advance</th>
                                        <th className="p-2 text-right">Balance</th>
                                        <th className="p-2 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60 text-zinc-800 dark:text-zinc-200">
                                    {memberRows.map((member) => {
                                        const paid = Number(member.totalDeposit || 0);
                                        const balance = Number(member.netBalance || 0);
                                        const advance = Math.max(0, paid - (Number(member.grossTotal || 0) - Number(member.totalDeposit || 0)));

                                        return (
                                            <tr key={member.userId} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors">
                                                <td className="p-2">
                                                    <div className="font-semibold text-zinc-900 dark:text-zinc-100">{member.fullName}</div>
                                                    <div className="text-[10px] text-zinc-500 dark:text-zinc-400">{member.phone}</div>
                                                </td>
                                                <td className="p-2 text-right font-medium">৳{(Number(member.individualfixedShare) || 0).toLocaleString()}</td>
                                                <td className="p-2 text-right font-medium">৳{(Number(member.perHeadextraCost) || 0).toLocaleString()}</td>
                                                <td className="p-2 text-right font-medium">৳{(Number(member.mealCost) || 0).toLocaleString()}</td>
                                                <td className="p-2 text-right font-bold">৳{(Number(member.grossTotal) || 0).toLocaleString()}</td>
                                                <td className="p-2 text-right font-medium text-emerald-600 dark:text-emerald-400">৳{paid.toLocaleString()}</td>
                                                <td className="p-2 text-right font-medium text-cyan-600 dark:text-cyan-400">৳{advance.toLocaleString()}</td>
                                                <td className={`p-2 text-right font-bold ${balance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                                    ৳{Math.abs(balance).toLocaleString()}
                                                </td>
                                                <td className="p-2 text-right">
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-7 text-[10px] px-2 border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950"
                                                        onClick={() => {
                                                            setDialogType('individual');
                                                            setDialogMember(member);
                                                        }}
                                                    >
                                                        Collect
                                                    </Button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                                <tfoot className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-700 dark:text-zinc-200 font-bold border-t border-zinc-200 dark:border-zinc-800">
                                    <tr>
                                        <td className="p-2">Total</td>
                                        <td className="p-2 text-right">৳{totals.totalIndividual.toLocaleString()}</td>
                                        <td className="p-2 text-right">৳{totals.totalExtra.toLocaleString()}</td>
                                        <td className="p-2 text-right">৳{totals.totalMeal.toLocaleString()}</td>
                                        <td className="p-2 text-right">৳{totals.totalBill.toLocaleString()}</td>
                                        <td className="p-2 text-right text-emerald-600 dark:text-emerald-400">৳{totals.totalPaid.toLocaleString()}</td>
                                        <td className="p-2 text-right text-cyan-600 dark:text-cyan-400">৳{Math.max(0, totals.totalPaid - totals.totalBill + totals.totalPaid).toLocaleString()}</td>
                                        <td className="p-2 text-right">৳{Math.abs(totals.totalNet).toLocaleString()}</td>
                                        <td className="p-2 text-right">-</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    )}
                </div>

                <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-2xs overflow-hidden">
                    <div className="p-3 border-b border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between">
                        <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Recent Collection Records</h2>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                            {collectionRecords.length} Entries
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 font-semibold border-b border-zinc-200 dark:border-zinc-800">
                                <tr>
                                    <th className="p-2">Member</th>
                                    <th className="p-2">Type</th>
                                    <th className="p-2 text-right">Amount</th>
                                    <th className="p-2">Method</th>
                                    <th className="p-2">Note</th>
                                    <th className="p-2">Date</th>
                                    {isAdmin && <th className="p-2 text-right">Action</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60 text-zinc-800 dark:text-zinc-200">
                                {collectionRecords.map((record) => (
                                    <tr key={record.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors">
                                        <td className="p-2 font-medium">{record.memberName}</td>
                                        <td className="p-2">
                                            <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                                                {record.type}
                                            </span>
                                        </td>
                                        <td className="p-2 text-right font-bold">৳{record.amount.toLocaleString()}</td>
                                        <td className="p-2">{record.paymentMethod}</td>
                                        <td className="p-2 text-zinc-600 dark:text-zinc-400">{record.note}</td>
                                        <td className="p-2">{new Date(record.date).toLocaleDateString()}</td>
                                        {isAdmin && (
                                            <td className="p-2 text-right">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-7 text-[10px] px-2 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950"
                                                    onClick={() => handleDeleteCollection(record.id)}
                                                >
                                                    <Trash2 size={12} className="mr-1" /> Delete
                                                </Button>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {dialogMember && (
                <DepositCollectionDialog
                    member={dialogMember}
                    defaultType={dialogType}
                    onCancel={() => {
                        setDialogMember(null);
                        setDialogType('individual');
                    }}
                    onSaved={() => refetch()}
                />
            )}
        </div>
    );
}
