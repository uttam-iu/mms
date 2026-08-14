'use client';

import SummaryCard from './SummaryCard';
import ProfileBanner from './ProfileBanner';
import PersonalInfo from './PersonalInfo';
import PasswordChange from './PasswordChange';
import { useTitle } from '@/hooks/useTitle';
import { useSocket } from '@/hooks/useSocket';
import Loader from '@/components/Loader';

import { ApiResponse, USER_TYPE } from '@/types/user.types';

export default function ProfilePage() {
  const { data: profileResp, isLoading, refetch } = useSocket<ApiResponse<USER_TYPE>>('emit', 'get_my_profile', null);
  useTitle('My Profile');

  return (
    <div className="w-full bg-zinc-50/60 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans pb-6">
      {isLoading || !profileResp?.data ? <Loader /> : <div className="max-w-5xl mx-auto px-4 pt-6 space-y-6">
        <ProfileBanner profileData={profileResp?.data} />
        <SummaryCard />
        <div className="space-y-4">
          <PersonalInfo profileData={profileResp?.data} refetch={refetch} />
          <PasswordChange />
        </div>
      </div>}
    </div>
  );
}
