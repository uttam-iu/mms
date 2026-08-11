import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Pencil, UserPlus } from 'lucide-react';
import { USER_TYPE } from '@/types/user.types';
import React from 'react';
import { getSocket } from '@/lib/socket';

export const EditMemberDialog = ({ row, type, onCancel, refetch }: { row: USER_TYPE | null, type: string, onCancel: () => void, refetch: () => void }) => {

    const [formData, setFormData] = React.useState({
        fullName: row?.fullName || '',
        userName: row?.userName || '',
        phone: row?.phone || '',
        role: row?.role || 'member',
        status: row?.status || 'active',
    })

    React.useEffect(() => {
        if (row) {
            setFormData({
                fullName: row.fullName || '',
                userName: row.userName || '',
                phone: row.phone || '',
                role: row.role || 'member',
                status: row.status || 'active',
            })
        }
    }, [row])

    const handleSubmit = (e: React.FormEvent) => {
        e?.preventDefault();
        const payload: Partial<USER_TYPE> = {
            ...formData,
            userId: row?.userId || Date.now(),
        }
        if (type === 'ADD') payload.password = formData?.phone
        const socket = getSocket()
        socket?.emit(type === 'UPDATE' ? 'member_update' : 'member_create', payload, (res: any) => {
            if (res?.success) {
                refetch()
                onCancel()
            } else {
                console.log(res)
            }
        })
    }

    return <Dialog open={true} onOpenChange={onCancel}>
        <DialogContent className="sm:max-w-[420px]">
            <form onSubmit={handleSubmit}>
                <DialogHeader>
                    <DialogTitle className="text-sm font-bold flex items-center gap-2">
                        {type === 'UPDATE' ? <Pencil size={16} className="text-teal-600" /> : <UserPlus size={16} className="text-teal-600" />}
                        {type === 'UPDATE' ? 'Edit Member Profile' : 'Add New Member'}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-3 py-3 text-xs">
                    <div>
                        <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Full Name</label>
                        <Input
                            value={formData?.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            className="h-8 text-xs"
                            required
                        />
                    </div>

                    <div>
                        <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Username / Email</label>
                        <Input
                            value={formData?.userName}
                            onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                            className="h-8 text-xs"
                            required
                        />
                    </div>

                    <div>
                        <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Phone Number</label>
                        <Input
                            value={formData?.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="h-8 text-xs"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Role</label>
                            <select
                                value={formData?.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                                className="w-full h-8 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 text-xs"
                            >
                                <option value="member">Member</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>

                        <div>
                            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Status</label>
                            <select
                                value={formData?.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                className="w-full h-8 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 text-xs"
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" size="sm" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button type="submit" size="sm" className="bg-teal-700 hover:bg-teal-800 text-white">
                        {type === 'UPDATE' ? 'Update Member' : 'Add Member'}
                    </Button>
                </DialogFooter>
            </form>

        </DialogContent>
    </Dialog>
}