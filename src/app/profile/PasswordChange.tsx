import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getSocket } from "@/lib/socket";
import { AlertCircle, CheckCircle2, Lock, Loader2 } from "lucide-react";
import React from "react";

export default function PasswordChange({ refetch }: { refetch: () => void }) {
    const [loading, setLoading] = React.useState(false)
    const [passwordState, setPasswordState] = React.useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [passwordAlert, setPasswordAlert] = React.useState<{ type: 'success' | 'error'; message: string } | null>(null);


    // Handle Update Password
    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!passwordState.currentPassword) {
            setPasswordAlert({ type: 'error', message: 'Please enter your current password.' });
            return;
        }
        if (passwordState.newPassword.length < 6) {
            setPasswordAlert({ type: 'error', message: 'New password must be at least 6 characters.' });
            return;
        }
        if (passwordState.newPassword !== passwordState.confirmPassword) {
            setPasswordAlert({ type: 'error', message: 'New password and confirm password do not match.' });
            return;
        }

        const socket = getSocket()
        setLoading(true)
        socket?.emit('password_change', {
            currentPassword: passwordState?.currentPassword,
            newPassword: passwordState?.newPassword,
        }, (res: any) => {
            if (res?.success) {
                setLoading(false)
                setPasswordAlert({ type: 'success', message: 'Password updated' });
            } else {
                setLoading(false)
                setPasswordAlert({ type: 'error', message: res?.message });
            }
        })
    };

    return <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-6 shadow-2xs space-y-6">
        <div className="border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Lock size={16} className="text-teal-600" /> Security & Password Update
            </h3>
            <p className="text-xs text-zinc-500">
                Update your password to keep your account safe.
            </p>
        </div>

        {passwordAlert && (
            <div
                className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${passwordAlert.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                    : 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
                    }`}
            >
                {passwordAlert.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                <span>{passwordAlert.message}</span>
            </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md text-xs">
            <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Current Password</label>
                <Input
                    type="password"
                    placeholder="••••••••"
                    value={passwordState.currentPassword}
                    onChange={(e) => setPasswordState({ ...passwordState, currentPassword: e.target.value })}
                    className="h-9 text-xs"
                    required
                />
            </div>

            <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">New Password</label>
                <Input
                    type="password"
                    placeholder="At least 6 characters"
                    value={passwordState.newPassword}
                    onChange={(e) => setPasswordState({ ...passwordState, newPassword: e.target.value })}
                    className="h-9 text-xs"
                    required
                />
            </div>

            <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Confirm New Password</label>
                <Input
                    type="password"
                    placeholder="Re-enter new password"
                    value={passwordState.confirmPassword}
                    onChange={(e) => setPasswordState({ ...passwordState, confirmPassword: e.target.value })}
                    className="h-9 text-xs"
                    required
                />
            </div>

            <Button type="submit" size="sm" disabled={loading} className="bg-teal-700 hover:bg-teal-800 text-white font-semibold cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2">
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {loading ? 'Updating...' : 'Update Password'}
            </Button>
        </form>
    </div>
}