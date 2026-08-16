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
import { AlertTriangle, Loader2, UserCheck, UserX } from 'lucide-react';
import { ApiResponse, USER_TYPE } from '@/types/user.types';
import { getSocket } from '@/lib/socket';
import { showToast } from '@/lib/utils';

interface MemberStatusDialogProps {
    row: USER_TYPE | null;
    type: 'ACTIVATE' | 'DEACTIVATE';
    onCancel: () => void;
    refetch: () => void;
}

export const MemberStatusDialog = ({ row, type, onCancel, refetch }: MemberStatusDialogProps) => {
    const [loading, setLoading] = React.useState(false);
    const isActivating = type === 'ACTIVATE';
    const nextStatus = isActivating ? 'active' : 'inactive';

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!row?.userId) {
            showToast('Member information is missing.', 'error');
            return;
        }

        const socket = getSocket();
        setLoading(true);

        socket?.emit('member_status_update', { userId: row.userId, status: nextStatus }, (res: ApiResponse<USER_TYPE>) => {
            if (res?.success) {
                showToast(res?.message || `Member account ${nextStatus}.`, 'success');
                refetch();
                onCancel();
            } else {
                showToast(res?.message || 'Failed to update member status.', 'error');
            }
            setLoading(false);
        });
    };

    return (
        <Dialog open={true} onOpenChange={(open) => !open && onCancel()}>
            <DialogContent className="sm:max-w-[420px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle className="text-sm font-bold flex items-center gap-2">
                            {isActivating ? <UserCheck size={18} className="text-emerald-600" /> : <UserX size={18} className="text-rose-600" />}
                            {isActivating ? 'Activate Member Account' : 'Deactivate Member Account'}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-zinc-600 dark:text-zinc-400">
                            {row?.fullName || 'This member'} will be marked as {nextStatus} and will {isActivating ? 'be able to access the system again.' : 'no longer be able to access the system.'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="mt-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-3 text-xs text-zinc-700 dark:text-zinc-300">
                        <div className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-zinc-100">
                            <AlertTriangle size={14} className={isActivating ? 'text-emerald-600' : 'text-rose-600'} />
                            {isActivating ? 'Activation' : 'Deactivation'} confirmation
                        </div>
                        <p className="mt-2 leading-5">
                            {isActivating
                                ? 'This action will restore the member account to active status.'
                                : 'This action will suspend the member account from active use.'}
                        </p>
                    </div>

                    <DialogFooter className="mt-5 gap-2 sm:gap-0">
                        <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={loading}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            size="sm"
                            disabled={loading}
                            className={isActivating
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2'
                                : 'bg-rose-600 hover:bg-rose-700 text-white disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2'}
                        >
                            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                            {loading ? (isActivating ? 'Activating...' : 'Deactivating...') : (isActivating ? 'Activate Account' : 'Deactivate Account')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
