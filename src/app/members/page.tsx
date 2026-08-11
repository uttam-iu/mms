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
import { EditMemberDialog } from './EditMemberDialog';
import { AddFixedCostDialog } from './AddFixedCostDialog';
import { MemberFilter } from './MemberFilter';
import { MemberTable } from './MemberTable';
import { useApiCall } from '@/hooks/useApiCall';
import { useTitle } from '@/hooks/useTitle';
import { useSocket } from '@/hooks/useSocket';


export default function MembersPage() {
  // const searchParams = useSearchParams();

  // const paramSearch = searchParams.get('search') || '';
  // const paramStatus = searchParams.get('status') || 'all';
  const { data: memberListResp, isLoading, refetch } = useSocket('emit', 'get_members', null);
  const memberList = memberListResp?.data || [];

  const [dialogProps, setDialogProps] = React.useState<{ type: 'ADD' | 'UPDATE' | 'DELETE' | 'COST' | 'ACTIVATE' | 'DEACTIVATE', row?: USER_TYPE | null } | null>(null)


  // const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  // const [editingMember, setEditingMember] = useState<USER_TYPE | null>(null);

  // const [managingCostMember, setManagingCostMember] = React.useState<USER_TYPE | null>(null);
  // const [memberCosts, setMemberCosts] = React.useState<IndividualCostItem[]>([]);
  // const handleOpenCostModal = (member: USER_TYPE) => {
  //   setManagingCostMember(member);
  //   setMemberCosts(
  //     member.individualCosts && member.individualCosts.length > 0
  //       ? [...member.individualCosts]
  //       : [{ id: `ic-${member.userId}-1`, costType: 'House Rent', amount: 3500 }]
  //   );
  // };

  // const handleSaveCostsSubmit = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (!managingCostMember) return;

  //   console.log(managingCostMember)
  // };



  // const handleEditMemberSubmit = (e: React.FormEvent,) => {
  //   e.preventDefault();
  //   // if (!editingMember) return;

  //   // console.log(editingMember)
  //   // setEditingMember(null);
  // };

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
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap w-full md:w-auto">
            <Button
              onClick={() => setDialogProps({ type: 'ADD', row: null })}
              size="sm"
              className="h-8 text-xs font-semibold bg-teal-700 hover:bg-teal-800 text-white cursor-pointer shadow-xs flex items-center gap-1.5 rounded-lg"
            >
              <UserPlus size={14} /> Add New Member
            </Button>

          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-2 pt-2 space-y-6">
        <MemberFilter />
        <MemberTable memberList={memberList} isLoading={isLoading} setDialogProps={setDialogProps} />
      </div>

      {(dialogProps?.type === "UPDATE" || dialogProps?.type === 'ADD') && <EditMemberDialog type={dialogProps?.type || ''} row={dialogProps?.row || null} onCancel={() => setDialogProps(null)} refetch={refetch} />}
      {/* <AddFixedCostDialog managingCostMember={managingCostMember} setManagingCostMember={setManagingCostMember} memberCosts={memberCosts} setMemberCosts={setMemberCosts} handleSaveCostsSubmit={handleSaveCostsSubmit} /> */}

    </div>
  );
}
