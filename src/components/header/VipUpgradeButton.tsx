'use client';

import React from 'react';
import { Crown } from 'lucide-react';
import { useRouter } from '@/i18n/routing';
import { UserProfile, isExpertRole } from '@/types/user';
import NiceModal from '@/components/common/NiceModal';

interface VipUpgradeButtonProps {
  userProfile: UserProfile | null;
  className?: string;
}

export default function VipUpgradeButton({ userProfile, className }: VipUpgradeButtonProps) {
  const router = useRouter();
  const [showModal, setShowModal] = React.useState(false);

  if (!userProfile || !userProfile.onboardingComplete) return null;

  const isExpert = isExpertRole(userProfile.role);
  const isPremium = userProfile.tier === 'vip2' || userProfile.tier === 'premium';
  const needsVerification = isExpert && userProfile.verificationStatus !== 'verified' && userProfile.verificationStatus !== 'pending';
  const needsUpgrade = !isPremium;

  if (isPremium) return null;

  const getButtonText = () => {
    if (isExpert && needsVerification) return "VIP & Verify";
    return "VIP";
  };

  const buttonText = getButtonText();

  if (!buttonText) return null;

  const handleVipVerifyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isExpert) {
      router.push('/upgrade');
      return;
    }

    if (needsUpgrade && needsVerification) {
      setShowModal(true);
    } else if (needsUpgrade) {
      router.push('/upgrade');
    } else if (needsVerification) {
      router.push('/expert/verify');
    }
  };

  return (
    <>
      <button
        onClick={handleVipVerifyClick}
        className={`flex items-center gap-2 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-xl border border-amber-100 dark:border-amber-800 transition-all hover:bg-amber-100 dark:hover:bg-amber-900/40 active:scale-95 shadow-sm ${className}`}
      >
        <Crown size={14} className="fill-amber-500" />
        <span className="text-[9px] font-black uppercase tracking-widest">{buttonText}</span>
      </button>

      <NiceModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Protocol Selection"
        description="Your node requires multiple clinical initializations. Select the terminal you wish to access."
        type="info"
        confirmText="VIP Terminal"
        cancelText="Verification Node"
        onConfirm={() => {
          setShowModal(false);
          router.push('/upgrade');
        }}
        onCancel={() => {
          setShowModal(false);
          router.push('/expert/verify');
        }}
      />
    </>
  );
}
