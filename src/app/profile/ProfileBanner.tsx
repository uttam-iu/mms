import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail, Phone, ShieldCheck, Sparkles } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function ProfileBanner({ profileData }: { profileData: any }) {
    return (<div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-2xs overflow-hidden">
        {/* Decorative Cover Gradient */}
        <div className="h-36 bg-gradient-to-r from-teal-700 via-teal-600 to-teal-900 relative">
            <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-semibold flex items-center gap-1.5 border border-white/30">
                <Sparkles size={13} className="text-amber-300" /> Meal Management System Member
            </div>
        </div>

        <div className="px-6 pb-6 pt-0 relative flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 -mt-14">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
                {/* Profile Avatar with Edit Badge */}
                <div className="relative group">
                    <Avatar className="h-24 w-24 ring-4 ring-white dark:ring-zinc-900 shadow-md">
                        <AvatarImage src={profileData?.photoUrl} alt={profileData?.fullName} />
                        <AvatarFallback className="text-2xl font-bold bg-teal-800 text-white">
                            {profileData?.fullName?.[0]}
                        </AvatarFallback>
                    </Avatar>
                    {/* <button
                        type="button"
                        onClick={() => setIsEditProfileOpen(true)}
                        className="absolute bottom-0 right-0 p-1.5 rounded-full bg-teal-700 text-white hover:bg-teal-800 shadow-md border border-white dark:border-zinc-900 cursor-pointer transition-transform hover:scale-110"
                        title="Update profile picture"
                    >
                        <Camera size={13} />
                    </button> */}
                </div>

                {/* Name & Role Details */}
                <div className="space-y-1">
                    <h1 className="text-xl font-black text-zinc-900 dark:text-zinc-100 flex items-center justify-center sm:justify-start gap-2">
                        <div>
                            <div>
                                {profileData?.fullName}
                            </div>
                            <div className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                                <ShieldCheck size={11} /> {profileData?.role === 'admin' ? 'House Manager (Admin)' : 'Member'}
                            </div>
                        </div>
                    </h1>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center justify-center sm:justify-start gap-3">
                        <span className="flex items-center gap-1"><Mail size={12} /> {profileData?.userName}</span>
                        <span className="flex items-center gap-1"><Phone size={12} /> {profileData?.phone}</span>
                    </p>
                </div>
            </div>


        </div>
    </div>)
}