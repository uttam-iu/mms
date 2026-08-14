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
import { AlertTriangle, Loader2 } from 'lucide-react';
import { getSocket } from '@/lib/socket';
import { ApiResponse } from '@/types/user.types';
import { showToast } from '@/lib/utils';

interface DeleteConfirmDialogProps {
    onCancel: () => void;
    refetch: () => void;
    title?: string;
    description?: string;
    body?: React.ReactNode;
    emitKey: string;
    payload: { id: string }
}

export const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
    onCancel,
    title = 'Delete Item',
    description = 'Are you sure you want to delete this item?',
    body = '',
    refetch,
    emitKey,
    payload
}) => {
    const [loading, setLoading] = React.useState(false)
    const handleClose = () => {
        onCancel();
    };

    const handleConfirmAction = () => {
        const socket = getSocket()
        setLoading(true)
        socket?.emit(emitKey, payload, (res: ApiResponse<{}>) => {
            if (res?.success) {
                showToast(res?.message, 'success')
                setLoading(false)
                refetch()
                onCancel()
            } else {
                showToast(res?.message, 'error')
                setLoading(false)
            }
        })
    };

    return (
        <Dialog open={true} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle className="text-sm font-bold flex items-center gap-2 text-rose-600">
                        <AlertTriangle size={18} /> {title}
                    </DialogTitle>

                </DialogHeader>
                <div className='mt-2'>
                    {body}
                    <div className="text-xs text-zinc-600 dark:text-zinc-400 mt-2">
                        {description}
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0 mt-4">
                    <Button type="button" variant="outline" size="sm" onClick={handleClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        disabled={loading}
                        onClick={handleConfirmAction}
                        className="bg-rose-600 hover:bg-rose-700 text-white disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                        {loading ? 'Deleting...' : 'Delete'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
