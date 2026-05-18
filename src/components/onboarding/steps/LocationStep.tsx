'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Globe, Building } from 'lucide-react';
import CustomSelect from '@/components/common/CustomSelect';
import { BaseInput } from '@/components/common/BaseInput';
import { useLanguage } from '@/context/LanguageContext';

import { FormFieldWrapper } from '../FormFieldWrapper';

interface LocationStepProps {
  formData: any;
  setFormData: (data: any) => void;
  countries: any[];
  allStates?: any[];
}

export default function LocationStep({ formData, setFormData, countries, allStates = [] }: LocationStepProps) {
  const { t } = useLanguage();

  const countryOptions = countries.map(c => ({
    value: c.iso2,
    label: `${c.emoji} ${c.name}`
  }));

  const stateOptions = allStates.map(s => ({
    value: s.iso2,
    label: s.name
  }));

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8 sm:space-y-10">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest border border-blue-100 dark:border-blue-800">
          Step 4: Location
        </div>
        <h3 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">Your Base of Operations</h3>
        <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-lg">
          Help us connect you with local health networks and community members.
        </p>
      </div>

      <div className="bg-slate-50/50 dark:bg-slate-800/50 rounded-[32px] sm:rounded-[40px] border border-slate-100 dark:border-slate-700 p-6 sm:p-10 pb-32 sm:pb-40 shadow-sm space-y-10 transition-colors duration-500 min-h-[700px]">
        {/* Manual Inputs */}
        <div className="space-y-8">
          <FormFieldWrapper label="Country" icon={<Globe size={14} />} isRequired>
            <CustomSelect
              options={countryOptions}
              value={formData.countryIso}
              onChange={(val) => {
                const c = countries.find(c => c.iso2 === val);
                setFormData({
                  ...formData, 
                  country: c?.name || '', 
                  countryIso: val,
                  state: '',
                  stateIso: '',
                  city: ''
                });
              }}
              placeholder="Select Country"
              className="!rounded-[20px]"
            />
          </FormFieldWrapper>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <FormFieldWrapper label="State / Province" icon={<MapPin size={14} />} isRequired>
              <CustomSelect
                options={stateOptions}
                value={formData.stateIso}
                disabled={!formData.countryIso}
                onChange={(val) => {
                  const s = allStates.find(s => s.iso2 === val);
                  setFormData({
                    ...formData, 
                    state: s?.name || '', 
                    stateIso: val,
                    city: ''
                  });
                }}
                placeholder={formData.countryIso ? "Select State" : "Select Country first"}
                className="!rounded-[20px]"
              />
            </FormFieldWrapper>

            <FormFieldWrapper label="City" icon={<Building size={14} />} isRequired>
              <BaseInput
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
                placeholder="Enter your city"
                disabled={!formData.stateIso}
                className="!rounded-[20px]"
              />
            </FormFieldWrapper>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
