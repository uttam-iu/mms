'use client';

import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getSocket } from '@/lib/socket';
import { ApiResponse } from '@/types/user.types';
import { showToast } from '@/lib/utils';
import { Loader2, PiggyBank } from 'lucide-react';
import { MemberWiseSummary } from '@/types/meal.types';

export type CollectionDialogType = 'individual' | 'meal' | 'other' | 'advance';

interface DepositCollectionDialogProps {
    member: MemberWiseSummary | null;
    defaultType?: CollectionDialogType;
    onCancel: () => void;
    onSaved: () => void;
}

export const DepositCollectionDialog = ({
    member,
    defaultType = 'individual',
    onCancel,
    onSaved,
}: DepositCollectionDialogProps) => {
    const [loading, setLoading] = React.useState(false);
    const [formData, setFormData] = React.useState({
        type: defaultType,
        amount: '',
        paymentMethod: 'Cash',
        note: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!member?.userId) {
            showToast('A member must be selected for the deposit.', 'error');
            return;
        }

        const amount = Number(formData.amount);
        if (!amount || amount <= 0) {
            showToast('Please enter a valid deposit amount.', 'error');
            return;
        }

        const socket = getSocket();
        setLoading(true);

        socket?.emit(
            'member_deposit_create',
            {
                userId: member.userId,
                userName: member.fullName,
                amount,
                type: formData.type,
                paymentMethod: formData.paymentMethod,
                note: formData.note || `${formData.type} collection`,
            },
            (res: ApiResponse<{ id?: string }>) => {
                setLoading(false);

                if (res?.success) {
                    showToast(res?.message || 'Deposit recorded successfully.', 'success');
                    onSaved();
                    onCancel();
                    return;
                }

                showToast(res?.message || 'Failed to record the deposit.', 'error');
            }
        );
    };

    return (
        <Dialog open={true} onOpenChange={(open) => !open && onCancel()}>
            <DialogContent className="sm:max-w-[420px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle className="text-sm font-bold flex items-center gap-2 text-teal-700">
                            <PiggyBank size={16} /> Collect Deposit
                        </DialogTitle>
                        <DialogDescription className="text-xs text-zinc-600 dark:text-zinc-400">
                            Record a payment for {member?.fullName || 'this member'}.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3 py-3 text-xs">
                        <div>
                            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Member</label>
                            <Input value={member?.fullName || ''} className="h-8 text-xs" disabled />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Collection Type</label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value as CollectionDialogType })}
                                    className="w-full h-8 rounded-md border border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-900 px-2 text-xs"
                                >
                                    <option value="individual">Individual Cost</option>
                                    <option value="meal">Meal Cost</option>
                                    <option value="other">Other Cost</option>
                                    <option value="advance">Advance Payment</option>
                                </select>
                            </div>

                            <div>
                                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Amount</label>
                                <Input
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder="0.00"
                                    className="h-8 text-xs"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Payment Method</label>
                                <select
                                    value={formData.paymentMethod}
                                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                                    className="w-full h-8 rounded-md border border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-900 px-2 text-xs"
                                >
                                    <option value="Cash">Cash</option>
                                    <option value="bKash">bKash</option>
                                    <option value="Nagad">Nagad</option>
                                    <option value="Bank Transfer">Bank Transfer</option>
                                </select>
                            </div>

                            <div>
                                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Date</label>
                                <Input value={new Date().toISOString().slice(0, 10)} className="h-8 text-xs" disabled />
                            </div>
                        </div>

                        <div>
                            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Note</label>
                            <Input
                                value={formData.note}
                                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                                placeholder="Optional comment"
                                className="h-8 text-xs"
                            />
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" size="sm" disabled={loading} className="bg-teal-700 hover:bg-teal-800 text-white disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2">
                            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                            {loading ? 'Saving...' : 'Collect Deposit'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
