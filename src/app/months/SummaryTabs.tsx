import React from "react";
import { Calendar, PiggyBank, Receipt, ShoppingBag, Users } from "lucide-react";
import { MonthlyMealData } from "@/types/meal.types";
import { useRouter, useSearchParams } from "next/navigation";

export type TabKey = 'datewise' | 'personwise' | 'bazar' | 'deposits' | 'extra';

export interface TabItemConfig {
    key: TabKey;
    labelStr: string;
    icon: React.ReactNode;
}

export const getTabConfigList = (mealData: MonthlyMealData): TabItemConfig[] => [
    {
        key: 'personwise',
        labelStr: 'Member Summary',
        icon: <Users size={14} />,
    },
    {
        key: 'datewise',
        labelStr: 'Date-Wise Meal Matrix',
        icon: <Calendar size={14} />,
    },
    {
        key: 'bazar',
        labelStr: `Bazar Expenses (${mealData?.bazarExpenses?.length || 0})`,
        icon: <ShoppingBag size={14} />,
    },
    {
        key: 'extra',
        labelStr: `Fixed Utilities (${mealData?.extraExpenses?.length || 0})`,
        icon: <Receipt size={14} />,
    },
];

export const SummaryTabs = ({
    setActiveTab,
    mealData,
    activeTab,
}: {
    setActiveTab: (tab: TabKey) => void;
    mealData: MonthlyMealData;
    activeTab: TabKey;
}) => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const tabs = getTabConfigList(mealData);

    const handleTabClick = (key: TabKey) => {
        setActiveTab(key);
        const params = new URLSearchParams(searchParams.toString());
        params.set('tab', key);
        router.push(`?${params.toString()}`);
    };

    return (
        <div className="border-b border-zinc-200 dark:border-zinc-800 pb-2 w-full min-w-0 overflow-hidden">
            <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-x-auto min-w-0 w-full custom-scrollbar">
                {tabs.map((tab) => (
                    <button
                        type="button"
                        key={tab.key}
                        onClick={() => handleTabClick(tab.key)}
                        className={`text-nowrap px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5 shrink-0 ${activeTab === tab.key
                            ? 'bg-white dark:bg-zinc-800 text-teal-700 dark:text-teal-400 shadow-xs'
                            : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                            }`}
                    >
                        {tab.icon}
                        {tab.labelStr}
                    </button>
                ))}
            </div>
        </div>
    );
};
