import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { MonthlyMealData } from "@/types/meal.types"
import { ShoppingBag, Wallet } from "lucide-react"

export const NetBalanceDialog = ({ mealData, isOpen, onCancel }: { mealData: MonthlyMealData, isOpen: boolean, onCancel: () => void }) => {

    return <Dialog open={isOpen} onOpenChange={onCancel}>
        <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
                    <Wallet className="text-teal-600" size={20} /> House Fund Position & Balance
                </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-2 text-xs">
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 space-y-1">
                    <div className="flex justify-between">
                        <span>Total Deposits Collected:</span>
                        <span className="font-bold text-emerald-600">৳{mealData.totalDeposits.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Total Gross Expenses:</span>
                        <span className="font-bold text-rose-600">৳{mealData.totalGrossCost.toLocaleString()}</span>
                    </div>
                    <div className="border-t border-zinc-200 dark:border-zinc-700 pt-1 flex justify-between font-bold text-sm">
                        <span>Net House Surplus / Balance:</span>
                        <span className={mealData.netBalance >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                            ৳{mealData.netBalance.toLocaleString()}
                        </span>
                    </div>
                </div>
            </div>
            <DialogFooter>
                <Button size="sm" onClick={onCancel}>Close</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
}