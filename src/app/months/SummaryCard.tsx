import { MonthlyMealData } from "@/types/meal.types"
import { ArrowDownRight, ArrowUpRight, DollarSign, PiggyBank, Receipt, ShoppingBag, TrendingUp, Users, Utensils, Wallet } from "lucide-react"

export const SummaryCard = ({ mealData, setActiveCardDialog }: { mealData: MonthlyMealData, setActiveCardDialog: (dialog: 'totalCost' | 'totalMeal' | 'mealRate' | 'totalExtra' | 'bazarCost' | 'deposits' | 'netBalance') => void }) => {

    const SUMMARY_CARD_DATA = [
        {
            title: 'Total House Cost',
            icon: <DollarSign size={16} />,
            bgIcon: <DollarSign size={54} className="text-teal-600 dark:text-teal-400" />,
            value: `৳${mealData.totalGrossCost.toLocaleString()}`,
            footerleft: <span>Bazar: ৳{mealData.totalBazarCost.toLocaleString()}</span>,
            footerRight: <span>Extra: ৳{mealData.totalExtraCost.toLocaleString()}</span>,
            iconBgColor: 'bg-teal-50 dark:bg-teal-950/60',
            iconColor: 'text-teal-700 dark:text-teal-400',
            onClick: () => setActiveCardDialog('totalCost'),
            hoverBorderColor: 'hover:border-teal-500 dark:hover:border-teal-500',
        },
        {
            onClick: () => setActiveCardDialog('totalMeal'),
            bgIcon: <Utensils size={54} className="text-amber-600 dark:text-amber-400" />,
            title: 'Total Meals Consumed',
            icon: <Utensils size={16} />,
            iconBgColor: 'bg-amber-50 dark:bg-amber-950/60',
            iconColor: 'text-amber-700 dark:text-amber-400',
            value: <div>{mealData.totalMeals} <span className="text-xs font-normal text-zinc-500">meals</span></div>,
            footerleft: <span>{mealData.activeMembers.length} Active Members</span>,
            footerRight: <span>Avg: {(mealData.totalMeals / (mealData.activeMembers.length || 1)).toFixed(1)} / user</span>,
            hoverBorderColor: 'hover:border-amber-500 dark:hover:border-amber-500',
        },
        {
            onClick: () => setActiveCardDialog('mealRate'),
            bgIcon: <TrendingUp size={54} className="text-emerald-600 dark:text-emerald-400" />,
            title: 'Current Meal Rate',
            icon: <TrendingUp size={16} />,
            iconBgColor: 'bg-emerald-50 dark:bg-emerald-950/60',
            iconColor: 'text-emerald-700 dark:text-emerald-400',
            value: <div>৳{mealData.mealRate} <span className="text-xs font-normal text-zinc-500">/ meal</span></div>,
            footerleft: <span>Formula: Bazar ÷ Meals</span>,
            // footerRight: <span className="text-teal-600 dark:text-teal-400 font-medium">View Breakdown &rarr;</span>,
            hoverBorderColor: 'hover:border-emerald-500 dark:hover:border-emerald-500',
        },
        {
            onClick: () => setActiveCardDialog('totalExtra'),
            bgIcon: <Receipt size={54} className="text-purple-600 dark:text-purple-400" />,
            title: 'Total Fixed / Extra Bills',
            icon: <Receipt size={16} />,
            iconBgColor: 'bg-purple-50 dark:bg-purple-950/60',
            iconColor: 'text-purple-700 dark:text-purple-400',
            value: <div>৳{mealData.totalExtraCost.toLocaleString()}</div>,
            footerleft: <span>Per Head: ৳{(mealData.totalExtraCost / (mealData.activeMembers.length || 1)).toFixed(0)}</span>,
            footerRight: <span>{mealData.extraExpenses.length} Items</span>,
            hoverBorderColor: 'hover:border-purple-500 dark:hover:border-purple-500',
        },

    ]

    return <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {SUMMARY_CARD_DATA?.map((sCard, sIndex) => (
            <div
                key={sIndex + sCard?.title}
                onClick={sCard?.onClick}
                className={`group bg-white dark:bg-zinc-900 rounded-xl p-4 border border-zinc-200/80 dark:border-zinc-800 shadow-2xs hover:shadow-md transition-all cursor-pointer relative overflow-hidden ${sCard?.hoverBorderColor}`}
            >
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    {sCard?.bgIcon}
                </div>
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">{sCard?.title}</span>
                    <span className={`${sCard?.iconBgColor} ${sCard?.iconColor}  p-1.5 rounded-lg group-hover:scale-110 transition-transform`}>
                        {sCard?.icon}
                    </span>
                </div>
                <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100">
                    {sCard?.value}
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-500 border-t border-zinc-100 dark:border-zinc-800/80 pt-2">
                    {sCard?.footerleft}
                    {sCard?.footerRight}
                </div>
            </div>))}



        {/* Card 5: Total Bazar Cost */}
        <div
            onClick={() => setActiveCardDialog('bazarCost')}
            className="group bg-white dark:bg-zinc-900 rounded-xl p-4 border border-zinc-200/80 dark:border-zinc-800 hover:border-blue-500 dark:hover:border-blue-500 shadow-2xs hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
        >
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Total Bazar Expenses</span>
                <span className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 group-hover:scale-110 transition-transform">
                    <ShoppingBag size={16} />
                </span>
            </div>
            <div className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                ৳{mealData.totalBazarCost.toLocaleString()}
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">
                {mealData.bazarExpenses.length} shopping entries in {mealData.monthName}
            </p>
        </div>

        {/* Card 6: Total Deposits */}
        <div
            onClick={() => setActiveCardDialog('deposits')}
            className="group bg-white dark:bg-zinc-900 rounded-xl p-4 border border-zinc-200/80 dark:border-zinc-800 hover:border-cyan-500 dark:hover:border-cyan-500 shadow-2xs hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
        >
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Deposits Collected</span>
                <span className="p-1.5 rounded-lg bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-400 group-hover:scale-110 transition-transform">
                    <PiggyBank size={16} />
                </span>
            </div>
            <div className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                ৳{mealData.totalDeposits.toLocaleString()}
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">
                Total advance money deposited by members
            </p>
        </div>

        {/* Card 7: Net Balance */}
        <div
            onClick={() => setActiveCardDialog('netBalance')}
            className={`group bg-white dark:bg-zinc-900 rounded-xl p-4 border shadow-2xs hover:shadow-md transition-all cursor-pointer relative overflow-hidden ${mealData.netBalance >= 0
                ? 'border-emerald-200 dark:border-emerald-800/80 hover:border-emerald-500'
                : 'border-rose-200 dark:border-rose-800/80 hover:border-rose-500'
                }`}
        >
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">House Cash Balance</span>
                <span
                    className={`p-1.5 rounded-lg ${mealData.netBalance >= 0
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                        : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400'
                        }`}
                >
                    <Wallet size={16} />
                </span>
            </div>
            <div
                className={`text-xl font-bold flex items-center gap-1 ${mealData.netBalance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                    }`}
            >
                {mealData.netBalance >= 0 ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                ৳{Math.abs(mealData.netBalance).toLocaleString()}
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">
                {mealData.netBalance >= 0 ? 'Surplus Cash in Fund' : 'Deficit / Pending Payments'}
            </p>
        </div>

        {/* Card 8: Quick Action Card */}
        <div className="bg-gradient-to-br from-teal-700 to-teal-900 text-white rounded-xl p-4 flex flex-col justify-between shadow-sm">
            <div>
                <div className="flex items-center gap-1.5 text-xs font-medium text-teal-200">
                    <Users size={14} /> Active House Members
                </div>
                <div className="text-2xl font-black mt-1">{mealData.activeMembers.length} Members</div>
            </div>
            <div className="flex items-center justify-between text-xs text-teal-100 border-t border-teal-600/60 pt-2 mt-2">
                <span>{mealData.monthName} Status</span>
                <span className="font-semibold px-2 py-0.5 rounded bg-teal-800 text-teal-100 text-[10px]">
                    Active Month
                </span>
            </div>
        </div>
    </div>
}