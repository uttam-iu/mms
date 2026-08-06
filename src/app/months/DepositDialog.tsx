import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { MonthlyMealData } from "@/types/meal.types"
import { PiggyBank, ShoppingBag } from "lucide-react"

export const DepositDialog = ({ mealData, isOpen, onCancel }: { mealData: MonthlyMealData, isOpen: boolean, onCancel: () => void }) => {

    return <Dialog open={isOpen} onOpenChange={onCancel}>
        <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
                    <PiggyBank className="text-cyan-600" size={20} /> Member Deposits Summary
                </DialogTitle>
            </DialogHeader>
            <div className="space-y-2 py-2 text-xs">
                {mealData.activeMembers.map((m) => (
                    <div key={m.userId} className="flex justify-between items-center p-2 rounded-lg border border-zinc-100 dark:border-zinc-800">
                        <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                                <AvatarImage src={m.photoUrl} alt={m.fullName} />
                                <AvatarFallback>{m.fullName[0]}</AvatarFallback>
                            </Avatar>
                            <span className="font-semibold text-zinc-800 dark:text-zinc-200">{m.fullName}</span>
                        </div>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">৳{m.totalDeposit.toLocaleString()}</span>
                    </div>
                ))}
            </div>
            <DialogFooter>
                <Button size="sm" onClick={onCancel}>Close</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
}