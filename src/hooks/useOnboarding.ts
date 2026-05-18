'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { auth } from '@/lib/firebase';
import { updateProfile } from 'firebase/auth';
import { referralService } from '@/services/referralService';
import { userService } from '@/services/userService';
import { useOnboardingValidation } from './useOnboardingValidation';
import { useOnboardingLocation } from './useOnboardingLocation';
import { useOnboardingPersistence } from './useOnboardingPersistence';
import { initialOnboardingData, OnboardingData } from '@/types/onboarding';

export const useOnboarding = () => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<string[]>([]);
  
  const [formData, setFormData] = useState<OnboardingData>(initialOnboardingData);

  const { validationStatus, setValidationStatus } = useOnboardingValidation(formData);

  const { allCountries, allStates, allCities } = useOnboardingLocation(
    formData.countryIso, 
    formData.stateIso
  );

  const { initializing, saveProgressToFirestore } = useOnboardingPersistence(
    step,
    setStep,
    formData,
    setFormData,
    setFieldErrors
  );

  const handleStep1Referral = async () => {
    if (formData.referralCode.trim() !== "") {
      setValidationStatus(prev => ({ ...prev, referral: "validating", referralError: "" }));
      try {
        const referrerUid = await referralService.validateReferralCode(formData.referralCode);
        if (referrerUid) {
          setValidationStatus(prev => ({ ...prev, referral: "valid" }));
          if (auth.currentUser) {
            await referralService.applyReferralCode(formData.referralCode, referrerUid, auth.currentUser.uid, auth.currentUser.email);
          }
        } else {
          setValidationStatus(prev => ({ ...prev, referral: "invalid", referralError: "Invalid referral code" }));
          setFieldErrors(["Please enter a valid referral code or leave it blank."]);
          return false;
        }
      } catch (e: any) {
        if (e.message === "limit-reached") {
          setValidationStatus(prev => ({ ...prev, referral: "invalid", referralError: "Referral limit reached" }));
          setFieldErrors(["This referral code has already reached its usage limit."]);
        } else {
          setValidationStatus(prev => ({ ...prev, referral: "idle", referralError: "Error validating code" }));
          setFieldErrors(["Please check your network and try again."]);
        }
        return false;
      }
    }
    return true;
  };

  const handleStep2Identity = () => {
    const errors = [];
    if (!formData.firstName) errors.push("First name is required.");
    if (!formData.lastName) errors.push("Last name is required.");
    if (!formData.username) errors.push("Username is required.");
    if (!formData.phone) errors.push("Phone number is required.");
    if (!formData.ageRange) errors.push("Age range is required.");
    
    if (validationStatus.username === 'taken') errors.push("Username is already taken.");
    if (validationStatus.phone === 'taken') errors.push("Phone number is already taken.");
    if (validationStatus.name === 'taken') errors.push("This name is already registered.");
    if (validationStatus.name === 'invalid') errors.push("Names can only contain letters and hyphens (-).");

    if (errors.length > 0) {
      setFieldErrors(errors);
      return false;
    }
    return true;
  };

  const handleStep3Security = async () => {
    setIsLoading(true);
    setFieldErrors([]);

    try {
      // 1. FORCE RELOAD Firebase Auth (to keep things synced)
      if (auth.currentUser) {
        await auth.currentUser.reload();
      }
      
      // 2. SYNC with Backend (The strict gatekeeper)
      const syncResult = await userService.syncVerificationStatus();
      
      if (!syncResult) {
        setFieldErrors(["Unable to verify status. Please check your connection."]);
        return false;
      }

      // Check Email (This now ignores the 'verified' status from Google)
      if (!syncResult.emailVerified) {
        setFieldErrors(["Your email is NOT verified in our protocol. Even if using Google, you must verify to proceed."]);
        return false;
      }

      // Check Phone for Experts/Hospitals
      if (formData.role !== 'user' && !syncResult.phoneVerified) {
        setFieldErrors(["Phone verification is required for experts and hospitals."]);
        return false;
      }
      
      // Sync local state
      setFormData(prev => ({
        ...prev,
        emailVerified: true,
        phoneVerified: syncResult.phoneVerified
      }));

      return true; // SUCCESS
    } catch (e) {
      console.error("Security sync error:", e);
      setFieldErrors(["Verification failed. Please ensure you've entered the correct code."]);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshVerification = async () => {
    setIsLoading(true);
    setFieldErrors([]);
    try {
      // Force reload user to get latest verification status
      if (auth.currentUser) {
        await auth.currentUser.reload();
      }
      
      const syncResult = await userService.syncVerificationStatus();
      if (syncResult) {
        setFormData(prev => ({
          ...prev,
          emailVerified: syncResult.emailVerified,
          phoneVerified: syncResult.phoneVerified
        }));
        
        if (syncResult.emailVerified && (formData.role === 'user' || syncResult.phoneVerified)) {
          return true; // All clear
        }
      }
      return false;
    } catch (e) {
      setFieldErrors(["Failed to sync verification status. Please try again."]);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep4Location = () => {
    const errors = [];
    if (!formData.city) errors.push("City is required.");
    if (!formData.state) errors.push("State/Province is required.");
    if (!formData.country) errors.push("Country is required.");
    
    if (errors.length > 0) {
      setFieldErrors(errors);
      return false;
    }
    return true;
  };

  const handleNext = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setFieldErrors([]);
    
    try {
      if (step === 1) {
        if (await handleStep1Referral()) await saveAndGoTo(2);
      } else if (step === 2) {
        if (handleStep2Identity()) await saveAndGoTo(3);
      } else if (step === 3) {
        if (await handleStep3Security()) await saveAndGoTo(4);
      } else if (step === 4) {
        if (handleStep4Location()) await saveAndGoTo(5);
      } else if (step === 5) {
        if (!formData.role) {
          setFieldErrors(["Please select your platform role."]);
        } else if (formData.role === 'hospital') {
          await completeOnboarding(); 
        } else {
          await saveAndGoTo(6);
        }
      } else if (step === 6) {
        await completeOnboarding();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const saveAndGoTo = async (nextStep: number) => {
    await saveProgressToFirestore(nextStep);
    setStep(nextStep);
  };

  const completeOnboarding = async () => {
    setIsLoading(true);
    try {
      if (auth.currentUser) {
        await Promise.all([
          updateProfile(auth.currentUser, { displayName: `${formData.firstName} ${formData.lastName}` }),
          userService.completeOnboarding(formData),
          referralService.completeReferral(auth.currentUser.uid)
        ]);

        localStorage.removeItem('onboarding_data');
        router.push(formData.role === 'user' ? '/' : '/expert/dashboard');
      }
    } catch (err) {
      console.error("Failed to complete onboarding:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      if (step === 1) {
        router.push('/auth/signup');
      } else {
        await saveAndGoTo(step - 1);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const reloadCurrentStep = async () => {
    setIsLoading(true);
    try {
      if (auth.currentUser) {
        const profile = await userService.getUserProfile(auth.currentUser.uid);
        if (profile) {
          setFormData(prev => ({
            ...prev,
            firstName: profile.firstName || prev.firstName,
            lastName: profile.lastName || prev.lastName,
            username: profile.username || prev.username,
            phone: profile.phone?.replace(profile.countryCode || '', '') || prev.phone,
            countryCode: profile.countryCode || prev.countryCode,
            city: profile.city || prev.city,
            state: profile.state || prev.state,
            country: profile.country || prev.country,
            countryIso: profile.countryIso || prev.countryIso,
            stateIso: profile.stateIso || prev.stateIso,
            ageRange: profile.ageRange || prev.ageRange,
            dateOfBirth: profile.dateOfBirth || prev.dateOfBirth,
            interests: profile.interests || prev.interests,
            emailVerified: profile.emailVerified || false,
            phoneVerified: profile.phoneVerified || false,
            role: profile.role || prev.role,
          }));
        }
      }
    } catch (e) {
      console.error("Failed to reload step data:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleInterest = (topic: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(topic) ? prev.interests.filter(i => i !== topic) : [...prev.interests, topic]
    }));
  };

  return {
    step,
    setStep,
    isLoading,
    initializing,
    validationStatus,
    fieldErrors,
    formData,
    setFormData,
    handleNext,
    handleBack,
    refreshVerification,
    reloadCurrentStep,
    toggleInterest,
    allCountries,
    allStates,
    allCities
  };
};
