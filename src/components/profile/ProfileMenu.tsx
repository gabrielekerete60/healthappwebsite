'use client';

import React from 'react';
import { 
  Shield, Trash2, LogOut, Users as UsersIcon, 
  Download, LayoutDashboard, Sparkles, Calendar, 
  MessageSquare, BookOpen, Loader2, CreditCard,
  Zap, Globe, Check
} from 'lucide-react';
import { motion } from 'framer-motion';
import { isExpertRole, UserProfile } from '@/types/user';
import NiceModal from '@/components/common/NiceModal';
import { useProfileMenu } from '@/hooks/useProfileMenu';
import { ProfileMenuItem } from './ProfileMenuItem';
import CustomSelect from '@/components/common/CustomSelect';
import { useRouter, usePathname } from '@/i18n/routing';
import { useLocale } from 'next-intl';

interface ProfileMenuProps {
  userProfile: UserProfile | null;
}

export default function ProfileMenu({ userProfile }: ProfileMenuProps) {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const {
    t, processing, exporting, modalConfig, setModalConfig,
    confirmConfig, setConfirmConfig, handleSignOut, handleExport, handleDelete
  } = useProfileMenu();
  
  const isExpert = isExpertRole(userProfile?.role || '');
  const tier = userProfile?.tier;
  const isPremium = tier === 'vip1' || tier === 'vip2' || tier === 'premium';

  const [autoLogoutTimer, setAutoLogoutTimer] = React.useState<number>(15);
  const [selectedTimer, setSelectedTimer] = React.useState<string>('15');
  const [isCustom, setIsCustom] = React.useState(false);
  const [customValue, setCustomValue] = React.useState<string>('');

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = parseInt(localStorage.getItem('autoLogoutTimerMinutes') || '15', 10);
      setAutoLogoutTimer(saved);
      setSelectedTimer(saved.toString());
      if (![5, 15, 30, 60].includes(saved)) {
        setIsCustom(true);
        setCustomValue(saved.toString());
        setSelectedTimer('custom');
      }
    }
  }, []);

  const handleTimerChange = (mins: number) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('autoLogoutTimerMinutes', mins.toString());
      setAutoLogoutTimer(mins);
      window.dispatchEvent(new Event('storage')); // Notify other tabs/controllers
    }
  };

  const handleApplyTimer = () => {
    if (isCustom) {
      const val = parseInt(customValue, 10);
      if (!isNaN(val) && val > 0) {
        handleTimerChange(val);
      }
    } else {
      handleTimerChange(parseInt(selectedTimer, 10));
    }
  };

  const languages = [
    { code: 'en', label: 'EN', flag: '🇺🇸' },
    { code: 'es', label: 'ES', flag: '🇪🇸' },
    { code: 'fr', label: 'FR', flag: '🇫🇷' },
    { code: 'de', label: 'DE', flag: '🇩🇪' },
    { code: 'zh', label: 'ZH', flag: '🇨🇳' },
    { code: 'ar', label: 'AR', flag: '🇸🇦' },
  ];

  const handleLanguageChange = (newLocale: string) => {
    localStorage.setItem('language', newLocale);
    router.push(pathname, { locale: newLocale });
  };

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white dark:bg-slate-900 rounded-[32px] sm:rounded-[48px] shadow-2xl dark:shadow-indigo-500/10 border border-slate-100 dark:border-white/5 overflow-hidden flex flex-col h-fit"
      >
        <div className="p-6 sm:p-8 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-900 dark:text-white">SETTINGS & OPTIONS</h3>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="px-4 pt-4 md:pt-6">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">Your Features</span>
            <div className="grid grid-cols-2 gap-3 mt-3 px-2">
              {userProfile?.role === 'admin' && (
                <div className="col-span-2">
                  <ProfileMenuItem 
                    href="/admin/dashboard" 
                    icon={Shield} 
                    label="Admin Dashboard" 
                    variant="dark"
                  />
                </div>
              )}

              {isExpert && (
                <div className="col-span-2">
                  <ProfileMenuItem 
                    href="/expert/dashboard" 
                    icon={LayoutDashboard} 
                    label="EXPERT CONTROLS" 
                  />
                </div>
              )}

              {/* Verification & Upgrade Nodes */}
              {isExpert && (!userProfile?.verificationStatus || userProfile?.verificationStatus === 'unverified') && (
                <div className="col-span-2 lg:col-span-1">
                  <ProfileMenuItem 
                    href="/expert/setup" 
                    icon={Sparkles} 
                    label="Verify My License" 
                    subtitle="Action Required"
                    variant="primary"
                  />
                </div>
              )}

              {((isExpert && userProfile?.verificationStatus === 'verified' && (tier === 'basic' || !tier)) || 
                (!isExpert && (tier === 'basic' || !tier))) && (
                <div className="col-span-2 lg:col-span-1">
                  <ProfileMenuItem 
                    href={isExpert ? "/expert/upgrade" : "/upgrade"} 
                    icon={Zap} 
                    label="Upgrade My Plan" 
                    subtitle="Unlock all features"
                    variant="primary"
                  />
                </div>
              )}

              <div className="col-span-2 sm:col-span-1 lg:col-span-2 xl:col-span-1">
                <ProfileMenuItem 
                  href={isExpert ? "/expert/appointments" : "/appointments"} 
                  icon={Calendar} 
                  label="My Appointments" 
                />
              </div>

              {isPremium ? (
                <>
                  <div className="col-span-2 sm:col-span-1 lg:col-span-2 xl:col-span-1 border-t border-slate-100 dark:border-white/5 pt-3 sm:border-t-0 sm:pt-0 pb-0">
                    <ProfileMenuItem href="/vault" icon={Shield} label="Medical Vault" subtitle="Safe Storage" />
                  </div>
                  <div className="col-span-2 sm:col-span-1 lg:col-span-2 xl:col-span-1">
                    <ProfileMenuItem href="/journal" icon={BookOpen} label="Health Journal" subtitle="Track your health" />
                  </div>
                  <div className="col-span-2 sm:col-span-1 lg:col-span-2 xl:col-span-1">
                    <ProfileMenuItem href="/qa" icon={MessageSquare} label="Expert Q&A" subtitle="Ask a specialist" />
                  </div>
                </>
              ) : (
                <>
                  <div className="col-span-2 border-t border-slate-100 dark:border-white/5 pt-3 sm:border-t-0 sm:pt-0">
                    <ProfileMenuItem 
                      icon={Shield} 
                      label="Medical Vault" 
                      subtitle="LOCKED" 
                      onClick={() => setModalConfig({
                        isOpen: true,
                        title: "Medical Vault Locked",
                        description: "The Medical Vault requires a Premium Plan for better security.",
                        type: 'upgrade',
                        isPopup: true,
                        features: ["Top-level security", "Access from anywhere"],
                        confirmText: "Upgrade My Plan",
                        onConfirm: () => {
                          setModalConfig(prev => ({ ...prev, isOpen: false }));
                          router.push('/upgrade');
                        }
                      })}
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="px-4">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">Tools & Settings</span>
            <div className="flex flex-col gap-3 mt-3 px-2">

              {/* Language Selector Node */}
              <div>
                <div className="bg-slate-50 dark:bg-white/[0.02] rounded-[28px] p-5 border border-slate-100 dark:border-white/5 transition-all hover:border-blue-500/20 hover:shadow-xl hover:shadow-blue-500/5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 bg-white dark:bg-slate-800 rounded-2xl text-slate-400 shadow-sm border border-slate-100 dark:border-white/10">
                      <Globe size={18} />
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest leading-tight">System Language</span>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-3 gap-2">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang.code)}
                        className={`flex flex-col items-center justify-center py-2.5 rounded-[16px] border transition-all ${
                          locale === lang.code 
                            ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20 scale-[1.02]' 
                            : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-500 hover:border-blue-500/30'
                        }`}
                      >
                        <span className="text-[10px] font-black tracking-wider">{lang.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Auto-Logout Selector Node (HIPAA) */}
              <div>
                <div className="bg-slate-50 dark:bg-white/[0.02] rounded-[28px] p-5 border border-slate-100 dark:border-white/5 transition-all hover:border-blue-500/20 hover:shadow-xl hover:shadow-blue-500/5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 bg-white dark:bg-slate-800 rounded-2xl text-slate-400 shadow-sm border border-slate-100 dark:border-white/10">
                      <Shield size={18} />
                    </div>
                    <div>
                      <span className="block text-[10px] sm:text-[11px] font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest leading-tight mb-1">Automatic Log-out</span>
                      <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest">Safe & Secure</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <CustomSelect
                          value={isCustom ? 'custom' : selectedTimer}
                          onChange={(val) => {
                            setSelectedTimer(val);
                            setIsCustom(val === 'custom');
                          }}
                          options={[
                            { value: '5', label: '5 Minutes' },
                            { value: '15', label: '15 Minutes' },
                            { value: '30', label: '30 Minutes' },
                            { value: '60', label: '60 Minutes' },
                            { value: 'custom', label: 'Custom...' },
                          ]}
                          placeholder="Select time"
                          className="!py-3 !px-5 !rounded-2xl !text-[11px] !bg-white dark:!bg-slate-800 border-slate-100 dark:border-white/10 shadow-sm font-bold tracking-wide"
                        />
                      </div>
                      <button
                        onClick={handleApplyTimer}
                        className="px-6 py-3 rounded-2xl bg-blue-600 text-white text-[11px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95 shrink-0 flex items-center gap-2"
                      >
                        {autoLogoutTimer.toString() === (isCustom ? customValue : selectedTimer) ? <Check size={14} /> : null}
                        SET
                      </button>
                    </div>

                    {isCustom && (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={customValue}
                          onChange={(e) => setCustomValue(e.target.value)}
                          placeholder="Mins"
                          className="w-full px-5 py-3 rounded-2xl text-[11px] font-bold tracking-wide bg-white dark:bg-slate-800 border border-slate-100 dark:border-white/10 focus:ring-1 focus:ring-blue-500 outline-none shadow-sm"
                        />
                      </div>
                    )}
                  </div> 
            
                </div>
              </div>

            <div className="grid grid-cols-2 lg:grid-cols-2 gap-3 mt-3 px-2">
              <div className="col-span-1">
                <ProfileMenuItem href="/transactions" icon={CreditCard} label="My Payments" />              </div>
              <div className="col-span-1">
                <ProfileMenuItem href="/referrals" icon={UsersIcon} label="Invite Friends" />
              </div>
              
              <div className="col-span-2">
                <ProfileMenuItem 
                  onClick={handleExport} 
                  icon={Download} 
                  label="Download My Info" 
                  isLoading={exporting}
                  rightElement={exporting ? <Loader2 size={16} className="animate-spin text-slate-400" /> : null}
                />
              </div>
            </div>
          </div>
          </div>

          <div className="h-px bg-slate-100 dark:bg-white/5 my-6 mx-6" />

          {/* Login & Security */}
          <div className="px-4 pb-6">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] px-2 mb-3 block">Login & Security</span>
            <div className="grid grid-cols-2 gap-3 px-2">
              <div className="col-span-1">
                <ProfileMenuItem 
                  onClick={handleDelete} 
                  icon={Trash2} 
                  label="Delete My Account" 
                  variant="danger"
                  isLoading={processing}
                />
              </div>

              <div className="col-span-1">
                <ProfileMenuItem 
                  onClick={handleSignOut} 
                  icon={LogOut} 
                  label="Sign Out" 
                  variant="dark"
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <NiceModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        onConfirm={modalConfig.onConfirm}
        title={modalConfig.title}
        description={modalConfig.description}
        type={modalConfig.type}
        confirmText={modalConfig.confirmText}
        isPopup={modalConfig.isPopup}
      />

      <NiceModal
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        description={confirmConfig.description}
        confirmText="Confirm Action"
        cancelText="Cancel"
        type="warning"
      />
    </>
  );
}
