import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, User, Star, Trash2, Ban, CheckCircle } from 'lucide-react';
import { UserProfile, UserRole } from '@/types';

interface UserEditModalProps {
  user: UserProfile | null;
  onClose: () => void;
  onUpdate: (userId: string, updates: any) => void;
}

export function UserEditModal({ user, onClose, onUpdate }: UserEditModalProps) {
  const [role, setRole] = useState<UserRole>(user?.role || 'user');
  const [tier, setTier] = useState<any>(user?.tier || 'basic');
  const [isBanned, setIsBanned] = useState(user?.isBanned || false);

  if (!user) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl overflow-hidden border border-slate-100 dark:border-white/5"
        >
          {/* Header */}
          <div className="p-8 border-b border-slate-50 dark:border-white/5 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Modify Citizen</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Intelligence Override</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="p-8 space-y-8">
            {/* Identity Info */}
            <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-white/5 rounded-2xl">
              <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                <User size={24} />
              </div>
              <div>
                <p className="font-black text-slate-900 dark:text-white uppercase tracking-tight">{user.fullName}</p>
                <p className="text-xs text-slate-400 font-bold">{user.email}</p>
              </div>
            </div>

            {/* Role Selection */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Account Role</label>
              <div className="grid grid-cols-2 gap-2">
                {['user', 'expert', 'doctor', 'hospital', 'herbal_practitioner', 'admin'].map((r) => (
                  <button
                    key={r}
                    onClick={() => setRole(r as UserRole)}
                    className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${role === r ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-transparent shadow-lg' : 'border-slate-100 dark:border-white/5 text-slate-400 hover:border-blue-500'}`}
                  >
                    {r.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Tier Selection */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Access Tier</label>
              <div className="grid grid-cols-3 gap-2">
                {['basic', 'plus', 'elite', 'vip1', 'vip2'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTier(t as any)}
                    className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${tier === t ? 'bg-blue-600 text-white border-transparent shadow-lg shadow-blue-200 dark:shadow-none' : 'border-slate-100 dark:border-white/5 text-slate-400 hover:border-blue-500'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Status Toggles */}
            <div className="flex items-center justify-between p-4 border border-slate-100 dark:border-white/5 rounded-2xl">
              <div className="flex items-center gap-3">
                <Ban size={18} className={isBanned ? 'text-red-500' : 'text-slate-300'} />
                <span className="text-[10px] font-black uppercase tracking-widest">Restrict Access</span>
              </div>
              <button 
                onClick={() => setIsBanned(!isBanned)}
                className={`w-12 h-6 rounded-full transition-colors relative ${isBanned ? 'bg-red-500' : 'bg-slate-200 dark:bg-slate-800'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${isBanned ? 'right-1' : 'left-1'}`} />
              </button>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-8 bg-slate-50 dark:bg-white/5 flex gap-3">
            <button 
              onClick={onClose}
              className="flex-1 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
            >
              Discard
            </button>
            <button 
              onClick={() => onUpdate(user.uid, { role, tier, isBanned })}
              className="flex-[2] bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-xl"
            >
              Commit Changes
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
