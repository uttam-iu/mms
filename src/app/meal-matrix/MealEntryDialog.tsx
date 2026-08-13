import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { MonthlyMealData, DailyMealEntry } from "@/types/meal.types";
import { Calendar } from "lucide-react";

interface MealEntryDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (date: string, memberMeals: { [userId: number]: { breakfast: number; lunch: number; dinner: number; total: number } }) => void;
    mealData: MonthlyMealData;
    editingEntry?: DailyMealEntry | null;
}

export const MealEntryDialog: React.FC<MealEntryDialogProps> = ({
    isOpen,
    onClose,
    onSubmit,
    mealData,
    editingEntry,
}) => {
    const [date, setDate] = useState('');
    const [memberMealsState, setMemberMealsState] = useState<{
        [userId: number]: { breakfast: number; lunch: number; dinner: number; total: number }
    }>({});

    useEffect(() => {
        const initialMap: { [userId: number]: { breakfast: number; lunch: number; dinner: number; total: number } } = {};

        if (editingEntry) {
            setDate(editingEntry.date);
            mealData.activeMembers.forEach((m) => {
                const existing = editingEntry.memberMeals[m.userId] || { breakfast: 0, lunch: 0, dinner: 0, total: 0 };
                initialMap[m.userId] = { ...existing };
            });
        } else {
            const today = new Date().toISOString().split('T')[0];
            setDate(today);
            mealData.activeMembers.forEach((m) => {
                initialMap[m.userId] = { breakfast: 0.5, lunch: 1, dinner: 1, total: 2.5 };
            });
        }
        setMemberMealsState(initialMap);
    }, [editingEntry, isOpen, mealData.activeMembers]);

    const handleCountChange = (userId: number, field: 'breakfast' | 'lunch' | 'dinner', value: number) => {
        setMemberMealsState((prev) => {
            const current = prev[userId] || { breakfast: 0, lunch: 0, dinner: 0, total: 0 };
            const updatedField = Math.max(0, value);
            const updated = { ...current, [field]: updatedField };
            updated.total = (updated.breakfast || 0) + (updated.lunch || 0) + (updated.dinner || 0);
            return { ...prev, [userId]: updated };
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!date) return;
        onSubmit(date, memberMealsState);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[520px] max-h-[85vh] overflow-y-auto custom-scrollbar">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle className="text-sm font-bold flex items-center gap-2">
                            <Calendar className="text-teal-600" size={16} />
                            {editingEntry ? `Edit Daily Meal Matrix (${editingEntry.date})` : 'Record Daily Meals'}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-3 text-xs">
                        <div>
                            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                                Target Date
                            </label>
                            <Input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="h-8 text-xs bg-white dark:bg-zinc-900"
                                required
                                disabled={!!editingEntry}
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="block font-bold text-zinc-800 dark:text-zinc-200 border-b pb-1">
                                Member Meal Breakdown (Breakfast / Lunch / Dinner)
                            </label>

                            {mealData.activeMembers.map((m) => {
                                const mMeal = memberMealsState[m.userId] || { breakfast: 0, lunch: 0, dinner: 0, total: 0 };
                                return (
                                    <div
                                        key={m.userId}
                                        className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2"
                                    >
                                        <div className="flex items-center justify-between font-bold text-zinc-900 dark:text-zinc-100">
                                            <span>{m.fullName}</span>
                                            <span className="text-teal-600 dark:text-teal-400 text-xs">
                                                Total: {mMeal.total} meals
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-3 gap-2">
                                            <div>
                                                <label className="block text-[10px] text-zinc-500 font-semibold mb-0.5">
                                                    Breakfast
                                                </label>
                                                <Input
                                                    type="number"
                                                    step="0.5"
                                                    min="0"
                                                    value={mMeal.breakfast}
                                                    onChange={(e) => handleCountChange(m.userId, 'breakfast', parseFloat(e.target.value) || 0)}
                                                    className="h-7 text-xs bg-white dark:bg-zinc-950"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] text-zinc-500 font-semibold mb-0.5">
                                                    Lunch
                                                </label>
                                                <Input
                                                    type="number"
                                                    step="0.5"
                                                    min="0"
                                                    value={mMeal.lunch}
                                                    onChange={(e) => handleCountChange(m.userId, 'lunch', parseFloat(e.target.value) || 0)}
                                                    className="h-7 text-xs bg-white dark:bg-zinc-950"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] text-zinc-500 font-semibold mb-0.5">
                                                    Dinner
                                                </label>
                                                <Input
                                                    type="number"
                                                    step="0.5"
                                                    min="0"
                                                    value={mMeal.dinner}
                                                    onChange={(e) => handleCountChange(m.userId, 'dinner', parseFloat(e.target.value) || 0)}
                                                    className="h-7 text-xs bg-white dark:bg-zinc-950"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" size="sm" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" size="sm" className="bg-teal-700 hover:bg-teal-800 text-white">
                            {editingEntry ? 'Update Meal Matrix' : 'Save Meal Entry'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
