'use client';

import { User as UserIcon, Settings, ShieldCheck, Mail, Phone, MapPin, Clock, Activity, Zap, X, Fingerprint, Calendar, Globe, Award, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { User } from 'firebase/auth';
import { UserProfile } from '@/types/user';
import { useTranslations } from 'next-intl';
import { useCountdown } from '@/hooks/useCountdown';
import { useRouter } from '@/i18n/routing';
import React, { useState, useEffect } from 'react';

interface ProfileHeaderProps {
  user: User;
  userProfile: UserProfile | null;
  onEdit: () => void;
}

function AccountAge({ createdAt }: { createdAt: string | undefined | null }) {
  const [age, setAge] = useState<string>('');

  useEffect(() => {
    if (!createdAt) return;

    const calculateAge = () => {
      const start = new Date(createdAt);
      const now = new Date();
      
      let years = now.getFullYear() - start.getFullYear();
      let months = now.getMonth() - start.getMonth();
      let days = now.getDate() - start.getDate();
      
      if (days < 0) {
        months -= 1;
        const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        days += prevMonth.getDate();
      }
      
      if (months < 0) {
        years -= 1;
        months += 12;
      }

      const diffMs = now.getTime() - start.getTime();
      const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
      const mins = Math.floor((diffMs / (1000 * 60)) % 60);
      const secs = Math.floor((diffMs / 1000) % 60);

      const yearsStr = years + "yrs";
      const monthsStr = months + "mo";
      const daysStr = days + "d";
      const timeStr = String(hours).padStart(2, '0') + ":" + String(mins).padStart(2, '0') + ":" + String(secs).padStart(2, '0');
      
      setAge(yearsStr + " " + monthsStr + " " + daysStr + " " + timeStr);
    };

    calculateAge();
    const interval = setInterval(calculateAge, 1000);
    return () => clearInterval(interval);
  }, [createdAt]);

  if (!createdAt) return null;

  return (
    <div className="mt-2 flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-xl w-fit">
      <Zap size={10} className="text-blue-500 animate-pulse" />
      <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest font-mono">
        {age}
      </span>
    </div>
  );
}

export default function ProfileHeader({ user, userProfile, onEdit }: ProfileHeaderProps) {
  const router = useRouter();
  const t = useTranslations('profile.header');
  const role = userProfile?.role || 'user';
  const [selectedProtocol, setSelectedProtocol] = useState<boolean>(false);

  // Scroll Lock Protocol
  React.useEffect(() => {
    if (selectedProtocol) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedProtocol]);

  const timeLeft = useCountdown(
    userProfile?.tier && userProfile.tier !== 'basic' ? userProfile.subscriptionExpiry || null : null
  );

  const formatDateWithTime = (dateStr: string | undefined | null) => {
    if (!dateStr) return 'UNKNOWN';
    const date = new Date(dateStr);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`;
  };

  const protocols = [
    { icon: Fingerprint, label: "Node Identifier", value: user.uid, category: "Security" },
    { icon: Mail, label: "Digital Address", value: user.email || 'NO RECORD', category: "Communication" },
    { icon: Phone, label: "Direct Link", value: userProfile?.phone || 'NO RECORD', category: "Communication" },
    { icon: MapPin, label: "Geolocation", value: userProfile?.country ? `${userProfile.city || 'Central'}, ${userProfile.country}` : 'OFFLINE', category: "Localization" },
    { 
      icon: Calendar, 
      label: "Account Life Cycle", 
      value: formatDateWithTime(userProfile?.createdAt || user.metadata.creationTime), 
      category: "System" 
    },
    { icon: Award, label: "Authority Tier", value: userProfile?.tier?.toUpperCase() || 'BASIC', category: "Permissions" },
    { icon: Shield, label: "Verification Level", value: userProfile?.verificationLevel?.toString() || '0', category: "Security" },
    { icon: Activity, label: "Clinical Status", value: userProfile?.isBanned ? 'RESTRICTED' : 'OPERATIONAL', category: "System" },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative group"
    >
      {/* Outer Ambient Glow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-[48px] blur-2xl opacity-0 group-hover:opacity-100 transition duration-1000" />
      
      <div className="relative bg-white dark:bg-slate-900 rounded-[40px] sm:rounded-[48px] shadow-2xl border border-slate-100 dark:border-white/5 overflow-hidden transition-all duration-500">
        {/* Animated Background Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/5 blur-[80px] rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <div className="p-6 sm:p-10 lg:p-12 relative z-10">
          <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-12">
            
            {/* Avatar Cluster */}
            <div className="relative shrink-0 self-center lg:self-start">
              <div className="absolute -inset-4 border border-blue-500/20 rounded-[40px] animate-pulse pointer-events-none" />
              <div className="absolute -inset-2 border border-blue-500/10 rounded-[36px] pointer-events-none" />
              
              <div className="w-28 h-28 sm:w-36 lg:w-40 bg-slate-900 dark:bg-black rounded-[32px] lg:rounded-[40px] flex items-center justify-center text-white border border-white/10 shadow-2xl relative overflow-hidden group/avatar">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-transparent opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-500" />
                <span className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter relative z-10">
                  {userProfile?.fullName?.[0]?.toUpperCase() || user.email?.[0].toUpperCase() || <UserIcon className="w-12 h-12" />}
                </span>
                
                {/* Scanner Effect */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/10 to-transparent h-1/2 w-full animate-scan pointer-events-none" />
              </div>
              
              {role !== 'user' && (
                <div className="absolute -bottom-2 -right-2 p-2.5 bg-blue-600 rounded-2xl border-4 border-white dark:border-slate-900 text-white shadow-xl transform rotate-6">
                  <ShieldCheck size={20} strokeWidth={2.5} />
                </div>
              )}
            </div>

            {/* Identity Info */}
            <div className="flex-1 min-w-0 w-full space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                <div className="space-y-4 text-center sm:text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                    <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">{role} TYPE</span>
                  </div>
                  
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-[1.1] uppercase break-words">
                    {userProfile?.fullName || user.displayName || 'Health Profile'}
                  </h1>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-2">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                      <Activity size={12} className="animate-pulse" />
                      <span className="text-[9px] font-black uppercase tracking-widest">Active</span>
                    </div>
                    {timeLeft && (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-500 rounded-xl">
                        <Clock size={12} />
                        <span className="text-[9px] font-black uppercase tracking-widest tabular-nums">
                          {timeLeft.days}D {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <button 
                  onClick={onEdit}
                  className="group/btn flex items-center justify-center gap-3 px-6 py-3.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-slate-200 dark:shadow-none"
                >
                  <Settings size={14} className="group-hover/btn:rotate-90 transition-transform duration-500" />
                  Profile Settings
                </button>
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-8 border-t border-slate-100 dark:border-white/5">
                <MetadataNode 
                  icon={Mail} 
                  label="Email Address" 
                  value={user.email || 'NO RECORD'} 
                  onClick={() => setSelectedProtocol(true)}
                />
                <MetadataNode 
                  icon={Phone} 
                  label="Phone Number" 
                  value={userProfile?.phone || 'NO RECORD'} 
                  onClick={() => setSelectedProtocol(true)}
                />
                <MetadataNode 
                  icon={MapPin} 
                  label="Location" 
                  value={userProfile?.country ? `${userProfile.city || 'Central'}, ${userProfile.country}` : 'OFFLINE'} 
                  onClick={() => setSelectedProtocol(true)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Protocol Modal */}
      <AnimatePresence>
        {selectedProtocol && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProtocol(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[40px] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.5)] overflow-hidden border border-slate-200 dark:border-white/10"
            >
              <div className="p-8 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-600/20">
                    <ShieldCheck className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">PROFILE DETAILS</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-0.5">Comprehensive Account Info</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedProtocol(false)}
                  className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar bg-white dark:bg-slate-900">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {protocols.map((protocol, idx) => (
                    <div key={idx} className="p-6 rounded-[32px] bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 group/detail hover:border-blue-500/30 transition-all shadow-sm">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-white/10 text-blue-500 group-hover/detail:scale-110 transition-transform shadow-sm">
                          <protocol.icon size={18} />
                        </div>
                        <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">{protocol.category}</span>
                      </div>
                      <div className="space-y-1">
                        <span className="block text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">{protocol.label}</span>
                        <p className="text-sm font-bold text-slate-900 dark:text-white break-all leading-relaxed">{protocol.value}</p>
                        {protocol.label === "Account Life Cycle" && (
                          <AccountAge createdAt={userProfile?.createdAt || user.metadata.creationTime} />
                        )}
                        {protocol.label === "Authority Tier" && userProfile?.tier !== 'vip2' && (
                          <button
                            onClick={() => {
                              setSelectedProtocol(false);
                              router.push('/upgrade');
                            }}
                            className="mt-2 flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-600/20"
                          >
                            <Zap size={10} className="animate-pulse fill-white" />
                            <span className="text-[9px] font-black uppercase tracking-widest">Upgrade Plan</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-8 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-4 px-4 py-3 bg-blue-500/5 rounded-2xl border border-blue-500/10">
                  <Fingerprint className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                    This profile data is encrypted using medical-grade security standards. 
                    Access is restricted to authorized account owners only.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function MetadataNode({ icon: Icon, label, value, onClick }: { icon: any, label: string, value: string, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="w-full text-left group/node p-4 rounded-3xl bg-slate-50/50 dark:bg-white/[0.02] border border-transparent hover:border-blue-500/20 hover:bg-white dark:hover:bg-white/[0.04] transition-all duration-300"
    >
      <div className="flex items-center gap-4">
        <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-white/10 text-slate-400 group-hover/node:text-blue-500 group-hover/node:scale-110 transition-all shadow-sm">
          <Icon size={16} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="block text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5">{label}</span>
            <X size={8} className="text-slate-300 opacity-0 group-hover/node:opacity-100 rotate-45 transition-all" />
          </div>
          <span className="block text-xs font-bold text-slate-700 dark:text-slate-300 truncate tracking-tight">{value}</span>
        </div>
      </div>
    </button>
  );
}
