'use client';

import React, { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { referralService } from '@/services/referralService';
import { userService } from '@/services/userService';
import { BookOpen, Loader2, Sparkles, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';

import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileStats from '@/components/profile/ProfileStats';
import { IntelligenceDiscovery } from '@/components/profile/IntelligenceDiscovery';
import ProfileMenu from '@/components/profile/ProfileMenu';
import EditProfileModal from '@/components/profile/EditProfileModal';
import NiceModal from '@/components/common/NiceModal';

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [referralCode, setReferralCode] = useState<string>('...');
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({ displayName: '', phone: '' });
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    type: 'success' | 'warning' | 'info';
    cancelText?: string;
  }>({
    isOpen: false,
    title: '',
    description: '',
    type: 'info'
  });

  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('profile');

  const showAlert = (title: string, description: string, type: 'info' | 'warning' | 'success' = 'info', cancelText: string = "Cancel") => {
    setModalConfig({
      isOpen: true,
      title,
      description,
      type,
      cancelText
    });
  };

  useEffect(() => {
    const upgradeStatus = searchParams.get('upgrade');
    if (upgradeStatus === 'success') {
      showAlert('Upgrade Successful', 'Your account has been upgraded. You now have access to premium features.', 'success', 'CLOSE');
      // Clean up URL without adding to history
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.delete('upgrade');
        window.history.replaceState({}, '', url.toString());
      }
    }
  }, [searchParams]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push('/auth/signin');
      } else {
        setUser(currentUser);
        
        try {
          const profile = await userService.getUserProfile(currentUser.uid);
          if (profile) {
            if (profile.onboardingComplete !== true) {
              router.push('/onboarding');
              return;
            }

            setUserProfile(profile);
            setEditFormData({ 
              displayName: profile.fullName || currentUser.displayName || '', 
              phone: profile.phone || '' 
            });
          } else {
            router.push('/onboarding');
            return;
          }

          const code = await referralService.getExistingReferralCode(currentUser.uid);
          setReferralCode(code || 'NO CODE');
        } catch (error) {
          console.error("Error loading profile data:", error);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleSaveProfile = async (data: { displayName: string; phone: string }) => {
    if (!user) return;
    try {
      await userService.updateProfile(user.uid, {
        fullName: data.displayName,
        phone: data.phone
      });
      setEditFormData(data);
      setUserProfile((prev: any) => ({ ...prev, fullName: data.displayName, phone: data.phone }));
      showAlert('Profile Updated', 'Your profile has been updated successfully!', 'success');
    } catch (error) {
      showAlert('Update Failed', 'We could not update your profile. Please try again.', 'warning');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
        <p className="text-slate-500 font-black uppercase tracking-widest text-[9px]">Loading your profile...</p>
      </div>
    );
  }

  if (!user) return null;

  const courses = [
    { title: 'Managing Hypertension', progress: 35, color: 'bg-blue-600' },
    { title: 'Sleep Hygiene Masterclass', progress: 80, color: 'bg-indigo-600' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors pt-32 sm:pt-40 pb-32 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-600/[0.07] blur-[140px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/[0.07] blur-[140px] rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('/globe.svg')] bg-no-repeat bg-center opacity-[0.02] dark:opacity-[0.03]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 md:gap-8 lg:gap-12 items-start">

          {/* Main Content Area */}
          <div className="w-full lg:col-span-8 flex flex-col gap-6 md:gap-10 lg:gap-16 order-1">

            {/* Profile Section */}
            <ProfileHeader 
              user={user} 
              userProfile={userProfile}
              onEdit={() => setIsEditing(true)} 
            />

            {/* Statistics Section */}
            <div className="w-full">
              <ProfileStats 
                user={user}
                userProfile={userProfile}
                referralCode={referralCode}
                setReferralCode={setReferralCode}
                t={t}
              />
            </div>

            {/* Learning Section */}
            <div className="w-full">
              <IntelligenceDiscovery t={t} courses={courses} />
            </div>
          </div>

          {/* Sidebar */}
          <aside className="w-full lg:col-span-4 space-y-6 order-2 lg:sticky lg:top-24 lg:-mt-2">
            <div className="w-full">
              <ProfileMenu userProfile={userProfile} />
            </div>

            {/* Status Card */}
            <div className="relative group/status w-full hidden sm:block">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-[36px] blur-xl opacity-0 group-hover/status:opacity-100 transition duration-1000" />
              <div className="relative p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-[32px] sm:rounded-[40px] shadow-2xl overflow-hidden flex items-center gap-5 transition-all">
                {/* Background ambient light */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[40px] rounded-full pointer-events-none" />

                <div className="relative">
                  <div className="absolute -inset-2 border border-emerald-500/20 rounded-2xl animate-ping pointer-events-none" style={{ animationDuration: '3s' }} />
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
                    <div className="w-3 h-3 rounded-full bg-white animate-pulse" />
                  </div>
                </div>
                <div className="flex-1 relative z-10">
                  <span className="block text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em] mb-1">System Status</span>
                  <span className="text-[12px] sm:text-[14px] font-black text-slate-800 dark:text-white uppercase tracking-tight">All systems operational</span>
                </div>
              </div>
            </div>
          </aside>

        </div>
      </div>
      <EditProfileModal 
        isOpen={isEditing} 
        onClose={() => setIsEditing(false)} 
        initialData={editFormData}
        onSave={handleSaveProfile}
      />

      <NiceModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
        title={modalConfig.title}
        description={modalConfig.description}
        type={modalConfig.type}
        cancelText={modalConfig.cancelText}
        confirmText="Got it"
      />
    </div>
  );
}
