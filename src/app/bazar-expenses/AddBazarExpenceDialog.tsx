import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ApiResponse } from "@/types/user.types"
import { BazarExpense } from "@/types/meal.types"
import { ShoppingBag } from "lucide-react"
import React, { useEffect } from "react"
import { getSocket } from "@/lib/socket"
import { showToast } from "@/lib/utils"

interface BazarExpenseUpdate {
    bazarId?: string;
    date: string;
    shopperUserId: string | number;
    itemsDescription: string;
    amount: string | number;
    category: 'Groceries' | 'Vegetables' | 'Meat & Fish' | 'Spices & Cooking' | 'Others';
    year: string;
    month: string;
}

export const AddBazarExpenceDialog = ({
    onCancel,
    type,
    row,
    year,
    month,
    refetch,
    activeMemberMeta
}: {
    onCancel: () => void;
    refetch: () => void;
    row?: BazarExpense | null;
    type: 'EDIT' | 'ADD';
    year: string;
    month: string;
    activeMemberMeta: { label: string, value: string }[] | []
}) => {

    const [loading, setLoading] = React.useState(false);

    const [formData, setFormData] = React.useState<BazarExpenseUpdate>({
        shopperUserId: activeMemberMeta?.[0]?.value || '',
        itemsDescription: '',
        date: '',
        amount: '',
        category: 'Groceries',
        year,
        month
    });

    useEffect(() => {
        if (row) {
            setFormData({
                bazarId: row?.bazarId || row?.id || '',
                shopperUserId: row?.shopper?.userId !== undefined ? row.shopper.userId.toString() : (row?.shopperUserId !== undefined ? row.shopperUserId.toString() : ''),
                itemsDescription: row?.itemsDescription || '',
                amount: row?.amount !== undefined ? row.amount.toString() : '',
                category: row?.category || 'Groceries',
                year: row?.year || year,
                month: row?.month || month,
                date: row?.date || ''
            });
        }
    }, [row, year, month, activeMemberMeta]);

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numAmount = parseFloat(String(formData.amount));
        if (!formData?.itemsDescription.trim() || isNaN(numAmount) || numAmount <= 0) return;

        const socket = getSocket();
        setLoading(true);
        socket?.emit('bazar_expense_update', { ...formData, amount: numAmount || 0 }, (res: ApiResponse<BazarExpense>) => {
            if (res?.success) {
                showToast(res?.message, 'success');
                setLoading(false);
                refetch();
                onCancel();
            } else {
                showToast(res?.message, 'error');
                setLoading(false);
            }
        });
    };

    return (
        <Dialog open onOpenChange={(open) => !open && onCancel()}>
            <DialogContent className="sm:max-w-[420px]">
                <form onSubmit={onSubmit}>
                    <DialogHeader>
                        <DialogTitle className="text-sm font-bold flex items-center gap-2">
                            <ShoppingBag className="text-teal-600" size={16} />
                            {row ? 'Edit Bazar Expense' : 'Log New Bazar Expense'}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-3 py-3 text-xs">
                        <div>
                            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                                Shopper / Member
                            </label>
                            <select
                                value={formData.shopperUserId}
                                onChange={(e) => setFormData((prev) => ({ ...prev, shopperUserId: e.target.value }))}
                                className="w-full h-8 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 text-xs"
                            >
                                {activeMemberMeta?.map((m) => (
                                    <option key={m.value} value={m.value}>
                                        {m.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                                Date
                            </label>
                            <Input
                                type="date"
                                value={formData?.date}
                                onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                                className="h-8 text-xs bg-white dark:bg-zinc-900"
                                required
                            />
                        </div>

                        <div>
                            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Category</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value as BazarExpense['category'] }))}
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
                                value={formData.itemsDescription}
                                onChange={(e) => setFormData((prev) => ({ ...prev, itemsDescription: e.target.value }))}
                                className="h-8 text-xs"
                                required
                            />
                        </div>

                        <div>
                            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Amount Spent (৳)</label>
                            <Input
                                type="number"
                                placeholder="e.g. 1450"
                                value={formData.amount}
                                onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
                                className="h-8 text-xs"
                                required
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" size="sm" disabled={loading} className="bg-teal-700 hover:bg-teal-800 text-white">
                            {row ? `${loading ? 'Updating...' : 'Save Changes'}` : `${loading ? 'Adding...' : 'Add Expense'}`}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};