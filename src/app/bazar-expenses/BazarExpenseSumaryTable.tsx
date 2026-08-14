import { Button } from "@/components/ui/button"
import { MonthlyMealData, BazarExpense } from "@/types/meal.types"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import _ from "lodash";

export const BazarwiseExpenseSummaryTable = ({
    bazarExpenses,
    onAddNew,
    onUpdate,
    totalMealNumber = 1,
    onDelete,
    isLoading,
}: {
    bazarExpenses: BazarExpense[];
    totalMealNumber: number;
    onAddNew: () => void;
    onUpdate: (item: BazarExpense) => void;
    onDelete: (item: BazarExpense) => void;
    isLoading: boolean;
}) => {
    return (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-2xs overflow-hidden">
            <div className="p-2 border-b border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between flex-wrap gap-2">
                <div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        Bazar Expenses Log
                    </h3>
                    <p className="text-xs text-zinc-500">
                        Detailed breakdown of all shopping items.
                    </p>
                </div>
                <Button
                    onClick={onAddNew}
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
                            <th className="p-1">SL</th>
                            <th className="p-1">Date</th>
                            <th className="p-1">Bazar Performed By</th>
                            <th className="p-1">Category</th>
                            <th className="p-1">Description</th>
                            <th className="p-1 text-right font-bold">Amount (৳)</th>
                            <th className="p-1 text-center font-bold">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60 text-zinc-800 dark:text-zinc-200">
                        {bazarExpenses.map((expense, index) => (
                            <tr key={expense?.bazarId} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors">
                                <td className="p-1 font-semibold text-zinc-700 dark:text-zinc-300 whitespace-nowrap">{index + 1}</td>
                                <td className="p-1 font-semibold text-zinc-700 dark:text-zinc-300 whitespace-nowrap">{expense.date}</td>
                                <td className="p-1 font-medium flex items-center gap-2.5">
                                    <Avatar className="h-7 w-7">
                                        <AvatarImage src={""} alt={expense.shopper?.fullName || ''} />
                                        <AvatarFallback>{expense.shopper?.fullName?.[0]}</AvatarFallback>
                                    </Avatar>
                                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">{expense.shopper?.fullName}</span>
                                </td>
                                <td className="p-1">
                                    <span className="whitespace-nowrap px-2 py-0.5 text-[10px] font-semibold rounded bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                                        {expense.category}
                                    </span>
                                </td>
                                <td className="p-1 max-w-xs truncate text-zinc-700 dark:text-zinc-300">{expense.itemsDescription}</td>
                                <td className="p-1 text-right font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                                    ৳{expense.amount.toLocaleString()}
                                </td>
                                <td className="p-1 text-center whitespace-nowrap">
                                    <div className="flex items-center justify-center gap-1">
                                        <button
                                            type="button"
                                            onClick={() => onUpdate?.(expense)}
                                            className="p-1 rounded text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950/50 cursor-pointer transition-colors"
                                            title="Edit Bazar Expense"
                                        >
                                            <Pencil size={14} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => onDelete?.(expense)}
                                            className="p-1 rounded text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 cursor-pointer transition-colors"
                                            title="Delete Bazar Expense"
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
                            <td colSpan={5} className="p-1">Expenses</td>
                            <td className="p-1 text-right text-teal-700 dark:text-teal-400 text-base font-extrabold">
                                ৳{_.sumBy(bazarExpenses, 'amount')}
                            </td>
                            <td colSpan={2} className="p-1 text-xs font-normal text-zinc-500">
                                ৳{(_.sumBy(bazarExpenses, 'amount') / (totalMealNumber || 1)).toFixed(2)} / meal
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
};