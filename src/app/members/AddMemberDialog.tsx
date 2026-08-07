import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@base-ui/react';
import { UserPlus } from 'lucide-react';
import React from 'react';

export const AddMemberDialog = ({ isAddModalOpen, setIsAddModalOpen, handleAddMemberSubmit }: { isAddModalOpen: boolean; setIsAddModalOpen: (open: boolean) => void, handleAddMemberSubmit: (e: React.FormEvent, newMemberData: any) => void }) => {

    const [newMemberData, setNewMemberData] = React.useState({
        fullName: '',
        userName: '',
        phone: '',
        photoUrl: 'https://github.com/shadcn.png',
        role: 'member' as 'admin' | 'member',
        status: 'active' as 'active' | 'inactive',
    });

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleAddMemberSubmit(e, newMemberData)

        setNewMemberData({
            fullName: '',
            userName: '',
            phone: '',
            photoUrl: 'https://github.com/shadcn.png',
            role: 'member',
            status: 'active',
        });
    }

    return <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[420px]">
            <form onSubmit={onSubmit}>
                <DialogHeader>
                    <DialogTitle className="text-sm font-bold flex items-center gap-2">
                        <UserPlus size={16} className="text-teal-600" /> Add New House Member
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                        Fill in details to create a new member profile.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 py-3 text-xs">
                    <div>
                        <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Full Name</label>
                        <Input
                            placeholder="e.g. Tanvir Hossain"
                            value={newMemberData.fullName}
                            onChange={(e) => setNewMemberData({ ...newMemberData, fullName: e.target.value })}
                            className="h-8 text-xs"
                            required
                        />
                    </div>

                    <div>
                        <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Username / Email</label>
                        <Input
                            type="email"
                            placeholder="tanvir@k.com"
                            value={newMemberData.userName}
                            onChange={(e) => setNewMemberData({ ...newMemberData, userName: e.target.value })}
                            className="h-8 text-xs"
                            required
                        />
                    </div>

                    <div>
                        <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Phone Number</label>
                        <Input
                            placeholder="01712345678"
                            value={newMemberData.phone}
                            onChange={(e) => setNewMemberData({ ...newMemberData, phone: e.target.value })}
                            className="h-8 text-xs"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Role</label>
                            <select
                                value={newMemberData.role}
                                onChange={(e) => setNewMemberData({ ...newMemberData, role: e.target.value as any })}
                                className="w-full h-8 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 text-xs"
                            >
                                <option value="member">Member</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>

                        <div>
                            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Status</label>
                            <select
                                value={newMemberData.status}
                                onChange={(e) => setNewMemberData({ ...newMemberData, status: e.target.value as any })}
                                className="w-full h-8 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 text-xs"
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" size="sm" onClick={() => setIsAddModalOpen(false)}>
                        Cancel
                    </Button>
                    <Button type="submit" size="sm" className="bg-teal-700 hover:bg-teal-800 text-white">
                        Save Member
                    </Button>
                </DialogFooter>
            </form>
        </DialogContent>
    </Dialog>
}