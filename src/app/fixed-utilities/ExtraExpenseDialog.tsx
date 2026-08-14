import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ExtraExpense } from "@/types/meal.types";
import { Receipt } from "lucide-react";
import { getSocket } from '@/lib/socket';
import { ApiResponse } from '@/types/user.types';
import { showToast } from '@/lib/utils';

interface ExtraExpenseDialogProps {
    onCancel: () => void;
    refetch: () => void;
    row?: ExtraExpense | null;
    type: 'EDIT' | 'ADD';
    year: string;
    month: string;
}

export const ExtraExpenseDialog: React.FC<ExtraExpenseDialogProps> = ({
    onCancel,
    type,
    row,
    year,
    month,
    refetch
}) => {
    const [loading, setLoading] = React.useState(false)

    const [formData, setFormData] = React.useState({
        billId: '',
        billTitle: '',
        category: 'Utilities' as any,
        amount: '',
        description: '',
        year,
        month
    })

    useEffect(() => {
        if (row) {
            setFormData((prev) => ({
                ...prev,
                billId: row?.billId || '',
                billTitle: row?.billTitle || '',
                category: row.category,
                amount: row.amount.toString(),
                description: row.description ?? '',
                year: row?.year,
                month: row?.month,
            }));
        }
    }, [row]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numAmount = parseFloat(String(formData.amount));
        if (!formData?.billTitle.trim() || isNaN(numAmount) || numAmount <= 0) return;

        const socket = getSocket()
        setLoading(true)
        socket?.emit('fixed_utility_cost_create', { ...formData, amount: parseFloat(formData.amount) || 0 }, (res: ApiResponse<ExtraExpense>) => {
            if (res?.success) {
                showToast(res?.message, 'success')
                setLoading(false)
                refetch()
                onCancel()
            } else {
                showToast(res?.message, 'error')
                setLoading(false)
            }
        })
    };

    return (
        <Dialog open={true} >
            <DialogContent className="sm:max-w-[420px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle className="text-sm font-bold flex items-center gap-2">
                            <Receipt className="text-purple-600" size={16} />
                            {row ? 'Edit Fixed Utility / Bill' : 'Add Fixed Utility / Bill'}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-3 py-3 text-xs">
                        <div>
                            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                                Bill Title / Name
                            </label>
                            <Input
                                placeholder="e.g. Cook Salary, Gas Bill, Internet"
                                value={formData?.billTitle}
                                onChange={(e) => setFormData(prev => {
                                    return {
                                        ...prev,
                                        billTitle: e.target.value
                                    }
                                })}
                                className="h-8 text-xs"
                                required
                            />
                        </div>

                        <div>
                            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                                Category
                            </label>
                            <select
                                value={formData?.category}
                                onChange={(e) => setFormData(prev => {
                                    return {
                                        ...prev,
                                        category: e.target.value as ExtraExpense['category']
                                    }
                                })}
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
                                value={formData?.amount}
                                onChange={(e) => setFormData(prev => {
                                    return {
                                        ...prev,
                                        amount: e.target.value
                                    }
                                })}
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
                                value={formData?.description}
                                onChange={(e) => setFormData(prev => {
                                    return {
                                        ...prev,
                                        description: e.target.value
                                    }
                                })}
                                className="h-8 text-xs"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
                            Cancel
                        </Button>
                        <Button type="submit" size="sm" className="bg-teal-700 hover:bg-teal-800 text-white">
                            {row ? `${loading ? 'Updating...' : 'Save Changes'}` : `${loading ? 'Creating...' : 'Add Bill'}`}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
