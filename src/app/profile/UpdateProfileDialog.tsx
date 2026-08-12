
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Pencil,
    Loader2,
} from 'lucide-react';
import React from 'react';
import { getSocket } from '@/lib/socket';
import { showToast } from '@/lib/utils';

export default function UpdateProfileDialog({ profileData, isEditProfileOpen, onCancel, refetch }: { profileData: any, isEditProfileOpen: boolean, onCancel: () => void, refetch: () => void }) {
    const [formData, setFormData] = React.useState({
        fullName: profileData?.fullName,
        userName: profileData?.userName,
        phone: profileData?.phone,
    })
    const [loading, setLoading] = React.useState(false)

    const handleSaveProfile = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true)
        const socket = getSocket()
        socket?.emit('profile_update', formData, (res: any) => {
            if (res?.success) {
                showToast(res?.message, 'success')
                setLoading(false)
                refetch();
                onCancel()
            } else {
                showToast(res?.message, 'error')
                setLoading(false)
            }
        })
    };

    return (<Dialog open={isEditProfileOpen} onOpenChange={onCancel}>
        <DialogContent className="sm:max-w-[460px]">
            <form onSubmit={handleSaveProfile}>
                <DialogHeader>
                    <DialogTitle className="text-sm font-bold flex items-center gap-2">
                        <Pencil size={16} className="text-teal-600" /> Edit My Profile Details
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-3 py-3 text-xs max-h-96 overflow-y-auto custom-scrollbar">
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
                            type="email"
                            value={formData?.userName}
                            onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                            className="h-8 text-xs"
                            required
                        />
                    </div>

                    <div>
                        <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Phone Number</label>
                        <Input
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="h-8 text-xs"
                            required
                        />
                    </div>

                    {/* <div>
                        <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Emergency Contact</label>
                        <Input
                            value={profileData.emergencyContact}
                            onChange={(e) => setProfileData({ ...profileData, emergencyContact: e.target.value })}
                            className="h-8 text-xs"
                        />
                    </div> */}

                    {/* <div>
                        <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Food Preference</label>
                        <Input
                            value={profileData.foodPreference}
                            onChange={(e) => setProfileData({ ...profileData, foodPreference: e.target.value })}
                            className="h-8 text-xs"
                        />
                    </div> */}

                    {/* <div>
                        <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Dietary Notes / Allergies</label>
                        <Textarea
                            value={profileData.dietaryNotes}
                            onChange={(e) => setProfileData({ ...profileData, dietaryNotes: e.target.value })}
                            className="text-xs min-h-[60px]"
                        />
                    </div> */}
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={loading}>
                        Cancel
                    </Button>
                    <Button type="submit" size="sm" disabled={loading} className="bg-teal-700 hover:bg-teal-800 text-white disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2">
                        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                        {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                </DialogFooter>
            </form>
        </DialogContent>
    </Dialog>)
}