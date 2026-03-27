import React from 'react';
import { motion } from 'framer-motion';
import { TierCard } from './TierCard';

interface TierSelectionStepProps {
  role: string;
  onTierSelect: (tier: 'professional' | 'premium' | 'standard') => void;
}

export const TierSelectionStep: React.FC<TierSelectionStepProps> = ({ role, onTierSelect }) => {
  return (
    <motion.div
      key="tiers"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="grid grid-cols-1 md:grid-cols-2 gap-8"
    >
      <TierCard
        id={role === 'hospital' ? 'standard' : 'professional'}
        title={role === 'hospital' ? 'Standard Listing' : 'Professional Tier'}
        price={role === 'hospital' ? '$100' : '$20'}
        description="Verification for established medical experts."
        features={role === 'hospital' ? 
          ['Doctor Directory', 'Patient Reviews', 'Appointment Booking', 'Verified Badge'] :
          ['Verified Badge', 'Priority Directory Listing', 'Patient Inquiries', 'Profile Analytics']
        }
        onSelect={onTierSelect}
      />

      <TierCard
        id="premium"
        title="Premium Tier"
        price={role === 'hospital' ? '$300+' : '$100'}
        description="Ultimate clinical visibility and features."
        isPremium
        features={role === 'hospital' ? 
          ['Featured Placement', 'Advertising Banner', 'Video Promotion', 'Health Campaigns'] :
          ['Video Consultations', 'Appointment Booking', 'Featured Placement', 'Global Clinical Reach']
        }
        onSelect={onTierSelect}
      />
    </motion.div>
  );
};
