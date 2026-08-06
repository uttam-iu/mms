import { Calendar, PiggyBank, Receipt, ShoppingBag, Users } from "lucide-react"
import { MonthlyMealData } from "@/types/meal.types"

interface TAB_TYPE {
    key: 'datewise' | 'personwise' | 'bazar' | 'deposits' | 'extra',
    label: React.ReactNode
}

export const SummaryTabs = ({ setActiveTab, mealData, activeTab }: { setActiveTab: (tab: 'datewise' | 'personwise' | 'bazar' | 'deposits' | 'extra') => void, mealData: MonthlyMealData, activeTab: 'datewise' | 'personwise' | 'bazar' | 'deposits' | 'extra' }) => {
    const TAB_DATA: TAB_TYPE[] = [
        {
            key: 'personwise',
            label: <div className="flex items-center gap-1.5"><Users size={14} /> Member Summary Table</div>,
        },
        {
            key: 'datewise',
            label: <div className="flex items-center gap-1.5"><Calendar size={14} /> Date-Wise Meal Matrix</div>,
        },
        {
            key: 'bazar',
            label: <div className="flex items-center gap-1.5"><ShoppingBag size={14} /> Bazar Expenses ({mealData.bazarExpenses.length})</div>,
        },
        {
            key: 'deposits',
            label: <div className="flex items-center gap-1.5"><PiggyBank size={14} /> Deposits Log ({mealData.deposits.length})</div>,
        },
        {
            key: 'extra',
            label: <div className="flex items-center gap-1.5"><Receipt size={14} /> Fixed Utilities ({mealData.extraExpenses.length})</div>,
        },
    ]

    return (
        <div className="border-b border-zinc-200 dark:border-zinc-800 pb-2">
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-1 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800 max-h-48 md:max-h-none overflow-y-auto overflow-x-auto custom-scrollbar">
                {TAB_DATA?.map((tab: TAB_TYPE) => (
                    <button
                        type="button"
                        key={tab?.key}
                        onClick={() => setActiveTab(tab?.key)}
                        className={`text-nowrap px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center justify-start md:justify-center gap-1.5 shrink-0 ${activeTab === tab?.key
                            ? 'bg-white dark:bg-zinc-800 text-teal-700 dark:text-teal-400 shadow-xs'
                            : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                            }`}
                    >
                        {tab?.label}
                    </button>
                ))}
            </div>
        </div>
    )
}
