export interface Institution {
  id: string;
  name: string;
  type: 'Hospital' | 'University' | 'NGO' | 'Clinic';
  location: string;
  description: string;
  logoUrl?: string;
  coverUrl?: string;
  website?: string;
  verified: boolean;
  verificationStatus: 'unverified' | 'pending' | 'verified' | 'rejected';
  permitUrl?: string;
  contactNodes: {
    id: string;
    label: string; // e.g., 'Emergency Node', 'Pharmacy Node'
    phone: string;
    email?: string;
    available24h: boolean;
  }[];
  departments: {
    id: string;
    name: string;
    description?: string;
    headExpertId?: string; // UID of the department head
  }[];
  specialties: string[];
  featured: boolean; // Stage 4: Featured Placement
  promotionConfig?: {
    region: string;
    priority: number; // 1-10
    expiresAt: string;
  };
  stats: {
    experts: number;
    publications: number;
    followers: number;
  };
  library?: {
    id: string;
    title: string;
    description: string;
    isPremium: boolean;
    resources: {
      id: string;
      title: string;
      type: 'PDF' | 'Video' | 'Protocol';
      url: string;
    }[];
  }[];
}
