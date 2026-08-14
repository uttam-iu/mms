
'use client';

import React from 'react';
import { USER_TYPE } from '@/types/user.types';
import { EditMemberDialog } from './EditMemberDialog';
import { MemberFilter } from './MemberFilter';
import { MemberTable } from './MemberTable';
import { useTitle } from '@/hooks/useTitle';
import { useSocket } from '@/hooks/useSocket';
import { useSearchParams } from 'next/navigation';
import { AddFixedCostDialog } from './AddFixedCostDialog';

export default function MembersPage() {
  const searchParams = useSearchParams();

  const { data: memberListResp, isLoading, refetch } = useSocket<{ data: USER_TYPE[] }>('emit', 'get_members', {
    searchText: searchParams.get('search') || '',
    status: searchParams.get('status') || '',
  });
  const memberList = memberListResp?.data || [];

  const [dialogProps, setDialogProps] = React.useState<{ type: 'ADD' | 'UPDATE' | 'DELETE' | 'COST' | 'ACTIVATE' | 'DEACTIVATE', row?: USER_TYPE | null } | null>(null)

  useTitle('House Members');

  return (
    <div className="w-full bg-zinc-50/60 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans pb-4">
      <div className="sticky top-[-8px] z-20 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 p-2 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-start md:items-center justify-end gap-3">
          <MemberFilter />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-2 pt-2 space-y-6">
        <MemberTable memberList={memberList} isLoading={isLoading} setDialogProps={setDialogProps} />
      </div>

      {(dialogProps?.type === "UPDATE" || dialogProps?.type === 'ADD') && <EditMemberDialog type={dialogProps?.type || ''} row={dialogProps?.row || null} onCancel={() => setDialogProps(null)} refetch={refetch} />}
      {(dialogProps?.type === "COST") && <AddFixedCostDialog row={dialogProps?.row || null} onCancel={() => setDialogProps(null)} refetch={refetch} />}
    </div>
  );
}
