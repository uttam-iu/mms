import { Button } from "@/components/ui/button";
import { Calendar, Pencil, ShieldCheck, User } from "lucide-react";
import React from "react";
import { displayFormattedDate } from "@/lib/utils";
import UpdateProfileDialog from "./UpdateProfileDialog";

export default function PersonalInfo({ profileData, refetch }: { profileData: any, refetch: () => void }) {
    const [isEditProfileOpen, setIsEditProfileOpen] = React.useState(false);

    return <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-6 shadow-2xs space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <User size={16} className="text-teal-600" /> Personal Profile & Contact Info
            </h3>
            <Button
                onClick={() => setIsEditProfileOpen(true)}
                size="sm"
                variant="outline"
                className="h-7 text-xs font-medium border-zinc-300 dark:border-zinc-700 cursor-pointer"
            >
                <Pencil size={12} className="mr-1" /> Edit Info
            </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-1">
                <span className="text-zinc-400 font-semibold uppercase text-[10px] tracking-wider">Full Name</span>
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                    {profileData?.fullName}
                </div>
            </div>

            <div className="space-y-1">
                <span className="text-zinc-400 font-semibold uppercase text-[10px] tracking-wider">Email / Username</span>
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 font-semibold text-zinc-800 dark:text-zinc-200">
                    {profileData?.userName}
                </div>
            </div>

            <div className="space-y-1">
                <span className="text-zinc-400 font-semibold uppercase text-[10px] tracking-wider">Phone Number</span>
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 font-mono font-semibold text-zinc-800 dark:text-zinc-200">
                    {profileData?.phone}
                </div>
            </div>

            <div className="space-y-1">
                <span className="text-zinc-400 font-semibold uppercase text-[10px] tracking-wider">Emergency Contact</span>
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 font-mono font-semibold text-zinc-800 dark:text-zinc-200">
                    {profileData?.emergencyContact || ''}
                </div>
            </div>

            <div className="space-y-1">
                <span className="text-zinc-400 font-semibold uppercase text-[10px] tracking-wider">System Role</span>
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 font-bold text-teal-700 dark:text-teal-400 flex items-center gap-1.5">
                    <ShieldCheck size={14} /> {profileData?.role === 'admin' ? 'Admin' : 'Member'}
                </div>
            </div>

            <div className="space-y-1">
                <span className="text-zinc-400 font-semibold uppercase text-[10px] tracking-wider">Joined Date</span>
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 font-mono font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                    <Calendar size={14} className="text-zinc-400" /> {`${displayFormattedDate(profileData?.createdAt)}`}
                </div>
            </div>

            <div className="md:col-span-2 space-y-1">
                <span className="text-zinc-400 font-semibold uppercase text-[10px] tracking-wider">Flat Address</span>
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300">
                    {profileData?.address}
                </div>
            </div>
        </div>
        <UpdateProfileDialog refetch={refetch} profileData={profileData} isEditProfileOpen={isEditProfileOpen} onCancel={() => setIsEditProfileOpen(false)} />

    </div>
}