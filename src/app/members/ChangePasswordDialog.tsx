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
import { Input } from '@/components/ui/input';
import { KeyRound, Loader2, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { ApiResponse, USER_TYPE } from '@/types/user.types';
import { getSocket } from '@/lib/socket';
import { showToast } from '@/lib/utils';

interface ChangePasswordDialogProps {
    row: USER_TYPE | null;
    onCancel: () => void;
    refetch: () => void;
}

export const ChangePasswordDialog = ({ row, onCancel, refetch }: ChangePasswordDialogProps) => {
    const [loading, setLoading] = React.useState(false);
    const [newPassword, setNewPassword] = React.useState('');
    const [confirmPassword, setConfirmPassword] = React.useState('');
    const [showNewPassword, setShowNewPassword] = React.useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!row?.userId) {
            const err = 'Member information is missing.';
            setError(err);
            showToast(err, 'error');
            return;
        }

        if (newPassword.length < 6) {
            const err = 'Password must be at least 6 characters long.';
            setError(err);
            showToast(err, 'error');
            return;
        }

        if (newPassword !== confirmPassword) {
            const err = 'New password and confirm password do not match.';
            setError(err);
            showToast(err, 'error');
            return;
        }

        const socket = getSocket();
        setLoading(true);

        socket?.emit(
            'member_password_change',
            { userId: row.userId, newPassword, confirmPassword },
            (res: ApiResponse<USER_TYPE>) => {
                if (res?.success) {
                    showToast(res?.message || 'Password changed successfully.', 'success');
                    refetch();
                    onCancel();
                } else {
                    const errMsg = res?.message || 'Failed to update password.';
                    setError(errMsg);
                    showToast(errMsg, 'error');
                }
                setLoading(false);
            }
        );
    };

    return (
        <Dialog open={true} onOpenChange={(open) => !open && onCancel()}>
            <DialogContent className="sm:max-w-[420px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle className="text-sm font-bold flex items-center gap-2">
                            <KeyRound size={18} className="text-amber-600 dark:text-amber-500" />
                            Change Member Password
                        </DialogTitle>
                        <DialogDescription className="text-xs text-zinc-600 dark:text-zinc-400">
                            Update password for <span className="font-semibold text-zinc-800 dark:text-zinc-200">{row?.fullName || 'this member'}</span>.
                        </DialogDescription>
                    </DialogHeader>

                    {error && (
                        <div className="mt-3 p-2.5 rounded-lg text-xs bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 flex items-center gap-2">
                            <AlertCircle size={15} className="shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="space-y-3 py-3 text-xs">
                        <div>
                            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                                New Password <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                                <Input
                                    type={showNewPassword ? 'text' : 'password'}
                                    value={newPassword}
                                    onChange={(e) => {
                                        setNewPassword(e.target.value);
                                        if (error) setError(null);
                                    }}
                                    placeholder="Minimum 6 characters"
                                    className="h-8 text-xs pr-8"
                                    required
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                                >
                                    {showNewPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                                Confirm New Password <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                                <Input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => {
                                        setConfirmPassword(e.target.value);
                                        if (error) setError(null);
                                    }}
                                    placeholder="Re-enter new password"
                                    className="h-8 text-xs pr-8"
                                    required
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                                >
                                    {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="mt-2 gap-2 sm:gap-0">
                        <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={loading}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            size="sm"
                            disabled={loading}
                            className="bg-amber-600 hover:bg-amber-700 text-white disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                            {loading ? 'Updating...' : 'Update Password'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
