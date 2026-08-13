import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ExtraExpense } from "@/types/meal.types";
import { Receipt } from "lucide-react";

interface ExtraExpenseDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (expense: Omit<ExtraExpense, 'id'> & { id?: string }) => void;
    editingExpense?: ExtraExpense | null;
}

export const ExtraExpenseDialog: React.FC<ExtraExpenseDialogProps> = ({
    isOpen,
    onClose,
    onSubmit,
    editingExpense,
}) => {
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState<ExtraExpense['category']>('Utilities' as any);
    const [amount, setAmount] = useState<string | number>('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        if (editingExpense) {
            setTitle(editingExpense.title);
            setCategory(editingExpense.category || 'Others');
            setAmount(editingExpense.amount);
            setDescription(editingExpense.description || '');
        } else {
            setTitle('');
            setCategory('Gas');
            setAmount('');
            setDescription('');
        }
    }, [editingExpense, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numAmount = parseFloat(String(amount));
        if (!title.trim() || isNaN(numAmount) || numAmount <= 0) return;

        onSubmit({
            ...(editingExpense ? { id: editingExpense.id } : {}),
            title: title.trim(),
            category,
            amount: numAmount,
            splitType: 'equal',
            description: description.trim(),
        });
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[420px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle className="text-sm font-bold flex items-center gap-2">
                            <Receipt className="text-purple-600" size={16} />
                            {editingExpense ? 'Edit Fixed Utility / Bill' : 'Add Fixed Utility / Bill'}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-3 py-3 text-xs">
                        <div>
                            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                                Bill Title / Name
                            </label>
                            <Input
                                placeholder="e.g. Cook Salary, Gas Bill, Internet"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="h-8 text-xs"
                                required
                            />
                        </div>

                        <div>
                            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                                Category
                            </label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value as ExtraExpense['category'])}
                                className="w-full h-8 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 text-xs"
                            >
                                <option value="Gas">Gas</option>
                                <option value="Electricity">Electricity</option>
                                <option value="Water">Water</option>
                                <option value="Internet">Internet</option>
                                <option value="Cook Salary">Cook Salary</option>
                                <option value="Cleaner">Cleaner</option>
                                <option value="Others">Others</option>
                            </select>
                        </div>

                        <div>
                            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                                Total Bill Amount (৳)
                            </label>
                            <Input
                                type="number"
                                placeholder="e.g. 4500"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="h-8 text-xs"
                                required
                            />
                        </div>

                        <div>
                            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                                Note / Description (Optional)
                            </label>
                            <Input
                                placeholder="e.g. Divided equally among active members"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="h-8 text-xs"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" size="sm" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" size="sm" className="bg-purple-700 hover:bg-purple-800 text-white">
                            {editingExpense ? 'Save Changes' : 'Add Bill'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
