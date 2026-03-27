'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, Plus, Trash2, ShieldCheck, 
  ArrowLeft, Loader2, Search, User, 
  ChevronRight, Activity
} from 'lucide-react';
import { Link, useRouter } from '@/i18n/routing';
import { auth, db } from '@/lib/firebase';
import { institutionService, getInstitutionById } from '@/services/institutionService';
import { Institution } from '@/types/institution';
import { PublicExpert } from '@/types/expert';
import NiceModal from '@/components/common/NiceModal';

export default function HospitalDepartmentsPage() {
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [experts, setExperts] = useState<PublicExpert[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const router = useRouter();

  // Form State
  const [deptName, setDeptName] = useState('');
  const [deptDesc, setDeptDesc] = useState('');
  const [deptHead, setDeptHead] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const [inst, staff] = await Promise.all([
          getInstitutionById(user.uid),
          institutionService.getLinkedExperts(user.uid)
        ]);
        if (inst) setInstitution(inst);
        setExperts(staff);
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
        headExpertId: deptHead || undefined
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
      
      <div className="max-w-6xl mx-auto px-4 relative z-10">
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
              <button 
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-black uppercase tracking-widest text-[8px] hover:bg-indigo-700 transition-all"
              >
                <Plus size={12} /> Add Department
              </button>
            </div>

            <AnimatePresence>
              {showAddForm && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-indigo-500/20 shadow-xl mb-8"
                >
                  <form onSubmit={handleAddDept} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Department Name</label>
                        <input 
                          required
                          value={deptName}
                          onChange={e => setDeptName(e.target.value)}
                          placeholder="e.g. Cardiology Node"
                          className="w-full px-5 py-4 bg-slate-50 dark:bg-white/5 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Head of Department</label>
                        <select 
                          value={deptHead}
                          onChange={e => setDeptHead(e.target.value)}
                          className="w-full px-5 py-4 bg-slate-50 dark:bg-white/5 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 appearance-none"
                        >
                          <option value="">Select specialist...</option>
                          {experts.map(e => (
                            <option key={e.id} value={e.id}>{e.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Description</label>
                      <textarea 
                        value={deptDesc}
                        onChange={e => setDeptDesc(e.target.value)}
                        placeholder="Describe clinical focus..."
                        rows={3}
                        className="w-full p-5 bg-slate-50 dark:bg-white/5 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button 
                        type="submit"
                        disabled={saving}
                        className="flex-1 py-4 bg-indigo-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] disabled:opacity-50"
                      >
                        {saving ? "Activating Node..." : "Activate Department"}
                      </button>
                      <button 
                        type="button"
                        onClick={() => setShowAddForm(false)}
                        className="px-8 py-4 bg-slate-100 dark:bg-white/5 text-slate-500 rounded-xl font-black uppercase tracking-widest text-[10px]"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {institution?.departments?.map((dept) => (
                <div key={dept.id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm group hover:border-indigo-500/30 transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600">
                      <Activity size={20} />
                    </div>
                    <button 
                      onClick={() => removeDept(dept.id)}
                      className="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{dept.name}</h4>
                  <p className="text-[10px] font-medium text-slate-500 mb-4 line-clamp-2">{dept.description || "No protocol description provided."}</p>
                  
                  {dept.headExpertId && (
                    <div className="pt-4 border-t border-slate-50 dark:border-white/5 flex items-center gap-2">
                      <User size={12} className="text-slate-400" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                        Head: {experts.find(e => e.id === dept.headExpertId)?.name || "Specialist Node"}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Institutional Stats */}
          <div className="space-y-8">
            <div className="bg-slate-900 p-8 rounded-[40px] text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-600/20 blur-2xl rounded-full" />
              <ShieldCheck size={24} className="text-indigo-400 mb-4" />
              <h4 className="text-sm font-black uppercase tracking-tight mb-2">Service Standards</h4>
              <p className="text-[10px] font-medium opacity-60 leading-relaxed">
                Categorizing your nodes into departments improves clinical visibility and triage efficiency within the global health registry.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
