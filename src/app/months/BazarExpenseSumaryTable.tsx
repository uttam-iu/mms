import { Button } from "@/components/ui/button"
import { MonthlyMealData } from "@/types/meal.types"
import { Plus } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export const BazarwiseExpenseSummaryTable = ({ mealData, setIsAddBazarOpen }: { mealData: MonthlyMealData, setIsAddBazarOpen: (isOpen: boolean) => void }) => {

    return <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-2xs overflow-hidden">
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
                        <th className="p-1">SL</th>
                        <th className="p-1">Date</th>
                        <th className="p-1">Bazar Performed By</th>
                        <th className="p-1">Category</th>
                        <th className="p-1">Items / Details Description</th>
                        <th className="p-1 text-right font-bold">Amount (৳)</th>
                        <th className="p-1 min-w-[160px]">Memo / Note</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60 text-zinc-800 dark:text-zinc-200">
                    {mealData.bazarExpenses.map((expense, index) => (
                        <tr key={expense.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors">
                            <td className="p-1 font-semibold text-zinc-700 dark:text-zinc-300 whitespace-nowrap">{index + 1}</td>
                            <td className="p-1 font-semibold text-zinc-700 dark:text-zinc-300 whitespace-nowrap">{expense.date}</td>
                            <td className="p-1 font-medium flex items-center gap-2.5">
                                <Avatar className="h-7 w-7">
                                    <AvatarImage src={expense.shopperPhoto} alt={expense.shopperName} />
                                    <AvatarFallback>{expense.shopperName[0]}</AvatarFallback>
                                </Avatar>
                                <span className="font-semibold text-zinc-900 dark:text-zinc-100">{expense.shopperName}</span>
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
                            <td className="p-1 text-[11px] text-zinc-400 italic">{expense.receiptNote || 'N/A'}</td>
                        </tr>
                    ))}
                </tbody>
                <tfoot className="bg-zinc-100 dark:bg-zinc-800 font-bold border-t-2 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100">
                    <tr>
                        <td colSpan={5} className="p-1">TOTAL BAZAR EXPENSES</td>
                        <td className="p-1 text-right text-teal-700 dark:text-teal-400 text-base font-extrabold">
                            ৳{mealData.totalBazarCost.toLocaleString()}
                        </td>
                        <td className="p-1 text-xs font-normal text-zinc-500">{mealData.bazarExpenses.length} Total Receipts</td>
                    </tr>
                </tfoot>
            </table>
        </div>
    </div>
}