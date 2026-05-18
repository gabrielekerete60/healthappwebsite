'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { 
  ClipboardList, Search, Filter, ArrowLeft, 
  Loader2, User, Calendar, Clock, CheckCircle2,
  AlertCircle, ChevronRight, Activity, Shield,
  LayoutGrid, List, MapPin, Pill, CheckCircle
} from 'lucide-react';
import { Link, useRouter } from '@/i18n/routing';
import { auth, db } from '@/lib/firebase';
import { institutionService } from '@/services/institutionService';
import { doc, updateDoc } from 'firebase/firestore';

type TriageStatus = 'scheduled' | 'checked_in' | 'in_consultation' | 'pharmacy' | 'discharged';

interface RegistryAppointment {
  id: string;
  userId: string;
  expertName: string;
  expertId: string;
  date: string;
  time: string;
  status: string;
  triageStatus?: TriageStatus;
  urgency?: 'normal' | 'high' | 'emergency';
}

export default function InstitutionalRegistryPage() {
  const [appointments, setAppointments] = useState<RegistryAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('kanban');
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const data = await institutionService.getInstitutionalAppointments(user.uid);
        // Default triage status if missing
        const enrichedData = data.map(apt => ({
          ...apt,
          triageStatus: apt.triageStatus || (apt.status === 'completed' ? 'discharged' : 'scheduled')
        }));
        setAppointments(enrichedData);
      } catch (error) {
        console.error("Failed to fetch registry:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleTriageUpdate = async (aptId: string, newStatus: TriageStatus) => {
    try {
      await updateDoc(doc(db, 'appointments', aptId), {
        triageStatus: newStatus,
        updatedAt: new Date().toISOString()
      });
      setAppointments(prev => prev.map(a => a.id === aptId ? { ...a, triageStatus: newStatus } : a));
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  const filteredAppointments = useMemo(() => {
    return appointments.filter(apt => 
      apt.expertName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.userId.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [appointments, searchQuery]);

  const columns: { id: TriageStatus; label: string; icon: any; color: string }[] = [
    { id: 'scheduled', label: 'Scheduled', icon: Calendar, color: 'text-blue-500' },
    { id: 'checked_in', label: 'Checked-In', icon: MapPin, color: 'text-amber-500' },
    { id: 'in_consultation', label: 'In Consultation', icon: Activity, color: 'text-indigo-500' },
    { id: 'pharmacy', label: 'Pharmacy', icon: Pill, color: 'text-rose-500' },
    { id: 'discharged', label: 'Discharged', icon: CheckCircle, color: 'text-emerald-500' },
  ];

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
      
      <div className="max-w-[1600px] mx-auto px-4 relative z-10">
        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
          <div className="space-y-4">
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
              A real-time command board for patient triage and clinical flow across the facility.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="relative w-64 sm:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text"
                placeholder="Search Patient Node..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all shadow-sm"
              />
            </div>
            
            <div className="bg-white dark:bg-slate-900 p-1 rounded-2xl border border-slate-100 dark:border-white/5 flex gap-1 shadow-sm">
              <button 
                onClick={() => setViewMode('kanban')}
                className={`p-2.5 rounded-xl transition-all ${viewMode === 'kanban' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:bg-slate-50'}`}
              >
                <LayoutGrid size={18} />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-2.5 rounded-xl transition-all ${viewMode === 'list' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:bg-slate-50'}`}
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {viewMode === 'kanban' ? (
            <motion.div 
              key="kanban"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6"
            >
              {columns.map((col) => (
                <div key={col.id} className="space-y-6">
                  <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 shadow-sm ${col.color}`}>
                        <col.icon size={14} />
                      </div>
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">{col.label}</h3>
                    </div>
                    <span className="text-[10px] font-black text-slate-400 bg-slate-100 dark:bg-white/5 px-2 py-1 rounded-md">
                      {filteredAppointments.filter(a => a.triageStatus === col.id).length}
                    </span>
                  </div>

                  <div className="space-y-4 min-h-[500px]">
                    {filteredAppointments.filter(a => a.triageStatus === col.id).map((apt) => (
                      <motion.div 
                        layoutId={apt.id}
                        key={apt.id}
                        className="bg-white dark:bg-slate-900 p-5 rounded-[28px] border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-xl hover:border-emerald-500/20 transition-all cursor-pointer group relative overflow-hidden"
                      >
                        {apt.urgency === 'emergency' && (
                          <div className="absolute top-0 left-0 w-full h-1 bg-red-500 animate-pulse" />
                        )}
                        <div className="flex justify-between items-start mb-4">
                          <div className="w-10 h-10 bg-slate-50 dark:bg-white/5 rounded-xl flex items-center justify-center text-slate-400">
                            <User size={18} />
                          </div>
                          <div className="text-right">
                             <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest">{apt.time}</p>
                             <p className="text-[10px] font-black text-slate-900 dark:text-white">{apt.date}</p>
                          </div>
                        </div>
                        
                        <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mb-1">
                          Node-{apt.userId.substring(0, 6)}
                        </h4>
                        <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-4">
                          {apt.expertName}
                        </p>

                        <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-white/5">
                           <div className="flex -space-x-2">
                              {/* Future: Patient Avatar / Priority Tags */}
                           </div>
                           <div className="flex gap-1">
                              {columns.map((targetCol) => (
                                targetCol.id !== col.id && (
                                  <button 
                                    key={targetCol.id}
                                    onClick={() => handleTriageUpdate(apt.id, targetCol.id)}
                                    title={`Move to ${targetCol.label}`}
                                    className="p-1.5 rounded-lg text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-blue-500 transition-all"
                                  >
                                    <targetCol.icon size={12} />
                                  </button>
                                )
                              ))}
                           </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              key="list"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-white/5 overflow-hidden shadow-xl"
            >
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/5">
                    <th className="p-8 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Patient Node</th>
                    <th className="p-8 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Specialist</th>
                    <th className="p-8 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Temporal Node</th>
                    <th className="p-8 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Flow Status</th>
                    <th className="p-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointments.map((apt) => (
                    <tr key={apt.id} className="group hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors border-b border-slate-50 dark:border-white/5 last:border-none">
                      <td className="p-8">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-600">
                            <User size={18} />
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900 dark:text-white uppercase">Node-{apt.userId.substring(0, 6)}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Link</p>
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
                      <td className="p-8">
                        <div className="flex items-center gap-2">
                           {columns.find(c => c.id === apt.triageStatus)?.icon && 
                            React.createElement(columns.find(c => c.id === apt.triageStatus)!.icon, { size: 14, className: columns.find(c => c.id === apt.triageStatus)!.color })
                           }
                           <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">
                              {apt.triageStatus?.replace('_', ' ')}
                           </span>
                        </div>
                      </td>
                      <td className="p-8 text-right">
                        <button className="p-2 rounded-xl text-slate-300 hover:text-blue-600 transition-colors">
                          <ChevronRight size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
