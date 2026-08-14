import Loader from "@/components/Loader";
import { DailyMealEntry } from "@/types/meal.types";
import { Pencil } from "lucide-react";

export const DatewiseSummaryTable = ({
    dailyMealEntries,
    onUpdate,
    isLoading,
    memberMeta
}: {
    dailyMealEntries: DailyMealEntry[];
    onUpdate: (item: DailyMealEntry) => void;
    isLoading: boolean;
    memberMeta: { label: string, value: string }[] | []
}) => {
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
                                    {/* <div className="text-[10px] font-normal text-zinc-400">{m.totalMeals} meals</div> */}
                                </th>
                            ))}
                            <th className="p-1 border-b border-zinc-200 dark:border-zinc-700 text-center font-bold text-teal-700 dark:text-teal-400 min-w-[100px]">
                                Daily Total
                            </th>
                            <th className="p-1 border-b border-zinc-200 dark:border-zinc-700 text-center font-bold min-w-[80px]">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/80">
                        {
                            isLoading || dailyMealEntries?.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-4 text-center">
                                        {isLoading ? <Loader /> : 'No data available'}
                                    </td>
                                </tr>
                            ) :
                                dailyMealEntries?.map((daily, index) => (
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
                                            const mData = daily.memberMeals[m.value];
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
                                                <button
                                                    type="button"
                                                    onClick={() => onUpdate?.(daily)}
                                                    className="p-1 rounded text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950/50 cursor-pointer transition-colors"
                                                    title="Edit Meal Entry"
                                                >
                                                    <Pencil size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                    </tbody>
                    <tfoot className="bg-zinc-100 dark:bg-zinc-800 font-bold sticky bottom-0 border-t-2 border-zinc-300 dark:border-zinc-700">
                        <tr>
                            <th className="p-1"></th>
                            <td colSpan={2} className="p-1 text-zinc-900 dark:text-zinc-100">
                                Summary
                            </td>
                            {memberMeta.map((m) => (
                                <td key={m.value} className="p-1 text-center text-amber-600 dark:text-amber-400 font-extrabold text-sm">
                                    {0}
                                </td>
                            ))}
                            <td className="p-1 text-center text-teal-700 dark:text-teal-300 font-black text-sm">
                                {0}
                            </td>
                            <td className="p-1"></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
};