'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, UserPlus, Mail, ShieldCheck, 
  ArrowLeft, Loader2, Trash2, Search,
  Building2, Plus, CheckCircle2
} from 'lucide-react';
import { Link, useRouter } from '@/i18n/routing';
import { auth, db } from '@/lib/firebase';
import { institutionService } from '@/services/institutionService';
import { PublicExpert } from '@/types/expert';
import NiceModal from '@/components/common/NiceModal';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

export default function InstitutionalStaffPage() {
  const [experts, setExperts] = useState<PublicExpert[]>([]);
  const [invites, setInvites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviting, setInviting] = useState(false);
  const [email, setEmail] = useState('');
  const router = useRouter();

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
        const staff = await institutionService.getLinkedExperts(user.uid);
        setExperts(staff);

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
      await institutionService.inviteExpert(auth.currentUser!.uid, "Institutional Node", email);
      setEmail('');
      setModalConfig({
        isOpen: true,
        title: "Invitation Broadcasted",
        description: `Authorization node sent to ${email}.`,
        type: 'success'
      });
    } catch (error) {
      console.error(error);
    } finally {
      setInviting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-32 sm:pt-40 pb-24 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] rounded-full -z-10" />
      
      <div className="max-w-6xl mx-auto px-4 relative z-10">
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
              Manage individual expert nodes linked to this institutional protocol. 
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 px-6 py-4 rounded-2xl border border-slate-100 dark:border-white/5 flex items-center gap-4 shadow-sm">
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Verified Staff</p>
              <p className="text-lg font-black text-slate-900 dark:text-white">{experts.length}</p>
            </div>
            <div className="w-px h-8 bg-slate-100 dark:bg-white/10" />
            <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-600">
              <ShieldCheck size={18} />
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Active Staff */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Linked Specialists</h3>
            
            {experts.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-white/5 p-12 text-center">
                <p className="text-slate-400 font-medium text-sm">No specialists linked to this institutional node yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {experts.map((expert) => (
                  <div key={expert.id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-white/5 flex items-center gap-6 group">
                    <div className="w-14 h-14 bg-slate-100 dark:bg-white/5 rounded-2xl flex items-center justify-center text-slate-400">
                      <Building2 size={24} />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{expert.name}</h4>
                      <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{expert.specialty}</p>
                    </div>
                    <button 
                      onClick={() => institutionService.unlinkExpert(expert.id)}
                      className="p-3 rounded-xl text-slate-300 hover:bg-red-50 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Pending Invites */}
            {invites.length > 0 && (
              <div className="pt-12 space-y-6">
                <h3 className="text-sm font-black text-amber-500 uppercase tracking-widest">Pending Authorizations</h3>
                <div className="space-y-3">
                  {invites.map((invite) => (
                    <div key={invite.id} className="bg-amber-50/30 dark:bg-amber-900/5 p-5 rounded-2xl border border-amber-100 dark:border-amber-900/20 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Mail size={18} className="text-amber-500" />
                        <span className="text-sm font-bold text-slate-600 dark:text-slate-300">{invite.expertEmail}</span>
                      </div>
                      <span className="text-[8px] font-black uppercase tracking-widest text-amber-600 bg-amber-100 dark:bg-amber-900/30 px-4 py-1.5 rounded-full">Awaiting Acceptance</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Invite Section */}
          <div className="space-y-6">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Authorize Specialist</h3>
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-white/5 shadow-xl shadow-blue-900/5">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-8 leading-relaxed uppercase tracking-widest">
                Invite a verified specialist to link their node to this facility.
              </p>
              <form onSubmit={handleInvite} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="email"
                    required
                    placeholder="expert@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-white/5 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-blue-500/20 outline-none"
                  />
                </div>
                <button 
                  disabled={inviting}
                  className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {inviting ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
                  Dispatch Invite
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
