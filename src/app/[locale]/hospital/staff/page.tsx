'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, UserPlus, Mail, ShieldCheck, 
  ArrowLeft, Loader2, Trash2, Search,
  Building2, Plus, CheckCircle2, Shield,
  Activity, X, SlidersHorizontal, User
} from 'lucide-react';
import { Link, useRouter } from '@/i18n/routing';
import { auth, db } from '@/lib/firebase';
import { institutionService, getInstitutionById } from '@/services/institutionService';
import { InstitutionStaff, InstitutionStaffRole, Institution } from '@/types/institution';
import NiceModal from '@/components/common/NiceModal';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { Dropdown } from '@/components/ui/Dropdown';

export default function InstitutionalStaffPage() {
  const [staff, setStaff] = useState<InstitutionStaff[]>([]);
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [invites, setInvites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviting, setInviting] = useState(false);
  
  // Form State
  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<InstitutionStaffRole>('practitioner');
  const [selectedDept, setSelectedDept] = useState('all');

  // Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    type: 'success' | 'warning' | 'info';
  }>({
    isOpen: false,
    title: '',
    description: '',
    type: 'info'
  });

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const fetchData = async () => {
      try {
        const [staffData, instData] = await Promise.all([
          institutionService.getStaff(user.uid),
          getInstitutionById(user.uid)
        ]);
        
        setStaff(staffData);
        if (instData) setInstitution(instData);

        // Real-time listener for invites
        const q = query(
          collection(db, 'staff_invites'),
          where('institutionId', '==', user.uid),
          where('status', '==', 'pending')
        );
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
          setInvites(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        return () => unsubscribe();
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setInviting(true);
    try {
      await institutionService.inviteStaff(
        auth.currentUser!.uid, 
        institution?.name || "Institutional Node", 
        email, 
        selectedRole, 
        selectedDept === 'all' ? undefined : selectedDept
      );
      setEmail('');
      setModalConfig({
        isOpen: true,
        title: "Protocol Dispatched",
        description: `Authorization invitation sent to ${email} as ${selectedRole}.`,
        type: 'success'
      });
    } catch (error) {
      console.error(error);
    } finally {
      setInviting(false);
    }
  };

  const filteredStaff = useMemo(() => {
    return staff.filter(s => {
      const matchesSearch = !searchQuery || 
        s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
        s.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === 'all' || s.role === roleFilter;
      const matchesDept = deptFilter === 'all' || s.departmentId === deptFilter;
      return matchesSearch && matchesRole && matchesDept;
    });
  }, [staff, searchQuery, roleFilter, deptFilter]);

  const activeFiltersCount = [
    roleFilter !== 'all',
    deptFilter !== 'all'
  ].filter(Boolean).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const roleOptions = [
    { value: 'practitioner', label: 'Practitioner', icon: <Activity size={12} /> },
    { value: 'head', label: 'Dept Head', icon: <Shield size={12} /> },
    { value: 'receptionist', label: 'Receptionist', icon: <User size={12} /> },
    { value: 'admin', label: 'Facility Admin', icon: <ShieldCheck size={12} /> },
  ];

  const deptOptions = [
    { value: 'all', label: 'No Specific Dept' },
    ...(institution?.departments || []).map(d => ({ value: d.id, label: d.name }))
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-32 sm:pt-40 pb-24 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] rounded-full -z-10" />
      
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="space-y-4">
            <Link href="/expert/dashboard" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors mb-2">
              <ArrowLeft size={12} /> Institutional Console
            </Link>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                <Users size={24} />
              </div>
              <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                Clinical <span className="text-blue-600">Staff.</span>
              </h1>
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-medium max-w-xl">
              Manage internal orchestration nodes and specialist links for this facility. 
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                type="text"
                placeholder="Search Staff Identity..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
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
        </header>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              className="mb-8 relative z-50"
            >
              <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-white/5 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Filter Role</label>
                  <Dropdown 
                    value={roleFilter}
                    onChange={setRoleFilter}
                    options={[{ value: 'all', label: 'All Roles' }, ...roleOptions]}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Filter Department</label>
                  <Dropdown 
                    value={deptFilter}
                    onChange={setDeptFilter}
                    options={[{ value: 'all', label: 'All Departments' }, ...deptOptions.filter(o => o.value !== 'all')]}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Active Staff */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-white/5 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                {filteredStaff.length === 0 ? (
                  <div className="py-24 text-center px-6">
                    <div className="w-20 h-20 bg-slate-50 dark:bg-white/5 rounded-[32px] flex items-center justify-center mb-6 border border-slate-100 dark:border-white/5 shadow-inner mx-auto">
                      <Users size={32} className="text-slate-300 dark:text-slate-600" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">No Staff Detected</h3>
                    <p className="text-slate-500 dark:text-slate-400 font-medium max-w-xs mx-auto text-sm leading-relaxed">
                      No nodes matching your current query parameters are linked to this facility.
                    </p>
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5">
                        <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Practitioner</th>
                        <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Role / Node</th>
                        <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Department</th>
                        <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-white/5 text-sm font-medium text-slate-600 dark:text-slate-300">
                      {filteredStaff.map((s) => (
                        <tr key={s.uid} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors group">
                          <td className="p-6">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                <User size={18} />
                              </div>
                              <div>
                                <p className="font-black text-slate-900 dark:text-white uppercase tracking-tight">{s.fullName}</p>
                                <p className="text-xs text-slate-400">{s.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-6">
                            <div className="flex items-center gap-2">
                              {s.role === 'admin' ? <ShieldCheck size={14} className="text-emerald-500" /> : <Activity size={14} className="text-blue-500" />}
                              <span className="uppercase tracking-widest text-[10px] font-black">{s.role}</span>
                            </div>
                          </td>
                          <td className="p-6">
                            <span className="uppercase tracking-widest text-[10px] font-black text-slate-400">
                              {institution?.departments.find(d => d.id === s.departmentId)?.name || 'General Wing'}
                            </span>
                          </td>
                          <td className="p-6 text-right">
                            <button 
                              onClick={() => institutionService.unlinkExpert(s.uid)}
                              className="p-3 rounded-xl text-slate-300 hover:bg-red-50 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Pending Invites */}
            {invites.length > 0 && (
              <div className="pt-12 space-y-6">
                <h3 className="text-sm font-black text-amber-500 uppercase tracking-widest">Pending Protocol Authorizations</h3>
                <div className="space-y-3">
                  {invites.map((invite) => (
                    <div key={invite.id} className="bg-white dark:bg-slate-900 p-5 rounded-[28px] border border-amber-100 dark:border-amber-900/20 flex items-center justify-between shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/20 rounded-xl flex items-center justify-center text-amber-500">
                          <Mail size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{invite.email}</p>
                          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{invite.role} · {institution?.departments.find(d => d.id === invite.departmentId)?.name || 'General'}</p>
                        </div>
                      </div>
                      <span className="text-[8px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 dark:bg-amber-900/30 px-4 py-2 rounded-full border border-amber-100 dark:border-amber-900/20">Awaiting Handshake</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Invite Section */}
          <div className="space-y-6">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Initialize Invitation</h3>
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-white/5 shadow-xl shadow-blue-900/5 sticky top-24">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-8 leading-relaxed uppercase tracking-widest">
                Invite a verified specialist to link their node to this facility protocol.
              </p>
              <form onSubmit={handleInvite} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Staff Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      type="email"
                      required
                      placeholder="node@intelligence.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-4 bg-slate-50 dark:bg-white/5 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Assigned Role</label>
                  <Dropdown 
                    value={selectedRole}
                    onChange={(val) => setSelectedRole(val as InstitutionStaffRole)}
                    options={roleOptions}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Department Wing</label>
                  <Dropdown 
                    value={selectedDept}
                    onChange={setSelectedDept}
                    options={deptOptions}
                  />
                </div>

                <button 
                  disabled={inviting}
                  className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
                >
                  {inviting ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
                  Dispatch Authorization
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <NiceModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        title={modalConfig.title}
        description={modalConfig.description}
        type={modalConfig.type}
      />
    </div>
  );
}
