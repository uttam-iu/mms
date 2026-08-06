import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MonthlyMealData } from "@/types/meal.types"

export const PersonwiseSummaryTable = ({ mealData }: { mealData: MonthlyMealData }) => {

    return <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-2xs overflow-hidden">
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
                        <th className="p-1 whitespace-nowrap">SL</th>
                        <th className="p-1 whitespace-nowrap">Member Name</th>
                        <th className="p-1 text-center whitespace-nowrap">Meals Consumed</th>
                        <th className="p-1 text-right whitespace-nowrap">Meal Cost (৳)</th>
                        <th className="p-1 text-right whitespace-nowrap">Fixed Extra Share (৳)</th>
                        <th className="p-1 text-right font-bold whitespace-nowrap">Gross Total Cost (৳)</th>
                        <th className="p-1 text-right text-emerald-600 dark:text-emerald-400 whitespace-nowrap">Total Deposit (৳)</th>
                        <th className="p-1 text-right font-bold whitespace-nowrap">Net Balance (৳)</th>
                        <th className="p-1 text-center whitespace-nowrap">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60 text-zinc-800 dark:text-zinc-200">
                    {mealData.activeMembers.map((member, index) => (
                        <tr key={member.userId} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors">
                            <td className="p-1">{index + 1}</td>
                            <td className="p-1 font-medium flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={member?.photoUrl || ''} alt={member.fullName} />
                                    <AvatarFallback>{member.fullName[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="font-semibold text-zinc-900 dark:text-zinc-100">{member.fullName}</div>
                                    <div className="text-[10px] text-zinc-400">{member.phone}</div>
                                </div>
                            </td>
                            <td className="p-1 text-center font-bold">
                                <span className="px-2.5 py-1 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold border border-amber-200 dark:border-amber-800">
                                    {member.totalMeals}
                                </span>
                            </td>
                            <td className="p-1 text-right">৳{member.mealCost.toLocaleString()}</td>
                            <td className="p-1 text-right">৳{member.extraShare.toLocaleString()}</td>
                            <td className="p-1 text-right font-bold text-zinc-900 dark:text-zinc-100">
                                ৳{member.grossTotalCost.toLocaleString()}
                            </td>
                            <td className="p-1 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                                ৳{member.totalDeposit.toLocaleString()}
                            </td>
                            <td className="p-1 text-right font-bold">
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
                            <td className="p-1 text-center">
                                {member.status === 'paid' && (
                                    <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                                        Settled
                                    </span>
                                )}
                                {member.status === 'excess' && (
                                    <span className="whitespace-nowrap px-2 py-0.5 text-[11px] font-semibold rounded-full bg-cyan-100 text-cyan-800 dark:bg-cyan-950/80 dark:text-cyan-300">
                                        Cash Back (+৳{member.netBalance})
                                    </span>
                                )}
                                {member.status === 'due' && (
                                    <span className="whitespace-nowrap px-2 py-0.5 text-[11px] font-semibold rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300">
                                        Due (-৳{Math.abs(member.netBalance)})
                                    </span>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
                <tfoot className="bg-zinc-100 dark:bg-zinc-800 font-bold border-t-2 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100">
                    <tr>
                        <td className="p-1"></td>
                        <td className="p-1">TOTAL HOUSE SUMMARY</td>
                        <td className="p-1 text-center text-amber-700 dark:text-amber-400">{mealData.totalMeals} meals</td>
                        <td className="p-1 text-right">৳{mealData.totalBazarCost.toLocaleString()}</td>
                        <td className="p-1 text-right">৳{mealData.totalExtraCost.toLocaleString()}</td>
                        <td className="p-1 text-right text-teal-700 dark:text-teal-400">
                            ৳{mealData.totalGrossCost.toLocaleString()}
                        </td>
                        <td className="p-1 text-right text-emerald-600 dark:text-emerald-400">
                            ৳{mealData.totalDeposits.toLocaleString()}
                        </td>
                        <td className="p-1 text-right">
                            <span style={{ whiteSpace: 'nowrap' }} className={mealData.netBalance >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                                {mealData.netBalance >= 0 ? `+৳${mealData.netBalance.toLocaleString()}` : `-৳${Math.abs(mealData.netBalance).toLocaleString()}`}
                            </span>
                        </td>
                        <td className="p-1 text-center text-xs font-normal text-zinc-500">Rate: ৳{mealData.mealRate}</td>
                    </tr>
                </tfoot>
            </table>
        </div>
    </div>
}