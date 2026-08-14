import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import { ExtraExpense } from "@/types/meal.types";
import { Plus, Pencil, Trash2 } from "lucide-react";
import _ from "lodash"

export const ExtraExpenseTable = ({
    monthwiseFixedCostData,
    onAddExtra,
    onEditExtra,
    totalActiveMember = 1,
    onDeleteExtra,
    isLoading,
}: {
    monthwiseFixedCostData: ExtraExpense[];
    totalActiveMember: number;
    onAddExtra: () => void;
    onEditExtra: (item: ExtraExpense) => void;
    onDeleteExtra: (item: ExtraExpense) => void;
    isLoading: boolean;
}) => {
    return (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-2xs overflow-hidden">
            <div className="p-2 border-b border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between flex-wrap gap-2">
                <div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        Fixed Extra & Utility Bills
                    </h3>
                    <p className="text-xs text-zinc-500">
                        Shared house expenses.
                    </p>
                </div>

                <Button
                    onClick={onAddExtra}
                    size="sm"
                    className="h-8 text-xs font-semibold bg-teal-700 hover:bg-teal-800 text-white cursor-pointer"
                >
                    <Plus size={14} className="mr-1" /> Add Fixed Utility
                </Button>

            </div>

            <div className="overflow-x-auto">
                {isLoading ? <Loader /> :
                    <table className="w-full text-left text-xs">
                        <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 font-semibold border-b border-zinc-200 dark:border-zinc-800">
                            <tr>
                                <th className="p-1">SL</th>
                                <th className="p-1">Bill Title</th>
                                <th className="p-1">Category</th>
                                <th className="p-1">Description</th>
                                <th className="p-1 text-right font-bold">Total Bill (৳)</th>
                                <th className="p-1 text-right font-bold text-purple-600 dark:text-purple-400">Per Head Share (৳)</th>
                                <th className="p-1 text-center font-bold">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60 text-zinc-800 dark:text-zinc-200">
                            {monthwiseFixedCostData?.map((item, index) => (
                                <tr key={item.billId || index} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors">
                                    <td className="p-1 font-semibold text-zinc-700 dark:text-zinc-300">{index + 1}</td>
                                    <td className="p-1 font-bold text-zinc-900 dark:text-zinc-100">{item.billTitle}</td>
                                    <td className="p-1">
                                        <span className="whitespace-nowrap px-2 py-0.5 text-[10px] font-semibold rounded bg-purple-50 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                                            {item.category}
                                        </span>
                                    </td>
                                    <td className="p-1 text-zinc-600 dark:text-zinc-400">{item.description || '-'}</td>
                                    <td className="p-1 text-right font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                                        ৳{item.amount.toLocaleString()}
                                    </td>
                                    <td className="p-1 text-right font-semibold text-purple-600 dark:text-purple-400">
                                        {`৳${(item.amount / totalActiveMember).toFixed(2)}`}
                                    </td>
                                    <td className="p-1 text-center whitespace-nowrap">
                                        <div className="flex items-center justify-center gap-1">
                                            <button
                                                type="button"
                                                onClick={() => onEditExtra?.(item)}
                                                className="p-1 rounded text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/50 cursor-pointer transition-colors"
                                                title="Edit Utility Bill"
                                            >
                                                <Pencil size={14} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => onDeleteExtra?.(item)}
                                                className="p-1 rounded text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 cursor-pointer transition-colors"
                                                title="Delete Utility Bill"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-zinc-100 dark:bg-zinc-800 font-bold border-t-2 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100">
                            <tr>
                                <td colSpan={4} className="p-1">Summary</td>
                                <td className="p-1 text-right text-purple-600 dark:text-purple-400 text-base font-extrabold">
                                    ৳{_.sumBy(monthwiseFixedCostData, 'amount')}
                                </td>
                                <td className="p-1 text-right text-purple-600 dark:text-purple-400 font-extrabold">
                                    ৳{(_.sumBy(monthwiseFixedCostData, 'amount') / (totalActiveMember || 1)).toFixed(2)} / member
                                </td>
                                <td className="p-1"></td>
                            </tr>
                        </tfoot>
                    </table>}
            </div>
        </div>
    );
};