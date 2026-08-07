import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { USER_TYPE } from "@/types/user.types"
import { CheckCircle2, Coins, Pencil, UserPlus, Users, XCircle } from "lucide-react"

export const MemberTable = ({ filteredMembers, isAdminMode, handleToggleUserStatus, handleOpenCostModal, setEditingMember }: { filteredMembers: USER_TYPE[], isAdminMode: boolean, handleToggleUserStatus: (userId: number) => void, handleOpenCostModal: (member: USER_TYPE) => void, setEditingMember: (member: USER_TYPE) => void }) => {

    return <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-2xs overflow-hidden">
        <div className="p-2 border-b border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                House Members Table
            </h3>
        </div>

        {filteredMembers.length === 0 ? (
            <div className="p-12 text-center text-xs text-zinc-400 space-y-2">
                <Users size={32} className="mx-auto text-zinc-400" />
                <p className="font-semibold">No member records match the applied filter.</p>
                <p>Try modifying your search or status selection and click Perform Filter.</p>
            </div>
        ) : (
            <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 font-semibold border-b border-zinc-200 dark:border-zinc-800">
                        <tr>
                            <th className="p-1">SL</th>
                            <th className="p-1">Member Name</th>
                            <th className="p-1">Phone Number</th>
                            <th className="p-1 text-center">Role</th>
                            <th className="p-1 text-center">Status</th>
                            <th className="p-1">Fixed Individual Costs</th>
                            <th className="p-1">Joined Date</th>
                            <th className="p-1 text-right">
                                {isAdminMode ? 'Admin Actions' : 'Permissions'}
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60 text-zinc-800 dark:text-zinc-200">
                        {filteredMembers.map((member, index) => {
                            const isActive = (member.status || 'active') === 'active';
                            const isAdmin = member.role === 'admin';
                            const indCosts = member.individualCosts || [];
                            const indTotal = indCosts.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

                            return (
                                <tr key={member.userId} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors">
                                    <td className="p-1 font-semibold text-zinc-700 dark:text-zinc-300">{index + 1}</td>

                                    <td className="p-1 ">
                                        <div className='flex items-center'>
                                            <div className='font-medium flex  gap-2'>
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={member.photoUrl || ''} alt={member.fullName} />
                                                    <AvatarFallback>{member.fullName[0]}</AvatarFallback>
                                                </Avatar>
                                                <div className='flex items-center'>
                                                    <div className="gap-1">
                                                        <div className="font-semibold text-zinc-900 dark:text-zinc-100">{member.fullName}</div>
                                                        <div className="text-zinc-600 dark:text-zinc-400">{member.userName}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="p-1 font-mono text-zinc-700 dark:text-zinc-300">{member.phone}</td>

                                    <td className="p-1 text-center">
                                        <span
                                            className={`px-2 py-0.5 text-[10px] font-bold rounded ${isAdmin
                                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                                                : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                                                }`}
                                        >
                                            {isAdmin ? 'Admin' : 'Member'}
                                        </span>
                                    </td>

                                    <td className="p-1 text-center">
                                        <span
                                            className={`px-2.5 py-0.5 text-[10px] font-semibold rounded-full inline-flex items-center gap-1 ${isActive
                                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                                : 'bg-rose-50 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                                                }`}
                                        >
                                            {isActive ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
                                            {isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>

                                    <td className="p-1">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-1 flex-wrap max-w-[220px]">
                                                {indCosts.length > 0 ? (
                                                    indCosts.map((c) => (
                                                        <span
                                                            key={c.id}
                                                            className="whitespace-nowrap px-2 py-0.5 text-[10px] font-semibold rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                                                        >
                                                            {c.costType}: ৳{c.amount.toLocaleString()}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-[10px] text-zinc-400 italic">None</span>
                                                )}
                                            </div>
                                            {indCosts.length > 0 && (
                                                <div className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                                                    Total: ৳{indTotal.toLocaleString()}
                                                </div>
                                            )}
                                        </div>
                                    </td>

                                    {/* Joined Date */}
                                    <td className="whitespace-nowrap p-1 text-zinc-500 font-mono text-[11px]">{member.joinedDate || '2024-01-15'}</td>

                                    {/* Actions */}
                                    <td className="p-1 text-right">
                                        {isAdminMode ? (
                                            <div className="flex items-center justify-end gap-1.5 flex-wrap">

                                                <button
                                                    type="button"
                                                    onClick={() => handleToggleUserStatus(member.userId)}
                                                    className={`text-[11px] font-semibold px-2 py-1 rounded border transition-colors cursor-pointer ${isActive
                                                        ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800 hover:bg-rose-100'
                                                        : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
                                                        }`}
                                                >
                                                    {isActive ? 'Deactivate' : 'Activate'}
                                                </button>

                                                {/* Edit Button */}
                                                <div className='flex gap-2'>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleOpenCostModal(member)}
                                                        className="h-6 text-[11px] font-semibold px-2 cursor-pointer border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950"
                                                    >
                                                        <Coins size={11} className="mr-1" /> Fixed Costs
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setEditingMember(member)}
                                                        className="h-6 text-[11px] font-medium px-2 cursor-pointer border-zinc-300 dark:border-zinc-700"
                                                    >
                                                        <Pencil size={11} className="mr-1" /> Edit
                                                    </Button>
                                                </div>

                                            </div>
                                        ) : (
                                            <span className="text-[10px] text-zinc-400 italic">Read-Only</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        )}
    </div>
}