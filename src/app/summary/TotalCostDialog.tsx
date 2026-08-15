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
import { DollarSign } from 'lucide-react';
import { MonthlyMealData } from '@/types/meal.types';

export const TotalCostDialog = ({ mealData, isOpen, onCancel }: { mealData: MonthlyMealData, isOpen: boolean, onCancel: () => void }) => {
    return <Dialog open={isOpen} onOpenChange={onCancel}>
        <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
                    <DollarSign className="text-teal-600" size={20} /> Total House Cost Breakdown
                </DialogTitle>
                {/* <DialogDescription className="text-xs">
                    Complete cost breakdown for {mealData.monthName} {mealData.year}.
                </DialogDescription> */}
            </DialogHeader>
            <div className="space-y-4 py-2 text-xs">
                <div className="p-4 rounded-xl bg-teal-50/60 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 flex items-center justify-between">
                    <div>
                        <span className="text-zinc-500 font-medium">Grand Total Expenditure</span>
                        <div className="text-2xl font-black text-teal-700 dark:text-teal-300">
                            ৳{mealData.totalGrossCost.toLocaleString()}
                        </div>
                    </div>
                    <div className="text-right text-zinc-400 text-[11px]">
                        <div>Bazar: {((mealData.totalBazarCost / (mealData.totalGrossCost || 1)) * 100).toFixed(0)}%</div>
                        <div>Extra: {((mealData.totalExtraCost / (mealData.totalGrossCost || 1)) * 100).toFixed(0)}%</div>
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800">
                        <span className="font-semibold text-zinc-800 dark:text-zinc-200">1. Total Bazar Shopping Expenses</span>
                        <span className="font-bold text-zinc-900 dark:text-zinc-100">৳{mealData.totalBazarCost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800">
                        <span className="font-semibold text-zinc-800 dark:text-zinc-200">2. Fixed Utility Bills & Cook Salary</span>
                        <span className="font-bold text-zinc-900 dark:text-zinc-100">৳{mealData.totalExtraCost.toLocaleString()}</span>
                    </div>
                </div>
            </div>
            <DialogFooter>
                <Button size="sm" onClick={onCancel}>Close</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
}