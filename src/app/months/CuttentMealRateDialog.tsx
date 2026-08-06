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
import { TrendingUp } from 'lucide-react';
import { MonthlyMealData } from '@/types/meal.types';

export const CuttentMealRateDialog = ({ mealData, isOpen, onCancel }: { mealData: MonthlyMealData, isOpen: boolean, onCancel: () => void }) => {
    return <Dialog open={isOpen} onOpenChange={onCancel}>
        <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
                    <TrendingUp className="text-emerald-600" size={20} /> Meal Rate Calculation Formula
                </DialogTitle>
                <DialogDescription className="text-xs">
                    Mathematical calculation of the meal rate for {mealData.monthName} {mealData.year}.
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2 text-xs">
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 font-mono text-center">
                    <div className="text-xs text-zinc-500 mb-1">Formula</div>
                    <div className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                        Meal Rate = Total Bazar Expenses &divide; Total Meals
                    </div>
                    <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-2">
                        ৳{mealData.totalBazarCost.toLocaleString()} &divide; {mealData.totalMeals} = ৳{mealData.mealRate} / meal
                    </div>
                </div>
                <div className="space-y-2 text-zinc-600 dark:text-zinc-400">
                    <p>&bull; <strong>Bazar Shopping Total:</strong> ৳{mealData.totalBazarCost.toLocaleString()}</p>
                    <p>&bull; <strong>Total Meals Consumed:</strong> {mealData.totalMeals} meals</p>
                    <p>&bull; <strong>Effective Cost Per Meal:</strong> ৳{mealData.mealRate}</p>
                </div>
            </div>
            <DialogFooter>
                <Button size="sm" onClick={onCancel}>Close</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
}