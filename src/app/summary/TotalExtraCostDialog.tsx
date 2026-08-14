'use client';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Receipt } from 'lucide-react';
import { MonthlyMealData } from '@/types/meal.types';

export const TotalExtraCostDialog = ({ mealData, isOpen, onCancel }: { mealData: MonthlyMealData, isOpen: boolean, onCancel: () => void }) => {
    return <Dialog open={isOpen} onOpenChange={onCancel}>
        <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
                    <Receipt className="text-purple-600" size={20} /> Shared Extra & Utility Bills Breakdown
                </DialogTitle>
                <DialogDescription className="text-xs">
                    Itemized list of fixed house expenses.
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-2 py-2 text-xs">
                {mealData.extraExpenses.map((exp, index) => (
                    <div key={index} className="flex justify-between items-center p-2.5 rounded-lg border border-zinc-100 dark:border-zinc-800">
                        <div>
                            <div className="font-semibold text-zinc-800 dark:text-zinc-200">{exp.billTitle}</div>
                            <div className="text-[10px] text-zinc-400">{exp.category}</div>
                        </div>
                        <span className="font-bold text-purple-600 dark:text-purple-400">৳{exp.amount.toLocaleString()}</span>
                    </div>
                ))}
                <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950/40 font-bold flex justify-between">
                    <span>Per Member Equal Share</span>
                    <span className="text-purple-600 dark:text-purple-400">৳{(mealData.totalExtraCost / (mealData.activeMembers.length || 1)).toFixed(2)}</span>
                </div>
            </div>
            <DialogFooter>
                <Button size="sm" onClick={onCancel}>Close</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
}