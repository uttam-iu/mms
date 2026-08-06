import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { MonthlyMealData } from "@/types/meal.types"

export const MemberDepositLogTable = ({ mealData, setIsAddDepositOpen }: { mealData: MonthlyMealData, setIsAddDepositOpen: (isOpen: boolean) => void }) => {

    return <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-2xs overflow-hidden">
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
                        <th className="p-1">SL</th>
                        <th className="p-1">Date</th>
                        <th className="p-1">Member Name</th>
                        <th className="p-1">Payment Method</th>
                        <th className="p-1">Transaction ID / Reference</th>
                        <th className="p-1 text-right font-bold">Deposit Amount (৳)</th>
                        <th className="p-1">Notes</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60 text-zinc-800 dark:text-zinc-200">
                    {mealData.deposits.map((dep, index) => (
                        <tr key={dep.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors">
                            <td className="p-1 font-semibold text-zinc-700 dark:text-zinc-300">{index + 1}</td>
                            <td className="whitespace-nowrap p-1 font-semibold text-zinc-700 dark:text-zinc-300">{dep.date}</td>
                            <td className="p-1 font-bold text-zinc-900 dark:text-zinc-100">{dep.userName}</td>
                            <td className="p-1">
                                <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-emerald-50 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                    {dep.paymentMethod}
                                </span>
                            </td>
                            <td className="p-1 text-zinc-500 font-mono text-[11px]">{dep.transactionId || 'N/A'}</td>
                            <td className="p-1 text-right font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                                ৳{dep.amount.toLocaleString()}
                            </td>
                            <td className="p-1 text-[11px] text-zinc-400">{dep.note || '-'}</td>
                        </tr>
                    ))}
                </tbody>
                <tfoot className="bg-zinc-100 dark:bg-zinc-800 font-bold border-t-2 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100">
                    <tr>
                        <td colSpan={5} className="p-1">TOTAL DEPOSITS RECEIVED</td>
                        <td className="p-1 text-right text-emerald-600 dark:text-emerald-400 text-base font-extrabold">
                            ৳{mealData.totalDeposits.toLocaleString()}
                        </td>
                        <td className="p-1 text-xs font-normal text-zinc-500">{mealData.deposits.length} Payments</td>
                    </tr>
                </tfoot>
            </table>
        </div>
    </div>
}