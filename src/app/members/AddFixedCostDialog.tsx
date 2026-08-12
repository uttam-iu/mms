import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { IndividualCostItem, USER_TYPE } from '@/types/user.types';
import { Coins, Plus, Trash2 } from 'lucide-react';
import React from 'react';

export const AddFixedCostDialog = ({ handleSaveCostsSubmit, memberCosts, setMemberCosts, managingCostMember, setManagingCostMember }: { handleSaveCostsSubmit: (e: React.FormEvent) => void, memberCosts: IndividualCostItem[], setMemberCosts: React.Dispatch<React.SetStateAction<IndividualCostItem[]>>, managingCostMember: USER_TYPE | null, setManagingCostMember: React.Dispatch<React.SetStateAction<USER_TYPE | null>> }) => {

    const handleAddCostRow = () => {
        setMemberCosts((prev) => [
            ...prev,
            { id: `ic-${Date.now()}-${prev.length}`, costType: '', amount: 0 },
        ]);
    };

    const handleUpdateCostRow = (index: number, field: 'costType' | 'amount', value: string | number) => {
        setMemberCosts((prev) =>
            prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
        );
    };

    const handleRemoveCostRow = (index: number) => {
        setMemberCosts((prev) => prev.filter((_, i) => i !== index));
    };


    return <Dialog open={!!managingCostMember} onOpenChange={() => setManagingCostMember(null)}>
        <DialogContent className="sm:max-w-[500px]">
            {managingCostMember && (
                <form onSubmit={handleSaveCostsSubmit}>
                    <DialogHeader>
                        <DialogTitle className="text-sm font-bold flex items-center gap-2">
                            <Coins size={16} className="text-indigo-600" /> Individual Fixed Costs ({managingCostMember.fullName})
                        </DialogTitle>
                        <DialogDescription className="text-xs">
                            Set fixed individual costs (e.g. house rent, seat rent, private utilities) assigned to {managingCostMember.fullName}.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3 py-4 text-xs max-h-[350px] overflow-y-auto custom-scrollbar">
                        {memberCosts.length === 0 ? (
                            <div className="text-center py-4 text-zinc-400">No fixed cost items added yet.</div>
                        ) : (
                            memberCosts.map((cost, idx) => (
                                <div key={cost.id || idx} className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-900 p-2 rounded-lg border border-zinc-200 dark:border-zinc-800">
                                    <div className="flex-1">
                                        <label className="block text-[10px] font-semibold text-zinc-500 mb-0.5">Cost Type</label>
                                        <Input
                                            placeholder="e.g. House Rent, Seat Rent"
                                            value={cost.costType}
                                            onChange={(e) => handleUpdateCostRow(idx, 'costType', e.target.value)}
                                            className="h-8 text-xs bg-white dark:bg-zinc-950"
                                            required
                                        />
                                    </div>
                                    <div className="w-32">
                                        <label className="block text-[10px] font-semibold text-zinc-500 mb-0.5">Value (৳)</label>
                                        <Input
                                            type="number"
                                            placeholder="e.g. 3500"
                                            value={cost.amount}
                                            onChange={(e) => handleUpdateCostRow(idx, 'amount', Number(e.target.value))}
                                            className="h-8 text-xs bg-white dark:bg-zinc-950"
                                            required
                                        />
                                    </div>
                                    <div className="pt-3">
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveCostRow(idx)}
                                            className="p-1.5 rounded text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                                            title="Remove cost entry"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}

                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleAddCostRow}
                            className="w-full h-8 text-xs border-dashed border-indigo-300 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950 cursor-pointer"
                        >
                            <Plus size={13} className="mr-1" /> Add Fixed Cost Entry
                        </Button>

                        <div className="mt-4 p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-between">
                            <span className="font-semibold text-indigo-900 dark:text-indigo-200">Total Fixed Individual Cost:</span>
                            <span className="text-sm font-black text-indigo-700 dark:text-indigo-300">
                                ৳{memberCosts.reduce((sum, item) => sum + (Number(item.amount) || 0), 0).toLocaleString()}
                            </span>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" size="sm" onClick={() => setManagingCostMember(null)}>
                            Cancel
                        </Button>
                        <Button type="submit" size="sm" className="bg-indigo-700 hover:bg-indigo-800 text-white">
                            Save Fixed Costs
                        </Button>
                    </DialogFooter>
                </form>
            )}
        </DialogContent>
    </Dialog>
}