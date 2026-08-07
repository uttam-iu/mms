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
import { Pencil } from 'lucide-react';

export const EditMemberDialog = ({ editingMember, setEditingMember, handleEditMemberSubmit }: { editingMember: any, setEditingMember: (member: any) => void, handleEditMemberSubmit: (e: React.FormEvent) => void }) => {

    return <Dialog open={!!editingMember} onOpenChange={() => setEditingMember(null)}>
        <DialogContent className="sm:max-w-[420px]">
            {editingMember && (
                <form onSubmit={handleEditMemberSubmit}>
                    <DialogHeader>
                        <DialogTitle className="text-sm font-bold flex items-center gap-2">
                            <Pencil size={16} className="text-teal-600" /> Edit Member Profile
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-3 py-3 text-xs">
                        <div>
                            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Full Name</label>
                            <Input
                                value={editingMember.fullName}
                                onChange={(e) => setEditingMember({ ...editingMember, fullName: e.target.value })}
                                className="h-8 text-xs"
                                required
                            />
                        </div>

                        <div>
                            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Username / Email</label>
                            <Input
                                value={editingMember.userName}
                                onChange={(e) => setEditingMember({ ...editingMember, userName: e.target.value })}
                                className="h-8 text-xs"
                                required
                            />
                        </div>

                        <div>
                            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Phone Number</label>
                            <Input
                                value={editingMember.phone}
                                onChange={(e) => setEditingMember({ ...editingMember, phone: e.target.value })}
                                className="h-8 text-xs"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Role</label>
                                <select
                                    value={editingMember.role || 'member'}
                                    onChange={(e) => setEditingMember({ ...editingMember, role: e.target.value as any })}
                                    className="w-full h-8 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 text-xs"
                                >
                                    <option value="member">Member</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>

                            <div>
                                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Status</label>
                                <select
                                    value={editingMember.status || 'active'}
                                    onChange={(e) => setEditingMember({ ...editingMember, status: e.target.value as any })}
                                    className="w-full h-8 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 text-xs"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" size="sm" onClick={() => setEditingMember(null)}>
                            Cancel
                        </Button>
                        <Button type="submit" size="sm" className="bg-teal-700 hover:bg-teal-800 text-white">
                            Update Member
                        </Button>
                    </DialogFooter>
                </form>
            )}
        </DialogContent>
    </Dialog>
}