import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { USER_TYPE } from "@/types/user.types"
import { PiggyBank, ShoppingBag } from "lucide-react"
import React from "react"


export const DepositRecordDialog = ({ isAddDepositOpen, setIsAddDepositOpen, mealData, handleAddDepositSubmit }: {
    isAddDepositOpen: boolean;
    setIsAddDepositOpen: (open: boolean) => void;
    mealData: any;
    handleAddDepositSubmit: (e: React.FormEvent, newDeposit: any) => void;
}) => {

    const [newDeposit, setNewDeposit] = React.useState({
        userId: 1,
        amount: '',
        paymentMethod: 'bKash' as const,
        note: '',
    });


    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleAddDepositSubmit(e, newDeposit);
        setNewDeposit({ userId: 1, amount: '', paymentMethod: 'bKash', note: '' });

        setIsAddDepositOpen(false);
    }

    return (< Dialog open={isAddDepositOpen} onOpenChange={setIsAddDepositOpen} >
        <DialogContent className="sm:max-w-[420px]">
            <form onSubmit={onSubmit}>
                <DialogHeader>
                    <DialogTitle className="text-sm font-bold flex items-center gap-2">
                        <PiggyBank className="text-emerald-600" size={16} /> Record Member Payment / Deposit
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-3 py-3 text-xs">
                    <div>
                        <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Member Name</label>
                        <select
                            value={newDeposit.userId}
                            onChange={(e) => setNewDeposit({ ...newDeposit, userId: Number(e.target.value) })}
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
                        <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Deposit Amount (৳)</label>
                        <Input
                            type="number"
                            placeholder="e.g. 2000"
                            value={newDeposit.amount}
                            onChange={(e) => setNewDeposit({ ...newDeposit, amount: e.target.value })}
                            className="h-8 text-xs"
                            required
                        />
                    </div>

                    <div>
                        <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Payment Method</label>
                        <select
                            value={newDeposit.paymentMethod}
                            onChange={(e) => setNewDeposit({ ...newDeposit, paymentMethod: e.target.value as any })}
                            className="w-full h-8 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 text-xs"
                        >
                            <option value="bKash">bKash</option>
                            <option value="Nagad">Nagad</option>
                            <option value="Cash">Cash</option>
                            <option value="Bank Transfer">Bank Transfer</option>
                        </select>
                    </div>

                    <div>
                        <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Notes / TRX ID</label>
                        <Input
                            placeholder="e.g. TRX9832742 - advance meal deposit"
                            value={newDeposit.note}
                            onChange={(e) => setNewDeposit({ ...newDeposit, note: e.target.value })}
                            className="h-8 text-xs"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" size="sm" onClick={() => setIsAddDepositOpen(false)}>
                        Cancel
                    </Button>
                    <Button type="submit" size="sm" className="bg-emerald-700 hover:bg-emerald-800 text-white">
                        Record Deposit
                    </Button>
                </DialogFooter>
            </form>
        </DialogContent>
    </Dialog >
    )
}