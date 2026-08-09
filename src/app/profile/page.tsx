'use client';

import React, { useState } from 'react';
import { useAppState } from '@/context/AppContext';
import { USER_TYPE } from '@/types/user.types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  User,
  Mail,
  Phone,
  Calendar,
  ShieldCheck,
  Utensils,
  Camera,
  Pencil,
  Lock,
  CheckCircle2,
  AlertCircle,
  PiggyBank,
  Wallet,
  Sparkles,
  Heart,
  FileText,
  Key,
} from 'lucide-react';

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

  // Edit Profile Modal state
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  // Security password state
  const [passwordState, setPasswordState] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordAlert, setPasswordAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Active Profile Sub-Tab
  const [activeTab, setActiveTab] = useState<'info' | 'preferences' | 'security'>('info');

  // Handle Edit Profile Save
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (ctx?.setUser) {
      ctx.setUser({
        ...user,
        fullName: profileData.fullName,
        userName: profileData.userName,
        phone: profileData.phone,
        photoUrl: profileData.photoUrl,
      });
    }
    setIsEditProfileOpen(false);
  };

  // Handle Update Password
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordState.currentPassword) {
      setPasswordAlert({ type: 'error', message: 'Please enter your current password.' });
      return;
    }
    if (passwordState.newPassword.length < 6) {
      setPasswordAlert({ type: 'error', message: 'New password must be at least 6 characters.' });
      return;
    }
    if (passwordState.newPassword !== passwordState.confirmPassword) {
      setPasswordAlert({ type: 'error', message: 'New password and confirm password do not match.' });
      return;
    }

    setPasswordAlert({ type: 'success', message: 'Your password has been updated successfully!' });
    setPasswordState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  return (
    <div className="min-h-screen bg-zinc-50/60 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans pb-16">
      <div className="max-w-5xl mx-auto px-4 pt-6 space-y-6">
        {/* HEADER PROFILE BANNER & CARD */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-2xs overflow-hidden">
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
                  <AvatarImage src={profileData.photoUrl} alt={profileData.fullName} />
                  <AvatarFallback className="text-2xl font-bold bg-teal-800 text-white">
                    {profileData.fullName[0]}
                  </AvatarFallback>
                </Avatar>
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(true)}
                  className="absolute bottom-0 right-0 p-1.5 rounded-full bg-teal-700 text-white hover:bg-teal-800 shadow-md border border-white dark:border-zinc-900 cursor-pointer transition-transform hover:scale-110"
                  title="Update profile picture"
                >
                  <Camera size={13} />
                </button>
              </div>

              {/* Name & Role Details */}
              <div className="space-y-1">
                <h1 className="text-xl font-black text-zinc-900 dark:text-zinc-100 flex items-center justify-center sm:justify-start gap-2">
                  <div>
                    <div>
                      {profileData.fullName}
                    </div>
                    <div className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                      <ShieldCheck size={11} /> {profileData.role === 'admin' ? 'House Manager (Admin)' : 'Member'}
                    </div>
                  </div>
                </h1>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center justify-center sm:justify-start gap-3">
                  <span className="flex items-center gap-1"><Mail size={12} /> {profileData.userName}</span>
                  <span className="flex items-center gap-1"><Phone size={12} /> {profileData.phone}</span>
                </p>
              </div>
            </div>


          </div>
        </div>

        {/* QUICK STATS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-zinc-200/80 dark:border-zinc-800 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-zinc-500">Monthly Meals Consumed</span>
              <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-0.5">72 Meals</div>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600">
              <Utensils size={20} />
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-zinc-200/80 dark:border-zinc-800 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-zinc-500">Total Deposits Paid</span>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">৳3,500</div>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600">
              <PiggyBank size={20} />
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-zinc-200/80 dark:border-zinc-800 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-zinc-500">House Account Status</span>
              <div className="text-2xl font-black text-teal-600 dark:text-teal-400 mt-0.5">+৳250 <span className="text-xs font-normal text-zinc-400">Surplus</span></div>
            </div>
            <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600">
              <Wallet size={20} />
            </div>
          </div>
        </div>

        {/* NAVIGATION SUB-TABS */}
        <div className="space-y-4">
          <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800 w-full sm:w-auto inline-flex">
            <button
              type="button"
              onClick={() => setActiveTab('info')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${activeTab === 'info'
                ? 'bg-white dark:bg-zinc-800 text-teal-700 dark:text-teal-400 shadow-xs'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
            >
              <User size={14} /> Personal Information
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preferences')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${activeTab === 'preferences'
                ? 'bg-white dark:bg-zinc-800 text-teal-700 dark:text-teal-400 shadow-xs'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
            >
              <Utensils size={14} /> Meal Preferences & System
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('security')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${activeTab === 'security'
                ? 'bg-white dark:bg-zinc-800 text-teal-700 dark:text-teal-400 shadow-xs'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
            >
              <Lock size={14} /> Security & Password
            </button>
          </div>

          {/* TAB 1: PERSONAL INFORMATION */}
          {activeTab === 'info' && (
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-6 shadow-2xs space-y-6">
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
                    {profileData.fullName}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-zinc-400 font-semibold uppercase text-[10px] tracking-wider">Email / Username</span>
                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 font-semibold text-zinc-800 dark:text-zinc-200">
                    {profileData.userName}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-zinc-400 font-semibold uppercase text-[10px] tracking-wider">Phone Number</span>
                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 font-mono font-semibold text-zinc-800 dark:text-zinc-200">
                    {profileData.phone}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-zinc-400 font-semibold uppercase text-[10px] tracking-wider">Emergency Contact</span>
                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 font-mono font-semibold text-zinc-800 dark:text-zinc-200">
                    {profileData.emergencyContact}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-zinc-400 font-semibold uppercase text-[10px] tracking-wider">System Role</span>
                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 font-bold text-teal-700 dark:text-teal-400 flex items-center gap-1.5">
                    <ShieldCheck size={14} /> {profileData.role === 'admin' ? 'House Manager (Admin)' : 'Member'}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-zinc-400 font-semibold uppercase text-[10px] tracking-wider">Joined Date</span>
                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 font-mono font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                    <Calendar size={14} className="text-zinc-400" /> {profileData.joinedDate}
                  </div>
                </div>

                <div className="md:col-span-2 space-y-1">
                  <span className="text-zinc-400 font-semibold uppercase text-[10px] tracking-wider">Flat Address</span>
                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300">
                    {profileData.address}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MEAL PREFERENCES */}
          {activeTab === 'preferences' && (
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
          )}

          {/* TAB 3: SECURITY & PASSWORD UPDATE */}
          {activeTab === 'security' && (
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-6 shadow-2xs space-y-6">
              <div className="border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Lock size={16} className="text-teal-600" /> Security & Password Update
                </h3>
                <p className="text-xs text-zinc-500">
                  Update your password to keep your account safe.
                </p>
              </div>

              {passwordAlert && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${passwordAlert.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                    : 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
                    }`}
                >
                  {passwordAlert.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  <span>{passwordAlert.message}</span>
                </div>
              )}

              <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md text-xs">
                <div>
                  <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Current Password</label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={passwordState.currentPassword}
                    onChange={(e) => setPasswordState({ ...passwordState, currentPassword: e.target.value })}
                    className="h-9 text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">New Password</label>
                  <Input
                    type="password"
                    placeholder="At least 6 characters"
                    value={passwordState.newPassword}
                    onChange={(e) => setPasswordState({ ...passwordState, newPassword: e.target.value })}
                    className="h-9 text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Confirm New Password</label>
                  <Input
                    type="password"
                    placeholder="Re-enter new password"
                    value={passwordState.confirmPassword}
                    onChange={(e) => setPasswordState({ ...passwordState, confirmPassword: e.target.value })}
                    className="h-9 text-xs"
                    required
                  />
                </div>

                <Button type="submit" size="sm" className="bg-teal-700 hover:bg-teal-800 text-white font-semibold cursor-pointer">
                  Update Password
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* EDIT PROFILE MODAL DIALOG */}
      <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
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
      </Dialog>
    </div>
  );
}
