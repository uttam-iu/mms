
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Pencil,
} from 'lucide-react';

export default function UpdateProfile({ profileData, setProfileData, isEditProfileOpen, setIsEditProfileOpen }) {

    const handleSaveProfile = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('update profile')
        setIsEditProfileOpen(false);
    };

    return (<Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
        <DialogContent className="sm:max-w-[460px]">
            <form onSubmit={handleSaveProfile}>
                <DialogHeader>
                    <DialogTitle className="text-sm font-bold flex items-center gap-2">
                        <Pencil size={16} className="text-teal-600" /> Edit My Profile Details
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                        Update your personal information and food preferences.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 py-3 text-xs max-h-96 overflow-y-auto custom-scrollbar">
                    <div>
                        <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Full Name</label>
                        <Input
                            value={profileData.fullName}
                            onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                            className="h-8 text-xs"
                            required
                        />
                    </div>

                    <div>
                        <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Username / Email</label>
                        <Input
                            type="email"
                            value={profileData.userName}
                            onChange={(e) => setProfileData({ ...profileData, userName: e.target.value })}
                            className="h-8 text-xs"
                            required
                        />
                    </div>

                    <div>
                        <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Phone Number</label>
                        <Input
                            value={profileData.phone}
                            onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                            className="h-8 text-xs"
                            required
                        />
                    </div>

                    <div>
                        <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Emergency Contact</label>
                        <Input
                            value={profileData.emergencyContact}
                            onChange={(e) => setProfileData({ ...profileData, emergencyContact: e.target.value })}
                            className="h-8 text-xs"
                        />
                    </div>

                    <div>
                        <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Food Preference</label>
                        <Input
                            value={profileData.foodPreference}
                            onChange={(e) => setProfileData({ ...profileData, foodPreference: e.target.value })}
                            className="h-8 text-xs"
                        />
                    </div>

                    <div>
                        <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Dietary Notes / Allergies</label>
                        <Textarea
                            value={profileData.dietaryNotes}
                            onChange={(e) => setProfileData({ ...profileData, dietaryNotes: e.target.value })}
                            className="text-xs min-h-[60px]"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" size="sm" onClick={() => setIsEditProfileOpen(false)}>
                        Cancel
                    </Button>
                    <Button type="submit" size="sm" className="bg-teal-700 hover:bg-teal-800 text-white">
                        Save Changes
                    </Button>
                </DialogFooter>
            </form>
        </DialogContent>
    </Dialog>)
}