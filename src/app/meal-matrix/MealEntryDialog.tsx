import React from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { DailyMealEntry } from "@/types/meal.types";
import { Calendar } from "lucide-react";

interface MealEntryDialogProps {
    onCancel: () => void;
    refetch: () => void;
    row?: DailyMealEntry | null;
    type: 'EDIT' | 'ADD';
    year: string;
    month: string;
    activeMemberMeta: { userId: number; fullName: string }[];
}

export const MealEntryDialog: React.FC<MealEntryDialogProps> = ({
    onCancel,
    type,
    row,
    year,
    month,
    refetch,
    activeMemberMeta
}) => {
    // const [date, setDate] = useState('');
    // const [memberMealsState, setMemberMealsState] = useState<{
    //     [userId: number]: { breakfast: number; lunch: number; dinner: number; total: number }
    // }>({});

    // useEffect(() => {
    //     const initialMap: { [userId: number]: { breakfast: number; lunch: number; dinner: number; total: number } } = {};

    //     if (editingEntry) {
    //         setDate(editingEntry.date);
    //         mealData.activeMembers.forEach((m) => {
    //             const existing = editingEntry.memberMeals[m.userId] || { breakfast: 0, lunch: 0, dinner: 0, total: 0 };
    //             initialMap[m.userId] = { ...existing };
    //         });
    //     } else {
    //         const today = new Date().toISOString().split('T')[0];
    //         setDate(today);
    //         mealData.activeMembers.forEach((m) => {
    //             initialMap[m.userId] = { breakfast: 0.5, lunch: 1, dinner: 1, total: 2.5 };
    //         });
    //     }
    //     setMemberMealsState(initialMap);
    // }, [editingEntry, isOpen, mealData.activeMembers]);

    // const handleCountChange = (userId: number, field: 'breakfast' | 'lunch' | 'dinner', value: number) => {
    //     setMemberMealsState((prev) => {
    //         const current = prev[userId] || { breakfast: 0, lunch: 0, dinner: 0, total: 0 };
    //         const updatedField = Math.max(0, value);
    //         const updated = { ...current, [field]: updatedField };
    //         updated.total = (updated.breakfast || 0) + (updated.lunch || 0) + (updated.dinner || 0);
    //         return { ...prev, [userId]: updated };
    //     });
    // };

    // const handleSubmit = (e: React.FormEvent) => {
    //     e.preventDefault();
    //     if (!date) return;
    //     onSubmit(date, memberMealsState);
    //     onClose();
    // };

    const [loading, setLoading] = React.useState(false)

    const [formData, setFormData] = React.useState({
        date: row?.date || '',
        memberMeals: row?.memberMeals || activeMemberMeta.map((m) => {
            return {
                userId: m.userId,
                fullName: m.fullName,
                breakfast: 0.5,
                lunch: 1,
                dinner: 1,
            }
        }),
        year,
        month
    })

    // useEffect(() => {
    //     if (row) {
    //         setFormData((prev) => ({
    //             ...prev,
    //             billId: row?.billId || '',
    //             billTitle: row?.billTitle || '',
    //             category: row.category,
    //             amount: row.amount.toString(),
    //             description: row.description ?? '',
    //             year: row?.year,
    //             month: row?.month,
    //         }));
    //     }
    // }, [row]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log(formData)
        // const numAmount = parseFloat(String(formData.amount));
        // if (!formData?.billTitle.trim() || isNaN(numAmount) || numAmount <= 0) return;

        // const socket = getSocket()
        // setLoading(true)
        // socket?.emit('meal_update', { ...formData, amount: parseFloat(formData.amount) || 0 }, (res: ApiResponse<DailyMealEntry>) => {
        //     if (res?.success) {
        //         showToast(res?.message, 'success')
        //         setLoading(false)
        //         refetch()
        //         onCancel()
        //     } else {
        //         showToast(res?.message, 'error')
        //         setLoading(false)
        //     }
        // })
    };


    return (
        <Dialog open>
            <DialogContent className="sm:max-w-[520px] max-h-[85vh] overflow-y-auto custom-scrollbar">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle className="text-sm font-bold flex items-center gap-2">
                            <Calendar className="text-teal-600" size={16} />
                            {row ? `Edit Daily Meal Matrix (${row.date})` : 'Record Daily Meals'}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-3 text-xs">
                        <div>
                            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                                Date
                            </label>
                            <Input
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                                className="h-8 text-xs bg-white dark:bg-zinc-900"
                                required
                                disabled={!!row}
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="block font-bold text-zinc-800 dark:text-zinc-200 border-b pb-1">
                                Member Meal Breakdown (Breakfast / Lunch / Dinner)
                            </label>

                            {/* {activeMemberMeta.map((m) => {
                                const mMeal = formData.memberMeals[m.userId] || { breakfast: 0, lunch: 0, dinner: 0, total: 0 };
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
                            })} */}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
                            Cancel
                        </Button>
                        <Button type="submit" size="sm" className="bg-teal-700 hover:bg-teal-800 text-white">
                            {row ? 'Update Meal Matrix' : 'Save Meal Entry'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
