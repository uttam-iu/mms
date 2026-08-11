'use client';

import { useState } from 'react';
import { useAppState } from '@/context/AppContext';
import { USER_TYPE } from '@/types/user.types';
import SummaryCard from './SummaryCard';
import ProfileBanner from './ProfileBanner';
import UpdateProfile from './UpdateProfileDialog';
import PersonalInfo from './PersonalInfo';
import PasswordChange from './PasswordChange';

export default function ProfilePage() {
  const ctx = useAppState();

  // Current user from state or fallback
  const user: USER_TYPE = ctx?.state?.user || {
    userId: 1,
    phone: '01617630101',
    userName: 'uttam@k.com',
    fullName: 'Uttam Kumar',
    photoUrl: 'https://github.com/shadcn.png',
    role: 'admin',
    status: 'active',
    joinedDate: '2024-01-15',
  };

  // Local state for editable user profile details
  const [profileData, setProfileData] = useState({
    fullName: user.fullName,
    userName: user.userName,
    phone: user.phone,
    photoUrl: user.photoUrl || 'https://github.com/shadcn.png',
    role: user.role || 'admin',
    joinedDate: user.joinedDate || '2024-01-15',
    emergencyContact: '01711223344',
    address: 'Flat 4B, House 12, Road 5, Dhanmondi, Dhaka',
    defaultBreakfast: '0.5',
    defaultLunch: '1.0',
    defaultDinner: '1.0',
    foodPreference: 'Non-Vegetarian (Chicken & Fish preferred)',
    dietaryNotes: 'No sea-fish, prefers low spices in dinner.',
  });



  return (
    <div className="min-h-screen bg-zinc-50/60 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans pb-16">
      <div className="max-w-5xl mx-auto px-4 pt-6 space-y-6">

        <ProfileBanner profileData={profileData} />
        <SummaryCard />

        <div className="space-y-4">

          <PersonalInfo profileData={profileData} setProfileData={setProfileData} />

          {/* TAB 2: MEAL PREFERENCES */}
          {/* {activeTab === 'preferences' && (
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-6 shadow-2xs space-y-6">
              <div className="border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Utensils size={16} className="text-amber-600" /> Default Meal Routine & Food Preferences
                </h3>
                <p className="text-xs text-zinc-500">
                  Your daily default meal count settings and dietary notes for the house manager.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800 space-y-1 text-center">
                  <span className="text-zinc-500 font-semibold">Breakfast Default</span>
                  <div className="text-2xl font-black text-amber-600">{profileData.defaultBreakfast} meal</div>
                  <span className="text-[10px] text-zinc-400">Recorded as 0.5 per day</span>
                </div>

                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800 space-y-1 text-center">
                  <span className="text-zinc-500 font-semibold">Lunch Default</span>
                  <div className="text-2xl font-black text-teal-600">{profileData.defaultLunch} meal</div>
                  <span className="text-[10px] text-zinc-400">Recorded as 1.0 per day</span>
                </div>

                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800 space-y-1 text-center">
                  <span className="text-zinc-500 font-semibold">Dinner Default</span>
                  <div className="text-2xl font-black text-indigo-600">{profileData.defaultDinner} meal</div>
                  <span className="text-[10px] text-zinc-400">Recorded as 1.0 per day</span>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                <div className="space-y-1">
                  <span className="text-zinc-400 font-semibold uppercase text-[10px] tracking-wider">Food Choice Preference</span>
                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 font-semibold text-zinc-800 dark:text-zinc-200">
                    {profileData.foodPreference}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-zinc-400 font-semibold uppercase text-[10px] tracking-wider">Dietary Restrictions & Allergies</span>
                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300">
                    {profileData.dietaryNotes}
                  </div>
                </div>
              </div>
            </div>
          )} */}

          <PasswordChange />
        </div>
      </div>

    </div>
  );
}
