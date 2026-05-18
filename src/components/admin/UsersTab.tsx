import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, MoreVertical, Shield, User, Activity, 
  Search, SearchX, Calendar, SlidersHorizontal, X
} from 'lucide-react';
import { UserProfile } from '@/types';
import { Dropdown } from '@/components/ui/Dropdown';

interface UsersTabProps {
  users: UserProfile[];
  onEdit: (user: UserProfile) => void;
}

export function UsersTab({ users, onEdit }: UsersTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [tierFilter, setTierFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = !searchQuery || 
        user.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        user.email?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      const matchesTier = tierFilter === 'all' || (user.tier || 'basic') === tierFilter;
      
      let matchesDate = true;
      if (dateRange !== 'all' && user.createdAt) {
        const createdDate = new Date(user.createdAt);
        const now = new Date();
        const diffDays = (now.getTime() - createdDate.getTime()) / (1000 * 3600 * 24);
        
        if (dateRange === '7d') matchesDate = diffDays <= 7;
        else if (dateRange === '30d') matchesDate = diffDays <= 30;
        else if (dateRange === '90d') matchesDate = diffDays <= 90;
      }
      
      return matchesSearch && matchesRole && matchesTier && matchesDate;
    });
  }, [users, searchQuery, roleFilter, tierFilter, dateRange]);

  const activeFiltersCount = [
    roleFilter !== 'all',
    tierFilter !== 'all',
    dateRange !== 'all'
  ].filter(Boolean).length;

  const clearFilters = () => {
    setSearchQuery('');
    setRoleFilter('all');
    setTierFilter('all');
    setDateRange('all');
  };

  return (
    <motion.div 
      key="users"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Citizen Network</h2>
          <p className="text-slate-500 font-medium mt-1 uppercase tracking-widest text-[10px] font-black">Central Intelligence Registry</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text"
              placeholder="Search Identity..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`p-3 rounded-2xl border transition-all relative ${
              showFilters || activeFiltersCount > 0
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-white/5 text-slate-400'
            }`}
          >
            <SlidersHorizontal size={18} />
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="relative z-50"
          >
            <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-white/5 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Access Role</label>
                <Dropdown 
                  value={roleFilter}
                  onChange={setRoleFilter}
                  options={[
                    { value: 'all', label: 'All Roles' },
                    { value: 'user', label: 'Citizens', icon: <User size={12} /> },
                    { value: 'expert', label: 'Intelligence Nodes', icon: <Activity size={12} /> },
                    { value: 'admin', label: 'System Admins', icon: <Shield size={12} /> },
                  ]}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Evolution Tier</label>
                <Dropdown 
                  value={tierFilter}
                  onChange={setTierFilter}
                  options={[
                    { value: 'all', label: 'All Tiers' },
                    { value: 'basic', label: 'Basic' },
                    { value: 'pro', label: 'Pro' },
                    { value: 'elite', label: 'Elite' },
                  ]}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Phase Delta</label>
                <Dropdown 
                  value={dateRange}
                  onChange={setDateRange}
                  options={[
                    { value: 'all', label: 'All Time', icon: <Calendar size={12} /> },
                    { value: '7d', label: 'Last 7 Days' },
                    { value: '30d', label: 'Last 30 Days' },
                    { value: '90d', label: 'Last 90 Days' },
                  ]}
                />
              </div>
              {activeFiltersCount > 0 && (
                <div className="sm:col-span-3 flex justify-end">
                  <button 
                    onClick={clearFilters}
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-600 transition-colors"
                  >
                    <X size={12} /> Reset System Filters
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-white/5 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {filteredUsers.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-24 flex flex-col items-center justify-center text-center px-6"
            >
              <div className="w-20 h-20 bg-slate-50 dark:bg-white/5 rounded-[32px] flex items-center justify-center mb-6 border border-slate-100 dark:border-white/5 shadow-inner">
                <SearchX size={32} className="text-slate-300 dark:text-slate-600" />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">No Citizens Found</h3>
              <p className="text-slate-500 dark:text-slate-400 font-medium max-w-xs text-sm">
                No intelligence nodes match your current filter parameters. Try expanding your search criteria.
              </p>
              {activeFiltersCount > 0 && (
                <button 
                  onClick={clearFilters}
                  className="mt-8 px-6 py-3 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-blue-500/20"
                >
                  Clear All Filters
                </button>
              )}
            </motion.div>
          ) : (
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
                <AnimatePresence mode='popLayout'>
                  {filteredUsers.map((user) => (
                    <motion.tr 
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      key={user.uid} 
                      className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors group"
                    >
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
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          )}
        </div>
      </div>
    </motion.div>
  );
}
