import { UserRole } from './user';

export interface OnboardingData {
  referralCode: string;
  firstName: string;
  lastName: string;
  username: string;
  phone: string;
  countryCode: string;
  city: string;
  state: string;
  country: string;
  countryIso: string;
  stateIso: string;
  ageRange: string;
  dateOfBirth: string;
  role: UserRole;
  tier: any;
  vipTier: any;
  verificationLevel: number;
  interests: string[];
  emailVerified: boolean;
  phoneVerified: boolean;
  kyc: {
    idNumber: string;
    idCardUrl: string;
    selfieUrl: string;
    passportPhotoUrl: string;
    dob: string;
    address: string;
  };
}

export const initialOnboardingData: OnboardingData = {
  referralCode: "",
  firstName: "",
  lastName: "",
  username: "",
  phone: "",
  countryCode: "+234",
  city: "",
  state: "",
  country: "",
  countryIso: "",
  stateIso: "",
  ageRange: "",
  dateOfBirth: "",
  role: "user",
  tier: "basic",
  vipTier: "basic",
  verificationLevel: 1,
  interests: [],
  emailVerified: false,
  phoneVerified: false,
  kyc: {
    idNumber: '',
    idCardUrl: '',
    selfieUrl: '',
    passportPhotoUrl: '',
    dob: '',
    address: '',
  },
};
