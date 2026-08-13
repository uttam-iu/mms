import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { USER_TYPE } from "@/types/user.types"
import { BazarExpense } from "@/types/meal.types"
import { ShoppingBag } from "lucide-react"
import React, { useEffect, useState } from "react"

export const AddBazarExpenceDialog = ({
    isAddBazarOpen,
    setIsAddBazarOpen,
    mealData,
    handleAddBazarSubmit,
    editingBazar,
}: {
    isAddBazarOpen: boolean;
    setIsAddBazarOpen: (open: boolean) => void;
    mealData: any;
    handleAddBazarSubmit: (e: React.FormEvent, newBazar: any, editingId?: string) => void;
    editingBazar?: BazarExpense | null;
}) => {
    const [newBazar, setNewBazar] = useState({
        shopperUserId: 1,
        itemsDescription: '',
        amount: '' as string | number,
        category: 'Groceries' as BazarExpense['category'],
        receiptNote: '',
    });

    useEffect(() => {
        if (editingBazar) {
            setNewBazar({
                shopperUserId: editingBazar.shopperUserId,
                itemsDescription: editingBazar.itemsDescription,
                amount: editingBazar.amount,
                category: editingBazar.category,
                receiptNote: editingBazar.receiptNote || '',
            });
        } else {
            const firstMemberId = mealData?.activeMembers?.[0]?.userId || 1;
            setNewBazar({
                shopperUserId: firstMemberId,
                itemsDescription: '',
                amount: '',
                category: 'Groceries',
                receiptNote: '',
            });
        }
    }, [editingBazar, isAddBazarOpen, mealData]);

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleAddBazarSubmit(e, newBazar, editingBazar?.id);
        setIsAddBazarOpen(false);
    };

    return (
        <Dialog open={isAddBazarOpen} onOpenChange={setIsAddBazarOpen}>
            <DialogContent className="sm:max-w-[420px]">
                <form onSubmit={onSubmit}>
                    <DialogHeader>
                        <DialogTitle className="text-sm font-bold flex items-center gap-2">
                            <ShoppingBag className="text-teal-600" size={16} />
                            {editingBazar ? 'Edit Bazar Expense' : 'Log New Bazar Expense'}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-3 py-3 text-xs">
                        <div>
                            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                                Shopper / Member
                            </label>
                            <select
                                value={newBazar.shopperUserId}
                                onChange={(e) => setNewBazar({ ...newBazar, shopperUserId: Number(e.target.value) })}
                                className="w-full h-8 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 text-xs"
                            >
                                {mealData.activeMembers.map((m: USER_TYPE) => (
                                    <option key={m.userId} value={m.userId}>
                                        {m.fullName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Category</label>
                            <select
                                value={newBazar.category}
                                onChange={(e) => setNewBazar({ ...newBazar, category: e.target.value as any })}
                                className="w-full h-8 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 text-xs"
                            >
                                <option value="Groceries">Groceries</option>
                                <option value="Meat & Fish">Meat & Fish</option>
                                <option value="Vegetables">Vegetables</option>
                                <option value="Spices & Cooking">Spices & Cooking</option>
                                <option value="Others">Others</option>
                            </select>
                        </div>

                        <div>
                            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Items Description</label>
                            <Input
                                placeholder="e.g. Rice 10kg, Chicken 2kg, Eggs"
                                value={newBazar.itemsDescription}
                                onChange={(e) => setNewBazar({ ...newBazar, itemsDescription: e.target.value })}
                                className="h-8 text-xs"
                                required
                            />
                        </div>

                        <div>
                            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Amount Spent (৳)</label>
                            <Input
                                type="number"
                                placeholder="e.g. 1450"
                                value={newBazar.amount}
                                onChange={(e) => setNewBazar({ ...newBazar, amount: e.target.value })}
                                className="h-8 text-xs"
                                required
                            />
                        </div>

                        <div>
                            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Memo / Note (Optional)</label>
                            <Input
                                placeholder="e.g. Receipt #104, Paid cash"
                                value={newBazar.receiptNote}
                                onChange={(e) => setNewBazar({ ...newBazar, receiptNote: e.target.value })}
                                className="h-8 text-xs"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" size="sm" onClick={() => setIsAddBazarOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" size="sm" className="bg-teal-700 hover:bg-teal-800 text-white">
                            {editingBazar ? 'Update Expense' : 'Add Expense'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};