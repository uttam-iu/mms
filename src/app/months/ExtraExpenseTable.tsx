import { MonthlyMealData } from "@/types/meal.types"

export const ExtraExpenseTable = ({ mealData }: { mealData: MonthlyMealData }) => {

    return <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-2xs overflow-hidden">
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
                        <th className="p-1">SL</th>
                        <th className="p-1">Bill Title</th>
                        <th className="p-1">Category</th>
                        <th className="p-1">Description</th>
                        <th className="p-1 text-right font-bold">Total Bill (৳)</th>
                        <th className="p-1 text-right font-bold text-purple-600 dark:text-purple-400">Per Head Share (৳)</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60 text-zinc-800 dark:text-zinc-200">
                    {mealData.extraExpenses.map((item, index) => (
                        <tr key={item.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors">
                            <td className="p-1 font-semibold text-zinc-700 dark:text-zinc-300">{index + 1}</td>
                            <td className="p-1 font-bold text-zinc-900 dark:text-zinc-100">{item.title}</td>
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
                                ৳{(item.amount / (mealData.activeMembers.length || 1)).toFixed(2)}
                            </td>
                        </tr>
                    ))}
                </tbody>
                <tfoot className="bg-zinc-100 dark:bg-zinc-800 font-bold border-t-2 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100">
                    <tr>
                        <td colSpan={4} className="p-1">TOTAL FIXED EXTRA BILLS</td>
                        <td className="p-1 text-right text-purple-600 dark:text-purple-400 text-base font-extrabold">
                            ৳{mealData.totalExtraCost.toLocaleString()}
                        </td>
                        <td className="p-1 text-right text-purple-600 dark:text-purple-400 font-extrabold">
                            ৳{(mealData.totalExtraCost / (mealData.activeMembers.length || 1)).toFixed(2)} / member
                        </td>
                    </tr>
                </tfoot>
            </table>
        </div>
    </div>
}