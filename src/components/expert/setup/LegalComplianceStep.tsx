'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, FileCheck, Scale, PenTool, X, ChevronRight, CheckCircle2 } from 'lucide-react';

interface LegalPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
  onAgree: () => void;
  onDisagree: () => void;
  isAccepted: boolean;
}

const LegalPolicyModal: React.FC<LegalPolicyModalProps> = ({ isOpen, onClose, title, content, onAgree, onDisagree, isAccepted }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden"
          >
            <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/20">
                  <ShieldCheck size={20} />
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase">{title}</h3>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <X size={20} className="text-slate-400" />
              </button>
            </div>
            
            <div className="p-8 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed whitespace-pre-wrap">
                  {content}
                </p>
              </div>
            </div>
            
            <div className="p-8 border-t border-slate-50 dark:border-slate-800 flex flex-col sm:flex-row gap-4 bg-slate-50/50 dark:bg-slate-800/50">
              <button
                onClick={onDisagree}
                className="flex-1 py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest text-[10px] hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                Disagree
              </button>
              <button
                onClick={onAgree}
                className={`flex-1 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl transition-all flex items-center justify-center gap-2 ${
                  isAccepted 
                    ? 'bg-emerald-500 text-white shadow-emerald-500/20' 
                    : 'bg-blue-600 text-white shadow-blue-500/20 hover:bg-blue-700'
                }`}
              >
                {isAccepted ? <><CheckCircle2 size={16} /> Accepted</> : 'I Agree & Accept'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

interface LegalComplianceStepProps {
  formData: any;
  handleUpdate: (field: string, value: any) => void;
  validationErrors: Record<string, string>;
}

export default function LegalComplianceStep({ formData, handleUpdate, validationErrors }: LegalComplianceStepProps) {
  const [activePolicy, setActivePolicy] = useState<any>(null);

  const agreements = [
    { 
      id: 'tosAccepted', 
      label: 'Terms of Service', 
      icon: ShieldCheck,
      content: "These Terms of Service govern your use of the Health AI Platform. By using our services, you agree to comply with professional standards, maintain patient confidentiality, and provide accurate medical information. You must be a licensed healthcare professional to offer expert services on this platform. We reserve the right to suspend accounts that violate our community guidelines or clinical safety protocols."
    },
    { 
      id: 'privacyAccepted', 
      label: 'Privacy Policy', 
      icon: FileCheck,
      content: "Your privacy and the privacy of your patients are our top priorities. We employ military-grade encryption for all medical data and communication nodes. We do not sell personal data to third parties. By accepting, you agree to our data processing practices as outlined in the full Privacy Policy document, ensuring compliance with HIPAA and other international health data regulations."
    },
    { 
      id: 'telemedicineAccepted', 
      label: 'Telemedicine Guidelines', 
      icon: Scale,
      content: "Practicing telemedicine requires adherence to specific clinical standards. You agree to verify patient identity, maintain clear records of virtual consultations, and recommend in-person care when virtual assessment is insufficient. You must ensure your environment is private and professional during all live sessions conducted through the platform nodes."
    },
    { 
      id: 'conductAccepted', 
      label: 'Professional Conduct', 
      icon: ShieldCheck,
      content: "The Health AI community relies on trust. You agree to treat all users with respect, provide evidence-based medical advice, and avoid any conflict of interest. Financial transactions must be handled exclusively through the platform's secure channels. Failure to maintain professional ethics will result in immediate decommissioning of your expert node."
    },
  ];

  const handleToggle = (id: string, value: boolean) => {
    const currentLegal = formData.legal || {};
    handleUpdate('legal', { ...currentLegal, [id]: value });
    setActivePolicy(null);
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
      <div>
        <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Legal & Compliance</h3>
        <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Review and accept the legal policies to continue as a verified expert.</p>
      </div>

      <div className="space-y-4">
        {agreements.map((item) => (
          <div 
            key={item.id}
            onClick={() => setActivePolicy(item)}
            className={`p-6 rounded-[32px] border-2 transition-all cursor-pointer flex items-center justify-between group ${
              formData.legal?.[item.id] 
                ? 'bg-emerald-50/30 dark:bg-emerald-500/5 border-emerald-500/20' 
                : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-blue-500/30 shadow-sm'
            }`}
          >
            <div className="flex items-center gap-5">
              <div className={`p-4 rounded-2xl transition-all duration-500 ${
                formData.legal?.[item.id] ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:text-blue-500'
              }`}>
                <item.icon className="w-6 h-6" />
              </div>
              <div>
                <span className={`text-[10px] font-black uppercase tracking-widest block mb-1 ${formData.legal?.[item.id] ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                  Agreement Required
                </span>
                <span className={`text-lg font-black tracking-tight ${formData.legal?.[item.id] ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                  {item.label}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {formData.legal?.[item.id] && (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full text-[9px] font-black uppercase tracking-widest">
                  <CheckCircle2 size={12} /> Accepted
                </div>
              )}
              <div className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center transition-all ${
                formData.legal?.[item.id] ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-200 dark:border-slate-800 group-hover:border-blue-500/30'
              }`}>
                <ChevronRight size={18} className={formData.legal?.[item.id] ? 'hidden' : ''} />
                {formData.legal?.[item.id] && <CheckCircle2 size={20} />}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
        <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest flex items-center gap-2">
          <PenTool size={14} className="text-blue-500" /> Digital Signature
        </label>
        <div className="relative">
          <input 
            type="text" 
            value={formData.legal?.signature || ''}
            onChange={(e) => handleUpdate('legal', { ...formData.legal, signature: e.target.value })}
            placeholder="Type your full legal name to sign"
            className={`w-full px-6 py-5 rounded-[24px] bg-white dark:bg-slate-900 border-2 outline-none font-bold text-slate-900 dark:text-white font-mono transition-all ${
              validationErrors.signature ? 'border-red-500 ring-4 ring-red-500/10' : 'border-slate-100 dark:border-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'
            }`}
          />
        </div>
        {validationErrors.signature && <p className="text-[10px] text-red-500 font-black uppercase tracking-widest ml-1">{validationErrors.signature}</p>}
      </div>

      <LegalPolicyModal 
        isOpen={!!activePolicy}
        onClose={() => setActivePolicy(null)}
        title={activePolicy?.label || ''}
        content={activePolicy?.content || ''}
        isAccepted={activePolicy ? !!formData.legal?.[activePolicy.id] : false}
        onAgree={() => activePolicy && handleToggle(activePolicy.id, true)}
        onDisagree={() => activePolicy && handleToggle(activePolicy.id, false)}
      />

      {validationErrors.agreements && (
        <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-2xl flex items-center gap-3 text-red-600 dark:text-red-400">
           <p className="text-[10px] font-black uppercase tracking-widest">{validationErrors.agreements}</p>
        </div>
      )}
    </motion.div>
  );
}
