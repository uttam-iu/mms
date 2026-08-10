/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Lock,
  Unlock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { USER_TYPE, IndividualCostItem } from '@/types/user.types';
import { AddMemberDialog } from './AddMemberDialog';
import { EditMemberDialog } from './EditMemberDialog';
import { AddFixedCostDialog } from './AddFixedCostDialog';
import { MemberFilter } from './MemberFilter';
import { MemberTable } from './MemberTable';
import { useApiCall } from '@/hooks/useApiCall';
import { useTitle } from '@/hooks/useTitle';


export default function MembersPage() {
  // const searchParams = useSearchParams();

  // const paramSearch = searchParams.get('search') || '';
  // const paramStatus = searchParams.get('status') || 'all';

  const [isAdminMode, setIsAdminMode] = useState<boolean>(true);


  const { isLoading, resp } = useApiCall('members', 'GET', {});


  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<USER_TYPE | null>(null);

  const [managingCostMember, setManagingCostMember] = React.useState<USER_TYPE | null>(null);
  const [memberCosts, setMemberCosts] = React.useState<IndividualCostItem[]>([]);
  const handleOpenCostModal = (member: USER_TYPE) => {
    setManagingCostMember(member);
    setMemberCosts(
      member.individualCosts && member.individualCosts.length > 0
        ? [...member.individualCosts]
        : [{ id: `ic-${member.userId}-1`, costType: 'House Rent', amount: 3500 }]
    );
  };

  const handleSaveCostsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!managingCostMember) return;

    console.log(managingCostMember)
  };

  const handleToggleUserStatus = (userId: number) => {
    console.log('handleToggleUserStatus', userId)
  };

  const handleAddMemberSubmit = (e: React.FormEvent, newMemberData: any) => {
    e.preventDefault();
    if (!newMemberData.fullName || !newMemberData.userName || !newMemberData.phone) return;

    const newMember: USER_TYPE = {
      userId: Date.now(),
      fullName: newMemberData.fullName.trim(),
      userName: newMemberData.userName.trim(),
      phone: newMemberData.phone.trim(),
      photoUrl: newMemberData.photoUrl.trim() || 'https://github.com/shadcn.png',
      role: newMemberData.role,
      status: newMemberData.status,
      joinedDate: new Date().toISOString().split('T')[0],
      individualCosts: [{ id: `ic-${Date.now()}-1`, costType: 'House Rent', amount: 3500 }],
    };

    console.log(newMember)
    setIsAddModalOpen(false);
  };

  const handleEditMemberSubmit = (e: React.FormEvent,) => {
    e.preventDefault();
    if (!editingMember) return;

    console.log(editingMember)
    setEditingMember(null);
  };

  useTitle('House Members');

  return (
    <div className="min-h-screen bg-zinc-50/60 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans pb-4">

      <div className="sticky top-0 z-20 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 p-2 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-teal-600/10 text-teal-700 dark:bg-teal-500/20 dark:text-teal-400 flex items-center justify-center font-bold">
              <Users size={20} />
            </div>
            <div>
              <h1 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                House Members
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                  {resp?.data?.length} Total Shown
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap w-full md:w-auto">
            <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800/80 px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs">
              <span className="font-semibold text-zinc-600 dark:text-zinc-400 flex items-center gap-1">
                {isAdminMode ? <Unlock size={13} className="text-amber-500" /> : <Lock size={13} className="text-zinc-400" />}
                {isAdminMode ? 'Admin Mode' : 'Read-Only'}
              </span>
              <button
                type="button"
                onClick={() => setIsAdminMode((prev) => !prev)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${isAdminMode ? 'bg-teal-600' : 'bg-zinc-300 dark:bg-zinc-700'
                  }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${isAdminMode ? 'translate-x-4' : 'translate-x-0'
                    }`}
                />
              </button>
            </div>

            {isAdminMode && (
              <Button
                onClick={() => setIsAddModalOpen(true)}
                size="sm"
                className="h-8 text-xs font-semibold bg-teal-700 hover:bg-teal-800 text-white cursor-pointer shadow-xs flex items-center gap-1.5 rounded-lg"
              >
                <UserPlus size={14} /> Add New Member
              </Button>
            )}
          </div>
        </div>
      </div>


      <div className="max-w-7xl mx-auto px-2 pt-2 space-y-6">
        <MemberFilter />
        <MemberTable filteredMembers={resp?.data || []} isLoading={isLoading} isAdminMode={isAdminMode} handleToggleUserStatus={handleToggleUserStatus} handleOpenCostModal={handleOpenCostModal} setEditingMember={setEditingMember} />
      </div>

      <AddMemberDialog isAddModalOpen={isAddModalOpen} setIsAddModalOpen={setIsAddModalOpen} handleAddMemberSubmit={handleAddMemberSubmit} />
      <EditMemberDialog editingMember={editingMember} setEditingMember={setEditingMember} handleEditMemberSubmit={handleEditMemberSubmit} />
      <AddFixedCostDialog managingCostMember={managingCostMember} setManagingCostMember={setManagingCostMember} memberCosts={memberCosts} setMemberCosts={setMemberCosts} handleSaveCostsSubmit={handleSaveCostsSubmit} />

    </div>
  );
}
