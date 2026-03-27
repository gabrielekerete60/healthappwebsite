import React from 'react';
import { motion } from 'framer-motion';
import { Users, MoreVertical, Shield, User, Activity, Ban, CheckCircle } from 'lucide-react';
import { UserProfile } from '@/types';

interface UsersTabProps {
  users: UserProfile[];
  onEdit: (user: UserProfile) => void;
}

export function UsersTab({ users, onEdit }: UsersTabProps) {
  return (
    <motion.div 
      key="users"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Citizen Network</h2>
          <p className="text-slate-500 font-medium mt-1 uppercase tracking-widest text-[10px] font-black">Central Intelligence Registry</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-white/5 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5">
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Identity</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Node Status</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Access Tier</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Evolution</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-white/5 text-sm font-medium text-slate-600 dark:text-slate-300">
              {users.map((user) => (
                <tr key={user.uid} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors group">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                        {user.role === 'admin' ? <Shield size={18} /> : <User size={18} />}
                      </div>
                      <div>
                        <p className="font-black text-slate-900 dark:text-white uppercase tracking-tight">{user.fullName || 'Anonymous Node'}</p>
                        <p className="text-xs text-slate-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${user.role === 'user' ? 'bg-blue-500' : 'bg-emerald-500'}`} />
                      <span className="uppercase tracking-widest text-[10px] font-black">{user.role}</span>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-2">
                      <Activity size={14} className="text-blue-500" />
                      <span className="uppercase tracking-widest text-[10px] font-black">{user.tier || 'basic'}</span>
                    </div>
                  </td>
                  <td className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Initial Phase'}
                  </td>
                  <td className="p-6">
                    <button 
                      onClick={() => onEdit(user)}
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
