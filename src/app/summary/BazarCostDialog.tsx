import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { MonthlyMealData } from "@/types/meal.types"
import { ShoppingBag } from "lucide-react"

export const BazarCostDialog = ({ mealData, isOpen, onCancel }: { mealData: MonthlyMealData, isOpen: boolean, onCancel: () => void }) => {

    return <Dialog open={isOpen} onOpenChange={onCancel}>
        <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
                    <ShoppingBag className="text-blue-600" size={20} /> Bazar Expenses Breakdown
                </DialogTitle>
            </DialogHeader>
            <div className="space-y-2 py-2 text-xs max-h-60 overflow-y-auto">
                {mealData.bazarExpenses.map((b) => (
                    <div key={b.id} className="p-2 rounded-lg border border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                        <div>
                            <div className="font-semibold text-zinc-800 dark:text-zinc-200">{b.shopperName} ({b.date})</div>
                            <div className="text-[11px] text-zinc-500">{b.itemsDescription}</div>
                        </div>
                        <span className="font-bold text-blue-600 dark:text-blue-400">৳{b.amount.toLocaleString()}</span>
                    </div>
                ))}
            </div>
            <DialogFooter>
                <Button size="sm" onClick={onCancel}>Close</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
}