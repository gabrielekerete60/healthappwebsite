import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, Loader2, Plus, Users, Shield, Eye, History, ShieldAlert, Calendar } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { UserProfile } from '@/types';
import { StatCard } from './StatCard';

interface VerificationTabProps {
  experts: UserProfile[];
  verifiedExperts: UserProfile[];
  seeding: boolean;
  handleSeed: () => void;
  setSelectedExpert: (expert: UserProfile) => void;
  handleUnverify: (id: string) => void;
}

export function VerificationTab({
  experts,
  verifiedExperts,
  seeding,
  handleSeed,
  setSelectedExpert,
  handleUnverify,
}: VerificationTabProps) {
  const [subTab, setSubTab] = useState<'pending' | 'history'>('pending');
  const [dateRange, setSubTabDateRange] = useState<'all' | 'today' | 'week' | 'month'>('all');

  const filteredHistory = useMemo(() => {
    if (dateRange === 'all') return verifiedExperts;
    const now = new Date();
    return verifiedExperts.filter(e => {
      const date = new Date(e.updatedAt);
      if (dateRange === 'today') {
        return date.toDateString() === now.toDateString();
      }
      if (dateRange === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return date >= weekAgo;
      }
      if (dateRange === 'month') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return date >= monthAgo;
      }
      return true;
    });
  }, [verifiedExperts, dateRange]);

  return (
    <motion.div 
      key="verif"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-8"
    >
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard icon={<Users />} label="Pending" value={experts.length.toString()} color="bg-blue-50 text-blue-600" />
        <StatCard icon={<History />} label="Verified" value={verifiedExperts.length.toString()} color="bg-emerald-50 text-emerald-600" />
        <div className="md:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-white/5 flex items-center justify-between">
           <div className="flex items-center gap-4">
              <div className="p-4 bg-amber-50 rounded-2xl text-amber-600"><Database size={24} /></div>
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">Maintenance</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Live Data Synchronization</p>
              </div>
           </div>
           <div className="flex gap-2">
              <button onClick={handleSeed} disabled={seeding} className="px-4 py-2 bg-amber-100 text-amber-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-200 transition-all disabled:opacity-50">
                {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Seed V2'}
              </button>
              <Link href="/admin/learning/create" className="px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center gap-2">
                <Plus size={14} /> Course
              </Link>
           </div>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {/* Sub Navigation */}
        <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-2 rounded-3xl border border-slate-100 dark:border-white/5 w-full">
          <div className="flex gap-2">
            <button 
              onClick={() => setSubTab('pending')}
              className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${subTab === 'pending' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:bg-slate-50'}`}
            >
              Pipeline Queue ({experts.length})
            </button>
            <button 
              onClick={() => setSubTab('history')}
              className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${subTab === 'history' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' : 'text-slate-400 hover:bg-slate-50'}`}
            >
              Verified History ({verifiedExperts.length})
            </button>
          </div>

          {subTab === 'history' && (
            <div className="flex items-center gap-2 mr-2">
              <Calendar size={14} className="text-slate-400" />
              <select 
                value={dateRange}
                onChange={(e) => setSubTabDateRange(e.target.value as any)}
                className="bg-transparent text-[10px] font-black uppercase tracking-widest text-slate-600 outline-none cursor-pointer"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
          )}
        </div>

        {/* Data Table */}
        <div className="bg-white dark:bg-slate-900 rounded-[40px] shadow-sm border border-slate-100 dark:border-white/5 overflow-hidden">
          <AnimatePresence mode="wait">
            {subTab === 'pending' ? (
              <motion.div
                key="pending-list"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="overflow-x-auto"
              >
                <table className="w-full text-left">
                  <thead className="bg-slate-50/50 dark:bg-white/[0.02] text-slate-400 text-[10px] uppercase font-black tracking-widest">
                    <tr>
                      <th className="p-8">Candidate / Identity</th>
                      <th className="p-8">Protocol Info</th>
                      <th className="p-8 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {experts.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="p-24 text-center">
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center justify-center py-12"
                          >
                            <div className="w-20 h-20 bg-slate-50 dark:bg-white/5 rounded-[32px] flex items-center justify-center mb-6 border border-slate-100 dark:border-white/5 shadow-inner">
                              <Shield size={32} className="text-slate-300 dark:text-slate-600" />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">Queue Optimized</h3>
                            <p className="text-slate-500 dark:text-slate-400 font-medium max-w-xs text-sm">
                              No pending expert protocols in the decryption queue. System is fully synchronized.
                            </p>
                          </motion.div>
                        </td>
                      </tr>
                    ) : (
                      experts.map((expert) => (
                        <tr key={expert.uid} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                          <td className="p-8">
                            <div>
                              <p className="font-black text-slate-900 dark:text-white text-lg uppercase tracking-tight">{expert.fullName}</p>
                              <p className="text-[10px] font-black uppercase tracking-widest text-blue-500">{expert.expertProfile?.type || expert.role}</p>
                            </div>
                          </td>
                          <td className="p-8">
                            <div className="space-y-1">
                              <p className="text-sm font-bold text-slate-600 dark:text-slate-400">{expert.email}</p>
                              <p className="text-xs text-slate-400">{expert.expertProfile?.specialty || 'N/A'}</p>
                            </div>
                          </td>
                          <td className="p-8 text-right">
                            <button 
                              onClick={() => setSelectedExpert(expert)}
                              className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 dark:hover:bg-blue-400 transition-all shadow-lg active:scale-95 ml-auto border-2 border-slate-100"
                            >
                              <Eye className="w-4 h-4 inline mr-2" /> Decrypt Data
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </motion.div>
            ) : (
              <motion.div
                key="history-list"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="overflow-x-auto"
              >
                <table className="w-full text-left">
                  <thead className="bg-slate-50/50 dark:bg-white/[0.02] text-slate-400 text-[10px] uppercase font-black tracking-widest">
                    <tr>
                      <th className="p-8">Verified Expert</th>
                      <th className="p-8">Verification Date</th>
                      <th className="p-8 text-right">Revocation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {filteredHistory.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="p-24 text-center">
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center justify-center py-12"
                          >
                            <div className="w-20 h-20 bg-slate-50 dark:bg-white/5 rounded-[32px] flex items-center justify-center mb-6 border border-slate-100 dark:border-white/5 shadow-inner">
                              <History size={32} className="text-slate-300 dark:text-slate-600" />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">No Records Found</h3>
                            <p className="text-slate-500 dark:text-slate-400 font-medium max-w-xs text-sm">
                              No verified experts match the selected temporal range.
                            </p>
                          </motion.div>
                        </td>
                      </tr>
                    ) : (
                      filteredHistory.map((expert) => (
                        <tr key={expert.uid} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                          <td className="p-8">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
                                <Shield size={18} />
                              </div>
                              <div>
                                <p className="font-black text-slate-900 dark:text-white text-sm uppercase tracking-tight">{expert.fullName}</p>
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{expert.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-8">
                            <p className="text-xs font-bold text-slate-600 dark:text-slate-400 italic">
                              {new Date(expert.updatedAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
                            </p>
                          </td>
                          <td className="p-8 text-right">
                            <div className="flex justify-end gap-2">
                               <button 
                                onClick={() => setSelectedExpert(expert)}
                                className="p-3 bg-white dark:bg-slate-800 rounded-xl text-slate-400 hover:text-blue-600 border border-slate-100 dark:border-white/5 transition-all shadow-sm"
                              >
                                <Eye size={16} />
                              </button>
                              <button 
                                onClick={() => handleUnverify(expert.uid)}
                                className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all flex items-center gap-2"
                              >
                                <ShieldAlert size={14} /> Unverify
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
