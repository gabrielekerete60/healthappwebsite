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
    let isEmailOk = formData.emailVerified;
    let isPhoneOk = formData.phoneVerified;

    try {
      const syncResult = await userService.syncVerificationStatus();
      if (syncResult) {
        isEmailOk = syncResult.emailVerified;
        isPhoneOk = syncResult.phoneVerified;
        
        setFormData(prev => ({
          ...prev,
          emailVerified: isEmailOk,
          phoneVerified: isPhoneOk
        }));
      }
    } catch (e) {
      console.warn("Final sync attempt failed", e);
    }

    const errors = [];
    if (!isEmailOk) errors.push("Please verify your email address.");
    if (formData.role !== 'user' && !isPhoneOk) {
      errors.push("Please verify your phone number.");
    }
    
    if (errors.length > 0) {
      setFieldErrors(errors);
      return false;
    }
    return true;
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
    toggleInterest,
    allCountries,
    allStates,
    allCities
  };
};
