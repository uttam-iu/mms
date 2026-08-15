import React, { useState } from "react";
import Loader from "@/components/Loader";
import { DailyMealEntry } from "@/types/meal.types";
import { Pencil, Check, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { getSocket } from "@/lib/socket";
import { showToast } from "@/lib/utils";
import { ApiResponse } from "@/types/user.types";

export const DatewiseSummaryTable = ({
    dailyMealEntries,
    refetch,
    isLoading,
    memberMeta
}: {
    dailyMealEntries: DailyMealEntry[];
    refetch: () => void;
    isLoading: boolean;
    memberMeta: { label: string, value: string }[] | []
}) => {
    const searchParams = useSearchParams();

    const year = searchParams.get('year');
    const month = searchParams.get('month') || '';

    const [editingDate, setEditingDate] = useState<string | null>(null);
    const [loading, setLoading] = useState(false)
    const [editValues, setEditValues] = useState<{ [userId: string]: string | number }>({});

    const handleStartEdit = (daily: DailyMealEntry) => {
        setEditingDate(daily.date);
        const initialMap: { [userId: string]: string | number } = {};
        memberMeta.forEach((m) => {
            const val = daily.memberMeals?.[m.value];
            initialMap[m.value] = val !== undefined && val !== null ? val : '';
        });
        setEditValues(initialMap);
    };

    const handleCancelEdit = () => {
        setEditingDate(null);
        setEditValues({});
    };

    const handleSaveEdit = (daily: DailyMealEntry) => {
        const userIdWiseMeals: { [userId: string]: number } = {};
        memberMeta.forEach((m) => {
            const rawVal = editValues[m.value];
            const numVal = rawVal === '' || rawVal === undefined || rawVal === null ? 0 : parseFloat(String(rawVal)) || 0;
            userIdWiseMeals[m.value] = numVal;
        });

        const formData = {
            date: daily.date,
            memberMeals: userIdWiseMeals,
            month,
            year
        }
        const socket = getSocket()
        setLoading(true)
        socket?.emit('meal_matrix_update', formData, (res: ApiResponse<DailyMealEntry>) => {
            if (res?.success) {
                showToast(res?.message, 'success')
                setLoading(false)
                refetch()
                setEditValues({});
                setEditingDate(null);
            } else {
                showToast(res?.message, 'error')
                setLoading(false)
            }
        })


    };

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-2xs overflow-hidden">
            <div className="p-2 border-b border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between flex-wrap gap-2">
                <div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        Date-Wise Meal Matrix
                    </h3>
                    <p className="text-xs text-zinc-500">
                        Daily recorded meals per member.
                    </p>
                </div>
            </div>

            <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold sticky top-0 z-10">
                        <tr>
                            <th className="p-1">SL</th>
                            <th className="p-1 border-b border-zinc-200 dark:border-zinc-700 min-w-[100px]">Date</th>
                            <th className="p-1 border-b border-zinc-200 dark:border-zinc-700 text-center min-w-[60px]">Day</th>
                            {memberMeta.map((m) => (
                                <th key={m.value} className="p-1 border-b border-zinc-200 dark:border-zinc-700 text-center min-w-[120px]">
                                    <div className="font-bold text-zinc-900 dark:text-zinc-100">{m.label}</div>
                                    <div key={m.value} className="text-center text-amber-600 dark:text-amber-400 font-extrabold text-sm">
                                        ({dailyMealEntries?.reduce((sum, d) => sum + (d.memberMeals?.[m.value] || 0), 0)})
                                    </div>
                                </th>
                            ))}
                            <th className="p-1 border-b border-zinc-200 dark:border-zinc-700 text-center font-bold text-teal-700 dark:text-teal-400 min-w-[100px]">
                                Daily Total
                                <div className="text-center text-teal-700 dark:text-teal-300 font-black text-sm">
                                    ({dailyMealEntries?.reduce((sum, d) => sum + (d.dailyTotalMeals || 0), 0)})
                                </div>
                            </th>
                            <th className="p-1 border-b border-zinc-200 dark:border-zinc-700 text-center font-bold min-w-[80px]">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/80">
                        {isLoading || dailyMealEntries?.length === 0 ? (
                            <tr>
                                <td colSpan={memberMeta.length + 5} className="p-4 text-center">
                                    {isLoading ? <Loader /> : 'No data available'}
                                </td>
                            </tr>
                        ) : (
                            dailyMealEntries?.map((daily, index) => {
                                const isEditing = editingDate === daily.date;
                                return (
                                    <tr key={daily.date} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
                                        <td className="p-1 text-center text-zinc-500 font-medium">
                                            {index + 1}
                                        </td>
                                        <td className="p-1 font-semibold text-zinc-800 dark:text-zinc-200">
                                            {daily.date}
                                        </td>
                                        <td className="p-1 text-center text-zinc-500 font-medium">
                                            {daily.dayName}
                                        </td>
                                        {memberMeta?.map((m) => {
                                            const mData = daily.memberMeals?.[m.value] ?? 0;
                                            if (isEditing) {
                                                return (
                                                    <td key={m.value} className="p-1 text-center">
                                                        <input
                                                            type="number"
                                                            step="any"
                                                            min="0"
                                                            value={editValues[m.value] ?? ''}
                                                            onChange={(e) => {
                                                                const val = e.target.value;
                                                                setEditValues((prev) => ({
                                                                    ...prev,
                                                                    [m.value]: val
                                                                }));
                                                            }}
                                                            className="w-14 h-7 text-center rounded border border-teal-500 bg-white dark:bg-zinc-900 font-bold text-xs text-teal-800 dark:text-teal-300 focus:outline-none focus:ring-1 focus:ring-teal-500"
                                                        />
                                                    </td>
                                                );
                                            }

                                            return (
                                                <td key={m.value} className="p-1 text-center">
                                                    <span
                                                        className={`px-2 py-0.5 rounded text-xs font-semibold inline-block ${mData > 0
                                                            ? 'bg-teal-50 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800/60'
                                                            : 'text-zinc-400 bg-zinc-100/50 dark:bg-zinc-800/30'
                                                            }`}
                                                    >
                                                        {mData}
                                                    </span>
                                                </td>
                                            );
                                        })}
                                        <td className="p-1 text-center font-bold text-teal-700 dark:text-teal-400 bg-teal-50/30 dark:bg-teal-950/20">
                                            {daily.dailyTotalMeals}
                                        </td>
                                        <td className="p-1 text-center whitespace-nowrap">
                                            <div className="flex items-center justify-center gap-1">
                                                {isEditing ? (
                                                    <>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleSaveEdit(daily)}
                                                            className="p-1 rounded bg-teal-600 hover:bg-teal-700 text-white cursor-pointer transition-colors shadow-xs"
                                                            title="Save Meal Entry"
                                                            disabled={loading}
                                                        >
                                                            <Check size={14} />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={handleCancelEdit}
                                                            className="p-1 rounded text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
                                                            title="Cancel Edit"
                                                            disabled={loading}
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleStartEdit(daily)}
                                                        className="p-1 rounded text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950/50 cursor-pointer transition-colors"
                                                        title="Edit Meal Entry"
                                                    >
                                                        <Pencil size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                    <tfoot className="bg-zinc-100 dark:bg-zinc-800 font-bold sticky bottom-0 border-t-2 border-zinc-300 dark:border-zinc-700">
                        <tr>
                            <th className="p-1"></th>
                            <td colSpan={2} className="p-1 text-zinc-900 dark:text-zinc-100">
                                Summary
                            </td>
                            {memberMeta.map((m) => {
                                const total = dailyMealEntries?.reduce((sum, d) => sum + (d.memberMeals?.[m.value] || 0), 0);
                                return (
                                    <td key={m.value} className="p-1 text-center text-amber-600 dark:text-amber-400 font-extrabold text-sm">
                                        {total}
                                    </td>
                                );
                            })}
                            <td className="p-1 text-center text-teal-700 dark:text-teal-300 font-black text-sm">
                                {dailyMealEntries?.reduce((sum, d) => sum + (d.dailyTotalMeals || 0), 0)}
                            </td>
                            <td className="p-1"></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
};