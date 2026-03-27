'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ClipboardList, Search, Filter, ArrowLeft, 
  Loader2, User, Calendar, Clock, CheckCircle2,
  AlertCircle, ChevronRight, Activity, Shield
} from 'lucide-react';
import { Link, useRouter } from '@/i18n/routing';
import { auth } from '@/lib/firebase';
import { institutionService } from '@/services/institutionService';

export default function InstitutionalRegistryPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const data = await institutionService.getInstitutionalAppointments(user.uid);
        setAppointments(data);
      } catch (error) {
        console.error("Failed to fetch registry:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredAppointments = appointments.filter(apt => 
    apt.expertName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    apt.userId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-32 sm:pt-40 pb-24 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-600/5 blur-[120px] rounded-full -z-10" />
      
      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <header className="mb-12 space-y-4">
          <Link href="/expert/dashboard" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors mb-2">
            <ArrowLeft size={12} /> Institutional Console
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-600/20">
              <ClipboardList size={24} />
            </div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
              Institutional <span className="text-emerald-600">Registry.</span>
            </h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-medium max-w-xl">
            A unified view of all clinical sessions and patient triage across your facility nodes.
          </p>
        </header>

        {/* Search Hub */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-white/5 shadow-sm mb-12 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Search by specialist or patient ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-white/5 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
            />
          </div>
          <div className="flex gap-2">
            <button className="px-6 py-4 bg-slate-50 dark:bg-white/5 text-slate-400 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-100 transition-all flex items-center gap-2">
              <Filter size={14} /> Filter Node
            </button>
          </div>
        </div>

        {/* Registry Table */}
        <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-white/5 overflow-hidden shadow-xl shadow-emerald-900/5">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/5">
                  <th className="p-8 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Patient Node</th>
                  <th className="p-8 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Specialist</th>
                  <th className="p-8 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Protocol Date</th>
                  <th className="p-8 text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Status</th>
                  <th className="p-8"></th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-20 text-center">
                      <p className="text-slate-400 font-bold text-sm">No institutional records found in the registry.</p>
                    </td>
                  </tr>
                ) : (
                  filteredAppointments.map((apt) => (
                    <tr key={apt.id} className="group hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors border-b border-slate-50 dark:border-white/5 last:border-none">
                      <td className="p-8">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-600">
                            <User size={18} />
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900 dark:text-white uppercase">Node-{apt.userId.substring(0, 6)}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Patient</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-8">
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{apt.expertName}</p>
                      </td>
                      <td className="p-8">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                          <Calendar size={14} className="text-emerald-500" />
                          {apt.date} • {apt.time}
                        </div>
                      </td>
                      <td className="p-8 text-center">
                        <span className={`text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                          apt.status === 'confirmed' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                        }`}>
                          {apt.status}
                        </span>
                      </td>
                      <td className="p-8 text-right">
                        <button className="p-2 rounded-xl text-slate-300 hover:text-blue-600 transition-colors">
                          <ChevronRight size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
