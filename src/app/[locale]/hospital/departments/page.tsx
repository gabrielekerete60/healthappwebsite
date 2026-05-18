'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, Plus, Trash2, ShieldCheck, 
  ArrowLeft, Loader2, Search, User, Users,
  ChevronRight, Activity, Heart, Eye, 
  Zap, Brain, Pill, Baby, Microscope
} from 'lucide-react';
import { Link, useRouter } from '@/i18n/routing';
import { auth, db } from '@/lib/firebase';
import { institutionService, getInstitutionById } from '@/services/institutionService';
import { Institution, InstitutionStaff } from '@/types/institution';
import NiceModal from '@/components/common/NiceModal';

const DEPT_ICONS = [
  { id: 'activity', icon: Activity, label: 'General' },
  { id: 'heart', icon: Heart, label: 'Cardiology' },
  { id: 'brain', icon: Brain, label: 'Neurology' },
  { id: 'eye', icon: Eye, label: 'Ophthalmology' },
  { id: 'baby', icon: Baby, label: 'Pediatrics' },
  { id: 'pill', icon: Pill, label: 'Pharmacy' },
  { id: 'microscope', icon: Microscope, label: 'Laboratory' },
  { id: 'zap', icon: Zap, label: 'Emergency' },
];

const DEPT_COLORS = [
  { id: 'blue', color: 'bg-blue-600', text: 'text-blue-600', border: 'border-blue-500/20' },
  { id: 'rose', color: 'bg-rose-600', text: 'text-rose-600', border: 'border-rose-500/20' },
  { id: 'emerald', color: 'bg-emerald-600', text: 'text-emerald-600', border: 'border-emerald-500/20' },
  { id: 'amber', color: 'bg-amber-600', text: 'text-amber-600', border: 'border-amber-500/20' },
  { id: 'indigo', color: 'bg-indigo-600', text: 'text-indigo-600', border: 'border-indigo-500/20' },
  { id: 'violet', color: 'bg-violet-600', text: 'text-violet-600', border: 'border-violet-500/20' },
];

export default function HospitalDepartmentsPage() {
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [staff, setStaff] = useState<InstitutionStaff[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const router = useRouter();

  // Form State
  const [deptName, setDeptName] = useState('');
  const [deptDesc, setDeptDesc] = useState('');
  const [deptHead, setDeptHead] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('activity');
  const [selectedColor, setSelectedColor] = useState('blue');

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const [inst, staffData] = await Promise.all([
          getInstitutionById(user.uid),
          institutionService.getStaff(user.uid)
        ]);
        if (inst) setInstitution(inst);
        setStaff(staffData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddDept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!institution || !deptName.trim()) return;

    setSaving(true);
    try {
      const newDept = {
        id: Date.now().toString(),
        name: deptName.trim(),
        description: deptDesc.trim(),
        headExpertId: deptHead || undefined,
        icon: selectedIcon,
        color: selectedColor
      };

      const updatedDepts = [...(institution.departments || []), newDept];
      await institutionService.updateDepartments(institution.id, updatedDepts);
      
      setInstitution({ ...institution, departments: updatedDepts });
      setShowAddForm(false);
      setDeptName('');
      setDeptDesc('');
      setDeptHead('');
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const removeDept = async (id: string) => {
    if (!institution) return;
    try {
      const updatedDepts = institution.departments.filter(d => d.id !== id);
      await institutionService.updateDepartments(institution.id, updatedDepts);
      setInstitution({ ...institution, departments: updatedDepts });
    } catch (error) {
      console.error(error);
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
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-indigo-600/5 blur-[120px] rounded-full -z-10" />
      
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <header className="mb-12 space-y-4">
          <Link href="/expert/dashboard" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors mb-2">
            <ArrowLeft size={12} /> Institutional Console
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
              <Building2 size={24} />
            </div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
              Department <span className="text-indigo-600">Nodes.</span>
            </h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-medium max-w-xl">
            Categorize your clinical services and link specialists to specific institutional departments.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Dept List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Active Departments</h3>
              {!showAddForm && (
                <button 
                  onClick={() => setShowAddForm(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-[9px] hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20"
                >
                  <Plus size={14} /> Add Department
                </button>
              )}
            </div>

            <AnimatePresence>
              {showAddForm && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-indigo-500/20 shadow-2xl mb-12"
                >
                  <form onSubmit={handleAddDept} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Department Name</label>
                        <input 
                          required
                          value={deptName}
                          onChange={e => setDeptName(e.target.value)}
                          placeholder="e.g. Cardiology Node"
                          className="w-full px-5 py-4 bg-slate-50 dark:bg-white/5 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Department Head</label>
                        <select 
                          value={deptHead}
                          onChange={e => setDeptHead(e.target.value)}
                          className="w-full px-5 py-4 bg-slate-50 dark:bg-white/5 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 appearance-none transition-all"
                        >
                          <option value="">Unassigned</option>
                          {staff.map(s => (
                            <option key={s.uid} value={s.uid}>{s.fullName}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Icon Protocol</label>
                      <div className="flex flex-wrap gap-3">
                        {DEPT_ICONS.map(i => (
                          <button
                            key={i.id}
                            type="button"
                            onClick={() => setSelectedIcon(i.id)}
                            className={`p-4 rounded-2xl transition-all border-2 ${selectedIcon === i.id ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 dark:bg-white/5 text-slate-400 border-transparent hover:border-indigo-500/20'}`}
                          >
                            <i.icon size={20} />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Phase Color</label>
                      <div className="flex flex-wrap gap-4">
                        {DEPT_COLORS.map(c => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => setSelectedColor(c.id)}
                            className={`w-10 h-10 rounded-full transition-all ring-offset-4 ring-offset-white dark:ring-offset-slate-900 ${c.color} ${selectedColor === c.id ? 'ring-2 ring-indigo-500' : 'hover:scale-110'}`}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Protocol Description</label>
                      <textarea 
                        value={deptDesc}
                        onChange={e => setDeptDesc(e.target.value)}
                        placeholder="Describe clinical focus..."
                        rows={3}
                        className="w-full p-6 bg-slate-50 dark:bg-white/5 border-none rounded-3xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none transition-all"
                      />
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button 
                        type="submit"
                        disabled={saving}
                        className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all active:scale-[0.98] disabled:opacity-50"
                      >
                        {saving ? "Deploying Node..." : "Activate Department"}
                      </button>
                      <button 
                        type="button"
                        onClick={() => setShowAddForm(false)}
                        className="px-8 py-4 bg-slate-100 dark:bg-white/5 text-slate-500 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-200 transition-all"
                      >
                        Abort
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {institution?.departments?.map((dept) => {
                const iconObj = DEPT_ICONS.find(i => i.id === dept.icon) || DEPT_ICONS[0];
                const colorObj = DEPT_COLORS.find(c => c.id === dept.color) || DEPT_COLORS[0];
                const staffCount = staff.filter(s => s.departmentId === dept.id).length;
                
                return (
                  <div key={dept.id} className={`bg-white dark:bg-slate-900 p-8 rounded-[40px] border ${colorObj.border} shadow-sm group hover:shadow-xl transition-all relative overflow-hidden`}>
                    <div className="flex justify-between items-start mb-6">
                      <div className={`p-4 rounded-[20px] bg-slate-50 dark:bg-white/5 ${colorObj.text}`}>
                        <iconObj.icon size={24} />
                      </div>
                      <button 
                        onClick={() => removeDept(dept.id)}
                        className="p-2 text-slate-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    
                    <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">{dept.name}</h4>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-8 leading-relaxed line-clamp-2">{dept.description || "No protocol description provided."}</p>
                    
                    <div className="flex items-center justify-between pt-6 border-t border-slate-50 dark:border-white/5">
                      <div className="flex items-center gap-2">
                        <Users size={14} className="text-slate-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{staffCount} Active Nodes</span>
                      </div>
                      {dept.headExpertId && (
                        <div className="flex items-center gap-2">
                           <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                              <User size={10} className="text-slate-400" />
                           </div>
                           <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                              {staff.find(s => s.uid === dept.headExpertId)?.fullName.split(' ')[0] || "Head"}
                           </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Institutional Stats */}
          <div className="space-y-8">
            <div className="bg-slate-900 p-10 rounded-[48px] text-white relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/30 blur-[60px] rounded-full" />
              <div className="relative z-10">
                <ShieldCheck size={32} className="text-indigo-400 mb-6" />
                <h4 className="text-xl font-black uppercase tracking-tight mb-4">Enterprise Logic</h4>
                <p className="text-sm font-medium opacity-60 leading-relaxed mb-8">
                  Defining department nodes enables the "Campus" profile view and allows for autonomous clinical routing.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Total Staff</span>
                    <span className="text-xl font-black">{staff.length}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Departments</span>
                    <span className="text-xl font-black">{institution?.departments?.length || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
