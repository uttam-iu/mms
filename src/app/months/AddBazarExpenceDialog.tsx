import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { USER_TYPE } from "@/types/user.types"
import { ShoppingBag } from "lucide-react"
import React from "react"

export const AddBazarExpenceDialog = ({ isAddBazarOpen, setIsAddBazarOpen, mealData, handleAddBazarSubmit }: {
    isAddBazarOpen: boolean;
    setIsAddBazarOpen: (open: boolean) => void;
    mealData: any;
    handleAddBazarSubmit: (e: React.FormEvent, newBazar: any) => void;
}) => {

    const [newBazar, setNewBazar] = React.useState({
        shopperUserId: 1,
        itemsDescription: '',
        amount: '',
        category: 'Groceries' as const,
    });

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleAddBazarSubmit(e, newBazar);
        setNewBazar({ shopperUserId: 1, itemsDescription: '', amount: '', category: 'Groceries' });
        setIsAddBazarOpen(false);
    }

    return <Dialog open={isAddBazarOpen} onOpenChange={setIsAddBazarOpen}>
        <DialogContent className="sm:max-w-[420px]">
            <form onSubmit={onSubmit}>
                <DialogHeader>
                    <DialogTitle className="text-sm font-bold flex items-center gap-2">
                        <ShoppingBag className="text-teal-600" size={16} /> Log New Bazar Expense
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-3 py-3 text-xs">
                    <div>
                        <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Shopper / Member</label>
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
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" size="sm" onClick={() => setIsAddBazarOpen(false)}>
                        Cancel
                    </Button>
                    <Button type="submit" size="sm" className="bg-teal-700 hover:bg-teal-800 text-white">
                        Add Expense
                    </Button>
                </DialogFooter>
            </form>
        </DialogContent>
    </Dialog>
}