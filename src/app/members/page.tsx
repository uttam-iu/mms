'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Users,
  Search,
  UserPlus,
  Pencil,
  CheckCircle2,
  XCircle,
  Phone,
  Mail,
  Calendar,
  Filter,
  UserCheck,
  UserX,
  Lock,
  Unlock,
  ShieldAlert,
  Coins,
  Trash2,
  Plus,
  Building,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import USERS_SEED from '@/dummyData/users.json';
import { USER_TYPE, IndividualCostItem } from '@/types/user.types';

const DEFAULT_INDIVIDUAL_COSTS: { [key: number]: IndividualCostItem[] } = {
  1: [{ id: 'ic-1-1', costType: 'House Rent', amount: 3500 }, { id: 'ic-1-2', costType: 'Room Gas Addon', amount: 300 }],
  2: [{ id: 'ic-2-1', costType: 'House Rent', amount: 4000 }],
  3: [{ id: 'ic-3-1', costType: 'House Rent', amount: 3800 }, { id: 'ic-3-2', costType: 'Parking Fee', amount: 500 }],
  4: [{ id: 'ic-4-1', costType: 'House Rent', amount: 3500 }],
  5: [{ id: 'ic-5-1', costType: 'House Rent', amount: 3500 }],
};

// Extended initial members list
const INITIAL_MEMBERS: USER_TYPE[] = USERS_SEED.map((u, idx) => ({
  ...u,
  role: idx === 0 ? 'admin' : 'member',
  status: idx === 4 ? 'inactive' : 'active',
  joinedDate: `2024-0${(idx % 6) + 1}-15`,
  individualCosts: DEFAULT_INDIVIDUAL_COSTS[u.userId] || [{ id: `ic-${u.userId}-1`, costType: 'House Rent', amount: 3500 }],
}));

export default function MembersPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Search parameters from URL
  const paramSearch = searchParams.get('search') || '';
  const paramStatus = searchParams.get('status') || 'all';

  // Filter form local input states (before clicking Filter Perform button)
  const [searchInput, setSearchInput] = useState(paramSearch);
  const [statusSelect, setStatusSelect] = useState<'all' | 'active' | 'inactive'>(
    ['all', 'active', 'inactive'].includes(paramStatus) ? (paramStatus as any) : 'all'
  );

  // Toggle for testing Admin View vs Read-Only View
  const [isAdminMode, setIsAdminMode] = useState<boolean>(true);

  // Active members state
  const [members, setMembers] = useState<USER_TYPE[]>(INITIAL_MEMBERS);

  // Sync inputs if URL search parameters change externally
  useEffect(() => {
    setSearchInput(paramSearch);
    if (['all', 'active', 'inactive'].includes(paramStatus)) {
      setStatusSelect(paramStatus as any);
    }
  }, [paramSearch, paramStatus]);

  // Handle Perform Filter Button Click (Sets URL searchParams)
  const handleApplyFilter = () => {
    const params = new URLSearchParams();
    if (searchInput.trim()) params.set('search', searchInput.trim());
    if (statusSelect && statusSelect !== 'all') params.set('status', statusSelect);

    const queryString = params.toString();
    router.push(`/members${queryString ? `?${queryString}` : ''}`);
  };

  // Filtered member list derived from URL searchParams
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const q = paramSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        m.fullName.toLowerCase().includes(q) ||
        m.userName.toLowerCase().includes(q) ||
        m.phone.includes(q);

      const matchesStatus =
        paramStatus === 'all' || !paramStatus || (m.status || 'active') === paramStatus;

      return matchesSearch && matchesStatus;
    });
  }, [members, paramSearch, paramStatus]);

  // Add Member Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newMemberData, setNewMemberData] = useState({
    fullName: '',
    userName: '',
    phone: '',
    photoUrl: 'https://github.com/shadcn.png',
    role: 'member' as 'admin' | 'member',
    status: 'active' as 'active' | 'inactive',
  });

  // Edit Member Modal State
  const [editingMember, setEditingMember] = useState<USER_TYPE | null>(null);

  // Manage Individual Fixed Costs Modal State
  const [managingCostMember, setManagingCostMember] = useState<USER_TYPE | null>(null);
  const [memberCosts, setMemberCosts] = useState<IndividualCostItem[]>([]);

  const handleOpenCostModal = (member: USER_TYPE) => {
    setManagingCostMember(member);
    setMemberCosts(
      member.individualCosts && member.individualCosts.length > 0
        ? [...member.individualCosts]
        : [{ id: `ic-${member.userId}-1`, costType: 'House Rent', amount: 3500 }]
    );
  };

  const handleAddCostRow = () => {
    setMemberCosts((prev) => [
      ...prev,
      { id: `ic-${Date.now()}-${prev.length}`, costType: '', amount: 0 },
    ]);
  };

  const handleUpdateCostRow = (index: number, field: 'costType' | 'amount', value: any) => {
    setMemberCosts((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const handleRemoveCostRow = (index: number) => {
    setMemberCosts((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveCostsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!managingCostMember) return;

    const validCosts = memberCosts.filter(
      (c) => c.costType.trim() !== '' && !isNaN(Number(c.amount))
    );

    setMembers((prev) =>
      prev.map((m) =>
        m.userId === managingCostMember.userId
          ? { ...m, individualCosts: validCosts }
          : m
      )
    );

    setManagingCostMember(null);
  };

  // Handlers for Admin Actions
  const handleToggleUserStatus = (userId: number) => {
    setMembers((prev) =>
      prev.map((m) => {
        if (m.userId === userId) {
          const nextStatus = m.status === 'active' ? 'inactive' : 'active';
          return { ...m, status: nextStatus };
        }
        return m;
      })
    );
  };

  const handleAddMemberSubmit = (e: React.FormEvent) => {
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

    setMembers((prev) => [newMember, ...prev]);
    setIsAddModalOpen(false);
    setNewMemberData({
      fullName: '',
      userName: '',
      phone: '',
      photoUrl: 'https://github.com/shadcn.png',
      role: 'member',
      status: 'active',
    });
  };

  const handleEditMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;

    setMembers((prev) =>
      prev.map((m) => (m.userId === editingMember.userId ? editingMember : m))
    );
    setEditingMember(null);
  };

  return (
    <div className="min-h-screen bg-zinc-50/60 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans pb-4">
      {/* Sticky Header with Title and Admin Mode Switch */}
      <div className="sticky top-0 z-20 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 p-2 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-teal-600/10 text-teal-700 dark:bg-teal-500/20 dark:text-teal-400 flex items-center justify-center font-bold">
              <Users size={20} />
            </div>
            <div>
              <h1 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                House Members Directory Table
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                  {filteredMembers.length} Total Shown
                </span>
              </h1>
            </div>
          </div>

          {/* Admin Mode Switch & Add Member Action */}
          <div className="flex items-center gap-3 flex-wrap w-full md:w-auto">
            {/* Toggle Switch for Admin Mode vs Read-Only View */}
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

            {/* Add New Member Button (Admin Only) */}
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

      {/* FILTER CONTROLS SECTION WITH FILTER PERFORM BUTTON */}
      <div className="max-w-7xl mx-auto px-2 pt-2 space-y-6">
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-2 border border-zinc-200/80 dark:border-zinc-800 shadow-2xs">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-wrap w-full md:w-auto">
              {/* Search Input */}
              <div className="relative w-full md:w-80">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <Input
                  placeholder="Search by name, phone, email..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleApplyFilter();
                  }}
                  className="pl-9 h-9 text-xs bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800"
                />
              </div>

              {/* Status Select Dropdown */}
              <div className="flex items-center gap-1.5">
                <select
                  value={statusSelect}
                  onChange={(e) => setStatusSelect(e.target.value as any)}
                  className="h-9 text-xs font-semibold rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-3 text-zinc-800 dark:text-zinc-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500 cursor-pointer"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active Members</option>
                  <option value="inactive">Inactive Members</option>
                </select>
              </div>
            </div>

            {/* Filter Perform Button */}
            <Button
              onClick={handleApplyFilter}
              size="sm"
              className="h-9 text-xs font-semibold bg-teal-700 hover:bg-teal-800 text-white px-4 shadow-xs cursor-pointer flex items-center gap-1.5 rounded-lg w-full md:w-auto justify-center"
            >
              <Filter size={14} /> Filter
            </Button>
          </div>
        </div>

        {/* MEMBER LIST TABLE */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-2xs overflow-hidden">
          <div className="p-2 border-b border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              House Members Table
            </h3>
          </div>

          {filteredMembers.length === 0 ? (
            <div className="p-12 text-center text-xs text-zinc-400 space-y-2">
              <Users size={32} className="mx-auto text-zinc-400" />
              <p className="font-semibold">No member records match the applied filter.</p>
              <p>Try modifying your search or status selection and click Perform Filter.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 font-semibold border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="p-1">SL</th>
                    <th className="p-1">Member Name</th>
                    <th className="p-1">Email / Username</th>
                    <th className="p-1">Phone Number</th>
                    <th className="p-1 text-center">Role</th>
                    <th className="p-1 text-center">Status</th>
                    <th className="p-1">Fixed Individual Costs</th>
                    <th className="p-1">Joined Date</th>
                    <th className="p-1 text-right">
                      {isAdminMode ? 'Admin Actions' : 'Permissions'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60 text-zinc-800 dark:text-zinc-200">
                  {filteredMembers.map((member, index) => {
                    const isActive = (member.status || 'active') === 'active';
                    const isAdmin = member.role === 'admin';
                    const indCosts = member.individualCosts || [];
                    const indTotal = indCosts.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

                    return (
                      <tr key={member.userId} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors">
                        <td className="p-1 font-semibold text-zinc-700 dark:text-zinc-300">{index + 1}</td>

                        <td className="p-1 ">
                          <div className='flex items-center'>
                            <div className='font-medium flex  gap-2'>
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={member.photoUrl || ''} alt={member.fullName} />
                                <AvatarFallback>{member.fullName[0]}</AvatarFallback>
                              </Avatar>
                              <div className='flex items-center'>
                                <span className="font-semibold text-zinc-900 dark:text-zinc-100">{member.fullName}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-1 text-zinc-600 dark:text-zinc-400">{member.userName}</td>

                        <td className="p-1 font-mono text-zinc-700 dark:text-zinc-300">{member.phone}</td>

                        <td className="p-1 text-center">
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold rounded ${isAdmin
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                              : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                              }`}
                          >
                            {isAdmin ? 'Admin' : 'Member'}
                          </span>
                        </td>

                        <td className="p-1 text-center">
                          <span
                            className={`px-2.5 py-0.5 text-[10px] font-semibold rounded-full inline-flex items-center gap-1 ${isActive
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                              : 'bg-rose-50 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                              }`}
                          >
                            {isActive ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
                            {isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>

                        <td className="p-1">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 flex-wrap max-w-[220px]">
                              {indCosts.length > 0 ? (
                                indCosts.map((c) => (
                                  <span
                                    key={c.id}
                                    className="whitespace-nowrap px-2 py-0.5 text-[10px] font-semibold rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                                  >
                                    {c.costType}: ৳{c.amount.toLocaleString()}
                                  </span>
                                ))
                              ) : (
                                <span className="text-[10px] text-zinc-400 italic">None</span>
                              )}
                            </div>
                            {indCosts.length > 0 && (
                              <div className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                                Total: ৳{indTotal.toLocaleString()}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Joined Date */}
                        <td className="whitespace-nowrap p-1 text-zinc-500 font-mono text-[11px]">{member.joinedDate || '2024-01-15'}</td>

                        {/* Actions */}
                        <td className="p-1 text-right">
                          {isAdminMode ? (
                            <div className="flex items-center justify-end gap-1.5 flex-wrap">

                              <button
                                type="button"
                                onClick={() => handleToggleUserStatus(member.userId)}
                                className={`text-[11px] font-semibold px-2 py-1 rounded border transition-colors cursor-pointer ${isActive
                                  ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800 hover:bg-rose-100'
                                  : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
                                  }`}
                              >
                                {isActive ? 'Deactivate' : 'Activate'}
                              </button>

                              {/* Edit Button */}
                              <div className='flex gap-2'>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleOpenCostModal(member)}
                                  className="h-6 text-[11px] font-semibold px-2 cursor-pointer border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950"
                                >
                                  <Coins size={11} className="mr-1" /> Fixed Costs
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setEditingMember(member)}
                                  className="h-6 text-[11px] font-medium px-2 cursor-pointer border-zinc-300 dark:border-zinc-700"
                                >
                                  <Pencil size={11} className="mr-1" /> Edit
                                </Button>
                              </div>

                            </div>
                          ) : (
                            <span className="text-[10px] text-zinc-400 italic">Read-Only</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ADD NEW MEMBER MODAL (ADMIN PERMITTED) */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <form onSubmit={handleAddMemberSubmit}>
            <DialogHeader>
              <DialogTitle className="text-sm font-bold flex items-center gap-2">
                <UserPlus size={16} className="text-teal-600" /> Add New House Member
              </DialogTitle>
              <DialogDescription className="text-xs">
                Fill in details to create a new member profile.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-3 text-xs">
              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Full Name</label>
                <Input
                  placeholder="e.g. Tanvir Hossain"
                  value={newMemberData.fullName}
                  onChange={(e) => setNewMemberData({ ...newMemberData, fullName: e.target.value })}
                  className="h-8 text-xs"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Username / Email</label>
                <Input
                  type="email"
                  placeholder="tanvir@k.com"
                  value={newMemberData.userName}
                  onChange={(e) => setNewMemberData({ ...newMemberData, userName: e.target.value })}
                  className="h-8 text-xs"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Phone Number</label>
                <Input
                  placeholder="01712345678"
                  value={newMemberData.phone}
                  onChange={(e) => setNewMemberData({ ...newMemberData, phone: e.target.value })}
                  className="h-8 text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Role</label>
                  <select
                    value={newMemberData.role}
                    onChange={(e) => setNewMemberData({ ...newMemberData, role: e.target.value as any })}
                    className="w-full h-8 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 text-xs"
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Status</label>
                  <select
                    value={newMemberData.status}
                    onChange={(e) => setNewMemberData({ ...newMemberData, status: e.target.value as any })}
                    className="w-full h-8 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 text-xs"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-teal-700 hover:bg-teal-800 text-white">
                Save Member
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* EDIT MEMBER MODAL (ADMIN PERMITTED) */}
      <Dialog open={!!editingMember} onOpenChange={() => setEditingMember(null)}>
        <DialogContent className="sm:max-w-[420px]">
          {editingMember && (
            <form onSubmit={handleEditMemberSubmit}>
              <DialogHeader>
                <DialogTitle className="text-sm font-bold flex items-center gap-2">
                  <Pencil size={16} className="text-teal-600" /> Edit Member Profile
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-3 py-3 text-xs">
                <div>
                  <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Full Name</label>
                  <Input
                    value={editingMember.fullName}
                    onChange={(e) => setEditingMember({ ...editingMember, fullName: e.target.value })}
                    className="h-8 text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Username / Email</label>
                  <Input
                    value={editingMember.userName}
                    onChange={(e) => setEditingMember({ ...editingMember, userName: e.target.value })}
                    className="h-8 text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Phone Number</label>
                  <Input
                    value={editingMember.phone}
                    onChange={(e) => setEditingMember({ ...editingMember, phone: e.target.value })}
                    className="h-8 text-xs"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Role</label>
                    <select
                      value={editingMember.role || 'member'}
                      onChange={(e) => setEditingMember({ ...editingMember, role: e.target.value as any })}
                      className="w-full h-8 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 text-xs"
                    >
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Status</label>
                    <select
                      value={editingMember.status || 'active'}
                      onChange={(e) => setEditingMember({ ...editingMember, status: e.target.value as any })}
                      className="w-full h-8 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 text-xs"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" size="sm" onClick={() => setEditingMember(null)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-teal-700 hover:bg-teal-800 text-white">
                  Update Member
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* MANAGE INDIVIDUAL FIXED COSTS MODAL */}
      <Dialog open={!!managingCostMember} onOpenChange={() => setManagingCostMember(null)}>
        <DialogContent className="sm:max-w-[500px]">
          {managingCostMember && (
            <form onSubmit={handleSaveCostsSubmit}>
              <DialogHeader>
                <DialogTitle className="text-sm font-bold flex items-center gap-2">
                  <Coins size={16} className="text-indigo-600" /> Individual Fixed Costs ({managingCostMember.fullName})
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Set fixed individual costs (e.g. house rent, seat rent, private utilities) assigned to {managingCostMember.fullName}.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 py-4 text-xs max-h-[350px] overflow-y-auto custom-scrollbar">
                {memberCosts.length === 0 ? (
                  <div className="text-center py-4 text-zinc-400">No fixed cost items added yet.</div>
                ) : (
                  memberCosts.map((cost, idx) => (
                    <div key={cost.id || idx} className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-900 p-2 rounded-lg border border-zinc-200 dark:border-zinc-800">
                      <div className="flex-1">
                        <label className="block text-[10px] font-semibold text-zinc-500 mb-0.5">Cost Type</label>
                        <Input
                          placeholder="e.g. House Rent, Seat Rent"
                          value={cost.costType}
                          onChange={(e) => handleUpdateCostRow(idx, 'costType', e.target.value)}
                          className="h-8 text-xs bg-white dark:bg-zinc-950"
                          required
                        />
                      </div>
                      <div className="w-32">
                        <label className="block text-[10px] font-semibold text-zinc-500 mb-0.5">Value (৳)</label>
                        <Input
                          type="number"
                          placeholder="e.g. 3500"
                          value={cost.amount}
                          onChange={(e) => handleUpdateCostRow(idx, 'amount', Number(e.target.value))}
                          className="h-8 text-xs bg-white dark:bg-zinc-950"
                          required
                        />
                      </div>
                      <div className="pt-3">
                        <button
                          type="button"
                          onClick={() => handleRemoveCostRow(idx)}
                          className="p-1.5 rounded text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                          title="Remove cost entry"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                )}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddCostRow}
                  className="w-full h-8 text-xs border-dashed border-indigo-300 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950 cursor-pointer"
                >
                  <Plus size={13} className="mr-1" /> Add Fixed Cost Entry
                </Button>

                <div className="mt-4 p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-between">
                  <span className="font-semibold text-indigo-900 dark:text-indigo-200">Total Fixed Individual Cost:</span>
                  <span className="text-sm font-black text-indigo-700 dark:text-indigo-300">
                    ৳{memberCosts.reduce((sum, item) => sum + (Number(item.amount) || 0), 0).toLocaleString()}
                  </span>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" size="sm" onClick={() => setManagingCostMember(null)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-indigo-700 hover:bg-indigo-800 text-white">
                  Save Fixed Costs
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
