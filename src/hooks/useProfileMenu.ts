'use client';

import { useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { userService } from '@/services/userService';
import { deleteAccount } from '@/services/dataService';
import { useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function useProfileMenu() {
  const t = useTranslations('profile.menu');
  const [processing, setProcessing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const router = useRouter();

  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    type: 'success' | 'warning' | 'info' | 'upgrade';
    onConfirm?: () => void;
    confirmText?: string;
    isPopup?: boolean;
    features?: string[];
  }>({
    isOpen: false,
    title: '',
    description: '',
    type: 'info',
    isPopup: false,
    features: []
  });

  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {}
  });

  const showAlert = (title: string, description: string, type: 'info' | 'warning' | 'success' | 'upgrade' = 'info', onConfirm?: () => void, confirmText?: string, isPopup?: boolean, features?: string[]) => {
    setModalConfig({
      isOpen: true,
      title,
      description,
      type,
      onConfirm,
      confirmText,
      isPopup,
      features
    });
  };

  const showConfirm = (title: string, description: string, onConfirm: () => void) => {
    setConfirmConfig({
      isOpen: true,
      title,
      description,
      onConfirm
    });
  };

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/');
  };

  const handleExport = async () => {
    if (!auth.currentUser) return;
    setExporting(true);
    try {
      const data = await userService.getUserProfile(auth.currentUser.uid);
      if (!data) throw new Error("No data found");
      
      const doc = new jsPDF();
      doc.setFontSize(22);
      doc.text("Ikike Health Analytics", 14, 20);
      doc.setFontSize(14);
      doc.text("Clinical Profile Report", 14, 30);
      
      const pData = [
        ['ID', auth.currentUser.uid],
        ['Name', data.fullName || ''],
        ['Email', data.email || ''],
        ['Phone', data.phone || ''],
        ['Location', `${data.city || ''}, ${data.country || ''}`],
        ['Role', data.role || 'user'],
        ['Tier', data.tier || 'basic']
      ];
      
      autoTable(doc, {
        startY: 40,
        head: [['Field', 'Data']],
        body: pData,
        theme: 'grid',
        headStyles: { fillColor: [37, 99, 235] }
      });
      
      doc.save(`ikike_clinical_report_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error(error);
      showAlert('Export Failed', 'Failed to export data', 'warning');
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async () => {
    showConfirm(
      "Terminate Account",
      t('deleteConfirm') || "Are you sure you want to permanently delete your account and all associated health records? This action is irreversible.",
      async () => {
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        setProcessing(true);
        try {
          await deleteAccount();
          await signOut(auth);
          router.push('/');
        } catch (error) {
          console.error(error);
          showAlert('Error', 'Failed to delete account', 'warning');
        } finally {
          setProcessing(false);
        }
      }
    );
  };

  return {
    t,
    processing,
    exporting,
    modalConfig,
    setModalConfig,
    confirmConfig,
    setConfirmConfig,
    handleSignOut,
    handleExport,
    handleDelete,
    showAlert
  };
}
