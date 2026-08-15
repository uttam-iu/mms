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
import { Utensils } from 'lucide-react';
import { MonthlyMealData } from '@/types/meal.types';
import { Avatar, AvatarBadge, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export const TotalMealDialog = ({ mealData, isOpen, onCancel }: { mealData: MonthlyMealData, isOpen: boolean, onCancel: () => void }) => {
    return <Dialog open={isOpen} onOpenChange={onCancel}>
        <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
                    <Utensils className="text-amber-600" size={20} /> Total Meals Consumed Breakdown
                </DialogTitle>
                {/* <DialogDescription className="text-xs">
                    Meal distribution per member in {mealData.monthName} {mealData.year}.
                </DialogDescription> */}
            </DialogHeader>
            <div className="space-y-3 py-2 text-xs">
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-center">
                    <span className="text-zinc-500 font-medium">Total House Meals</span>
                    <div className="text-2xl font-black text-amber-600 dark:text-amber-400">{mealData.totalMeals} Meals</div>
                </div>
                <div className="space-y-1.5 max-h-60 overflow-y-auto">
                    {/* {mealData.activeMembers.map((m) => (
                        <div key={m.userId} className="flex items-center justify-between p-2 rounded-lg border border-zinc-100 dark:border-zinc-800">
                            <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                    <AvatarImage src={m.photoUrl} alt={m.fullName} />
                                    <AvatarFallback>{m.fullName[0]}</AvatarFallback>
                                </Avatar>
                                <span className="font-semibold text-zinc-800 dark:text-zinc-200">{m.fullName}</span>
                            </div>
                            <span className="font-bold text-amber-600 dark:text-amber-400">{m.totalMeals} meals</span>
                        </div>
                    ))} */}
                </div>
            </div>
            <DialogFooter>
                <Button size="sm" onClick={onCancel}>Close</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
}