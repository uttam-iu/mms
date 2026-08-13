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

interface DeleteConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    description?: string;
    loading?: boolean;
}

export const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title = 'Delete Item',
    description = 'Are you sure you want to delete this item? This action cannot be undone.',
    loading = false,
}) => {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle className="text-sm font-bold flex items-center gap-2 text-rose-600">
                        <AlertTriangle size={18} /> {title}
                    </DialogTitle>
                    <DialogDescription className="text-xs pt-2 text-zinc-600 dark:text-zinc-400">
                        {description}
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="gap-2 sm:gap-0 mt-4">
                    <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        onClick={onConfirm}
                        disabled={loading}
                        className="bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-1.5"
                    >
                        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                        Delete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
