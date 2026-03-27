'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Zap, Crown, ArrowLeft, Loader2 } from 'lucide-react';
import { Link, useRouter } from '@/i18n/routing';
import { userService } from '@/services/userService';
import { paymentService } from '@/services/paymentService';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { 
  TierCard, MatrixCategory, MatrixRow, SecurityBanner 
} from '@/components/upgrade/UpgradeComponents';
import NiceModal from '@/components/common/NiceModal';
import { useTranslations } from 'next-intl';

export default function UserUpgradePage() {
  const t = useTranslations('upgrade');
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null);
  const [currentTier, setCurrentTier] = useState<string>('basic');
  const [loading, setLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    tier: 'plus' | 'premium' | null;
    amount: number;
  }>({
    isOpen: false,
    tier: null,
    amount: 0
  });
  
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const profile = await userService.getUserProfile(user.uid);
          if (profile?.tier) {
            if (profile.tier === 'vip1') setCurrentTier('plus');
            else if (profile.tier === 'vip2' || profile.tier === 'premium') setCurrentTier('premium');
            else setCurrentTier(profile.tier);
          }
        } catch (error) {
          console.error("Error fetching profile for upgrade page:", error);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleUpgradeClick = (tier: 'plus' | 'premium') => {
    const amount = tier === 'plus' ? 8000 : 19000;
    setConfirmModal({
      isOpen: true,
      tier,
      amount
    });
  };

  const handleUpgrade = async (tier: 'plus' | 'premium') => {
    if (!auth.currentUser) return;
    setConfirmModal(prev => ({ ...prev, isOpen: false }));
    setIsSubmitting(tier);
    
    const mappedTier = tier === 'plus' ? 'vip1' : 'vip2';
    const amount = tier === 'plus' ? 8000 : 19000;

    paymentService.initializePayment({
      email: auth.currentUser.email || '',
      amount: amount,
      metadata: {
        uid: auth.currentUser.uid,
        tier: mappedTier,
      },
      onSuccess: async (response) => {
        console.log("Payment successful", response);
        try {
          await userService.upgradeTier(mappedTier, response.reference);
          router.push('/profile?upgrade=success');
        } catch (error) {
          console.error("Post-payment upgrade failed:", error);
          router.push('/profile');
        }
      },
      onClose: () => {
        setIsSubmitting(null);
      }
    });
  };

  const tierLevels: Record<string, number> = {
    'basic': 0,
    'plus': 1,
    'premium': 2,
    'vip1': 1,
    'vip2': 2
  };

  const isTierActive = (tier: string) => {
    return tierLevels[currentTier] >= tierLevels[tier];
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors pt-32 sm:pt-40 pb-24 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <header className="mb-16 text-center space-y-4">
          <Link href="/profile" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors mb-4">
            <ArrowLeft size={12} /> {t('backToProfile', { defaultMessage: 'Back to Profile' })}
          </Link>
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-[24px] flex items-center justify-center text-white shadow-xl shadow-blue-600/20 mb-6">
            <Sparkles size={32} />
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">
            {t('title').split(' ')[0]} {t('title').split(' ')[1]} <span className="text-blue-600">{t('title').split(' ')[2]}</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {loading && (
            <div className="absolute inset-0 bg-slate-50/50 dark:bg-slate-950/50 backdrop-blur-sm z-20 flex items-center justify-center rounded-[40px]">
              <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            </div>
          )}
          <TierCard
            title={t('tierBasic')}
            price={t('free')}
            features={['Symptom Search', 'Health Articles', 'Herbal Remedies', 'Expert Directory']}
            buttonText={currentTier === 'basic' ? t('activeNode') : t('standardProtocol')}
            isCurrent={currentTier !== 'basic' && currentTier !== 'unknown'}
            icon={Zap}
            color="slate"
          />

          <TierCard
            title={t('tierPlus')}
            price="$5"
            features={['Advanced Symptom Checker', '', 'Personalized Insights', '', 'Health History Tracking', '', 'Priority Search Results']}
            buttonText="Initialize Plus"
            onUpgrade={() => handleUpgradeClick('plus')}
            isCurrent={isTierActive('plus')}
            isSubmitting={isSubmitting === 'plus'}
            icon={Zap}
            color="blue"
          />

          <TierCard
            title={t('tierPremium')}
            price="$12"
            features={['Everything in PLUS +', 'Video Consultations', 'Unlimited Expert Questions', 'AI Symptom Guidance', 'Medication Reminders', 'Early Feature Access']}
            buttonText="Go Premium"
            onUpgrade={() => handleUpgradeClick('premium')}
            isPremium={true}
            isCurrent={isTierActive('premium')}
            isSubmitting={isSubmitting === 'premium'}
            icon={Crown}
            color="indigo"
          />
        </div>

        <NiceModal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
          onConfirm={() => confirmModal.tier && handleUpgrade(confirmModal.tier)}
          title={t('confirmAcquisition')}
          description={t('confirmAcquisitionDesc', { tier: confirmModal.tier?.toUpperCase() || '', amount: confirmModal.amount.toLocaleString() })}
          confirmText={t('initializePayment')}
          cancelText="Cancel"
          type="payment"
        />

        {/* Premium Feature Comparison Matrix */}
        <section className="mt-40 mb-32 relative">
          <div className="text-center mb-20 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
              {t('technicalSpecification')}
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
              {t('matrixTitle').split(' ')[0]} <span className="text-blue-600">{t('matrixTitle').split(' ')[1]}</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium max-w-xl mx-auto">
              {t('matrixSubtitle')}
            </p>
          </div>

          <div className="relative group">
            <div className="absolute -inset-4 bg-gradient-to-b from-blue-600/5 to-indigo-600/5 blur-3xl rounded-[64px] opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />
            
            <div className="relative bg-white dark:bg-slate-900 rounded-[48px] border border-slate-200/60 dark:border-white/5 shadow-2xl overflow-hidden shadow-slate-200/50 dark:shadow-none">
              <div className="overflow-x-auto">
                <table className="w-full border-separate border-spacing-0 min-w-[900px]">
                  <thead>
                    <tr className="bg-slate-50/80 dark:bg-white/[0.02] backdrop-blur-md">
                      <th className="p-10 text-left w-1/3 border-b border-slate-100 dark:border-white/5">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{t('protocolNode')}</span>
                      </th>
                      {['Basic', 'Plus', 'Premium'].map((tier) => (
                        <th key={tier} className="p-10 text-center border-b border-slate-100 dark:border-white/5">
                          <span className={`text-xs font-black uppercase tracking-widest ${
                            tier === 'Plus' ? 'text-blue-600' : tier === 'Premium' ? 'text-indigo-500' : 'text-slate-900 dark:text-white'
                          }`}>{tier}</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <MatrixCategory title="Core Foundations" />
                    <MatrixRow name="Public Symptom Search" basic={true} plus={true} premium={true} />
                    <MatrixRow name="Health Articles & Feed" basic={true} plus={true} premium={true} />
                    <MatrixRow name="Expert Directory Access" basic={true} plus={true} premium={true} />
                    
                    <MatrixCategory title="Advanced Health Data" />
                    <MatrixRow name="AI Symptom Checker" basic="Basic" plus="Advanced" premium="Unlimited" />
                    <MatrixRow name="Personalized Insights" basic={false} plus={true} premium={true} />
                    <MatrixRow name="Health History Tracking" basic={false} plus={true} premium={true} />
                    <MatrixRow name="Medical Vault (Encrypted)" basic={false} plus={true} premium={true} />
                    
                    <MatrixCategory title="Network Benefits" />
                    <MatrixRow name="Priority Search Results" basic={false} plus={true} premium={true} />
                    <MatrixRow name="Early Feature Access" basic={false} plus={false} premium={true} />
                    
                    <MatrixCategory title="Premium Health Services" />
                    <MatrixRow name="Direct Video Consultations" basic={false} plus={false} premium={true} />
                    <MatrixRow name="Unlimited Expert Q&A" basic={false} plus={false} premium={true} />
                    <MatrixRow name="Family Sharing (4 Members)" basic={false} plus={false} premium={true} />
                    <MatrixRow name="Medication Reminders" basic={false} plus={false} premium={true} />
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        <SecurityBanner />
      </div>
    </div>
  );
}
