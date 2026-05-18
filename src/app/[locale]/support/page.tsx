'use client';

import React, { useState, useMemo } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Search, HelpCircle, MessageCircle, Mail, Phone, ChevronRight, Activity, Zap, Shield, Globe, Database, UserCheck, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  solution?: string;
  actionLabel?: string;
  actionHref?: string;
}

export default function SupportPage() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const response = await fetch('/api/support/faqs');
        const data = await response.json();
        if (data.faqs) {
          setFaqs(data.faqs);
        }
      } catch (error) {
        console.error("Failed to load intelligence base:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFaqs();
  }, []);

  const categories = useMemo(() => {
    return ['All', ...Array.from(new Set(faqs.map(item => item.category)))];
  }, [faqs]);

  const filteredFaqs = useMemo(() => {
    return faqs.filter(item => {
      const matchesSearch = item.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           item.answer.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory, faqs]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors pt-32 sm:pt-40 pb-24 relative overflow-hidden">
      {/* Dynamic Neural Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/[0.03] blur-[140px] rounded-full -translate-y-1/4 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/[0.03] blur-[120px] rounded-full translate-y-1/4 -translate-x-1/4" />
      </div>

      <div className="max-w-5xl mx-auto px-4 relative z-10">
        <div className="text-center mb-16 space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-5 py-2 bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] border border-slate-100 dark:border-white/5 rounded-2xl shadow-xl shadow-blue-500/5 mx-auto"
          >
            <Activity size={14} className="animate-pulse" />
            Support Grid Protocol
          </motion.div>
          
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight uppercase">
              How can we help <span className="text-blue-600 text-glow">you?</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium max-w-xl mx-auto leading-relaxed">
              Access the Automated Intelligence Base for instant solutions or connect directly with our support nodes.
            </p>
          </div>
          
          <div className="max-w-2xl mx-auto relative group">
            <div className="absolute inset-0 bg-blue-600/5 blur-2xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-blue-600 transition-colors z-10" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search diagnostic base..."
              className="w-full pl-16 pr-6 py-6 rounded-[32px] border border-slate-100 dark:border-white/5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold shadow-2xl shadow-blue-900/5 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all outline-none relative z-10"
            />
          </div>
        </div>

        {/* Contact Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          <ContactCard 
            icon={<MessageCircle className="w-6 h-6" />} 
            title="Live Chat" 
            desc="Direct line to support grid." 
            color="text-blue-600 bg-blue-50 dark:bg-blue-900/20"
          />
          <ContactCard 
            icon={<Mail className="w-6 h-6" />} 
            title="Email Support" 
            desc="support@ikikehealth.com" 
            color="text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20"
            href="mailto:support@ikikehealth.com"
          />
          <ContactCard 
            icon={<Phone className="w-6 h-6" />} 
            title="Emergency Care" 
            desc="Dial 112 for urgent medical." 
            color="text-rose-600 bg-rose-50 dark:bg-rose-900/20"
          />
        </div>

        {/* Categories Range */}
        <div className="flex flex-col gap-6 mb-10">
          <div className="flex items-center justify-between px-2">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Range Filters</span>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">{faqs.length} Nodes Indexed</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {categories.map(cat => {
              const count = cat === 'All' ? faqs.length : faqs.filter(f => f.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border flex items-center gap-2 ${
                    activeCategory === cat 
                      ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/30' 
                      : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-white/5 text-slate-500 hover:border-blue-500/30'
                  }`}
                >
                  {cat}
                  <span className={`px-1.5 py-0.5 rounded-md text-[8px] ${activeCategory === cat ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* FAQ Base */}
        <div className="bg-white dark:bg-slate-900 rounded-[48px] shadow-3xl shadow-blue-900/5 border border-slate-100 dark:border-white/5 overflow-hidden">
          <div className="p-8 sm:p-10 border-b border-slate-50 dark:border-white/5 flex items-center gap-4 bg-slate-50/50 dark:bg-slate-950/50">
            <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5">
              <Database className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Frequently Asked Questions</h2>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-0.5">Automated Intelligence Base</p>
            </div>
          </div>
          
          <div className="divide-y divide-slate-50 dark:divide-white/5">
            {loading ? (
              <div className="p-32 flex flex-col items-center justify-center space-y-4">
                <Activity size={40} className="text-blue-600 animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 animate-pulse">Synchronizing Data Base...</p>
              </div>
            ) : filteredFaqs.length > 0 ? (
              filteredFaqs.map((item) => (
                <FAQAccordion 
                  key={item.id} 
                  item={item} 
                  isOpen={openId === item.id} 
                  onToggle={() => setOpenId(openId === item.id ? null : item.id)}
                />
              ))
            ) : (
              <div className="p-20 text-center space-y-4">
                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto text-slate-300">
                  <Search size={32} />
                </div>
                <p className="text-slate-500 dark:text-slate-400 font-bold">No diagnostic matches found for your query.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FAQAccordion({ item, isOpen, onToggle }: { item: FAQItem, isOpen: boolean, onToggle: () => void }) {
  return (
    <div className={`transition-all duration-500 ${isOpen ? 'bg-blue-50/30 dark:bg-blue-900/5' : 'bg-transparent'}`}>
      <button 
        onClick={onToggle}
        className="w-full flex items-center justify-between p-8 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-all text-left group"
      >
        <div className="flex-1 pr-8">
          <span className="inline-block px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[8px] font-black uppercase tracking-widest mb-3">
            {item.category}
          </span>
          <h3 className={`font-black text-lg sm:text-xl tracking-tight transition-colors ${isOpen ? 'text-blue-600' : 'text-slate-800 dark:text-white group-hover:text-blue-600'}`}>
            {item.question}
          </h3>
        </div>
        <div className={`p-3 rounded-2xl transition-all duration-500 ${isOpen ? 'bg-blue-600 text-white rotate-180 shadow-lg shadow-blue-500/30' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:bg-blue-600 group-hover:text-white'}`}>
          <ChevronRight size={20} />
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
            className="overflow-hidden"
          >
            <div className="p-8 pt-0 space-y-6">
              <div className="space-y-4">
                <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed font-medium">
                  {item.answer}
                </p>
                
                {item.solution && (
                  <div className="bg-white dark:bg-slate-900/50 rounded-[32px] p-6 border border-blue-500/10 shadow-inner">
                    <div className="flex items-center gap-3 mb-3">
                      <Zap size={14} className="text-blue-600 fill-blue-600" />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">Recommended Solution</span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed italic">
                      {item.solution}
                    </p>
                  </div>
                )}
              </div>

              {item.actionLabel && (
                <a 
                  href={item.actionHref}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:opacity-90 transition-all shadow-xl shadow-slate-900/10"
                >
                  {item.actionLabel}
                  <ExternalLink size={14} />
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ContactCard({ icon, title, desc, color, href }: { icon: React.ReactNode, title: string, desc: string, color: string, href?: string }) {
  const Card = (
    <motion.div 
      whileHover={{ y: -8, scale: 1.02 }}
      className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-white/5 text-center shadow-sm hover:shadow-2xl hover:border-blue-500/30 transition-all cursor-pointer group h-full"
    >
      <div className={`w-16 h-16 rounded-[28px] flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-inner ${color}`}>
        {icon}
      </div>
      <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mb-2 uppercase">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 font-bold leading-relaxed">{desc}</p>
    </motion.div>
  );

  if (href) {
    return <a href={href}>{Card}</a>;
  }

  return Card;
}
