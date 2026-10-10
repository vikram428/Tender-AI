/**
 * TenderAI Context State Management
 * Connects directly to Cloud Firestore with strict user isolation (ownerUid)
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../services/firebase';
import { useAuth } from './AuthContext';
import { TenderDocument, BOQItem, AppSettings } from '../types/tender';
import { DEFAULT_SETTINGS } from '../data/sampleTenders';

export type AppPage = 
  | 'dashboard'
  | 'upload'
  | 'analysis'
  | 'boq'
  | 'estimator'
  | 'deadlines'
  | 'clauses'
  | 'search'
  | 'comparison'
  | 'drafts'
  | 'reports'
  | 'settings';

interface NotificationState {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface TenderContextType {
  currentPage: AppPage;
  setCurrentPage: (page: AppPage) => void;
  tenders: TenderDocument[];
  activeTenderId: string;
  activeTender: TenderDocument | null;
  setActiveTenderId: (id: string) => void;
  loadingTenders: boolean;
  addTender: (newTender: Omit<TenderDocument, 'ownerUid'>) => Promise<void>;
  updateTender: (updatedTender: TenderDocument) => Promise<void>;
  deleteTender: (id: string) => Promise<void>;
  addBOQItem: (tenderId: string, item: Omit<BOQItem, 'id' | 'totalAmount'>) => Promise<void>;
  updateBOQItem: (tenderId: string, item: BOQItem) => Promise<void>;
  deleteBOQItem: (tenderId: string, itemId: string) => Promise<void>;
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
  comparisonSelectedIds: string[];
  toggleComparisonTender: (id: string) => void;
  notification: NotificationState | null;
  showNotification: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  clearNotification: () => void;
}

const TenderContext = createContext<TenderContextType | undefined>(undefined);

export const TenderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState<AppPage>('dashboard');
  
  // Real Firestore user-specific state - initially empty
  const [tenders, setTenders] = useState<TenderDocument[]>([]);
  const [loadingTenders, setLoadingTenders] = useState<boolean>(true);
  const [activeTenderId, setActiveTenderId] = useState<string>('');

  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [comparisonSelectedIds, setComparisonSelectedIds] = useState<string[]>([]);
  const [notification, setNotification] = useState<NotificationState | null>(null);

  const showNotification = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info') => {
    setNotification({
      id: Math.random().toString(36).substring(2, 9),
      message,
      type
    });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  const clearNotification = () => setNotification(null);

  // Firestore Sync: Load strictly authenticated user's tenders
  useEffect(() => {
    if (!user) {
      setTenders([]);
      setActiveTenderId('');
      setLoadingTenders(false);
      return;
    }

    setLoadingTenders(true);
    const tendersRef = collection(db, 'tenders');
    // Critical: Scope query strictly to ownerUid == user.uid
    const q = query(tendersRef, where('ownerUid', '==', user.uid));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const loaded: TenderDocument[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as TenderDocument;
          loaded.push({
            ...data,
            id: docSnap.id
          });
        });

        setTenders(loaded);
        setLoadingTenders(false);

        // Update active tender ID if current one is invalid
        setActiveTenderId((prev) => {
          if (prev && loaded.some((t) => t.id === prev)) {
            return prev;
          }
          return loaded[0]?.id || '';
        });
      },
      (error) => {
        setLoadingTenders(false);
        showNotification('Failed to sync tenders from Firestore.', 'error');
        handleFirestoreError(error, OperationType.LIST, 'tenders');
      }
    );

    // Sync user settings from /users/{uid}
    const userDocRef = doc(db, 'users', user.uid);
    getDoc(userDocRef)
      .then((docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.settings) {
            setSettings((prev) => ({ ...prev, ...data.settings }));
          }
        } else {
          // Initialize user profile in Firestore
          setDoc(userDocRef, {
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || '',
            organizationName: DEFAULT_SETTINGS.organizationName,
            settings: DEFAULT_SETTINGS,
            createdAt: new Date().toISOString()
          }).catch((err) => {
            console.error('Error creating user profile in Firestore:', err);
          });
        }
      })
      .catch((err) => {
        handleFirestoreError(err, OperationType.GET, `users/${user.uid}`);
      });

    return () => unsubscribe();
  }, [user]);

  const activeTender = tenders.find((t) => t.id === activeTenderId) || tenders[0] || null;

  // Add new tender with ownerUid to Firestore
  const addTender = async (newTenderData: Omit<TenderDocument, 'ownerUid'>) => {
    if (!user) {
      showNotification('Authentication required to upload tenders.', 'error');
      return;
    }

    const tenderWithAuth: TenderDocument = {
      ...newTenderData,
      ownerUid: user.uid,
      uploadedAt: new Date().toISOString().split('T')[0]
    };

    const targetDocRef = doc(db, 'tenders', tenderWithAuth.id);
    try {
      await setDoc(targetDocRef, {
        ...tenderWithAuth,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      setActiveTenderId(tenderWithAuth.id);
      showNotification(`Tender "${tenderWithAuth.nitNumber}" saved to your private workspace.`, 'success');
    } catch (err: any) {
      showNotification('Failed to save tender to Firestore.', 'error');
      handleFirestoreError(err, OperationType.CREATE, `tenders/${tenderWithAuth.id}`);
    }
  };

  // Update existing tender in Firestore
  const updateTender = async (updatedTender: TenderDocument) => {
    if (!user) return;
    if (updatedTender.ownerUid !== user.uid) {
      showNotification('Permission denied: You do not own this tender record.', 'error');
      return;
    }

    const targetDocRef = doc(db, 'tenders', updatedTender.id);
    try {
      await updateDoc(targetDocRef, {
        ...updatedTender,
        updatedAt: new Date().toISOString()
      });
      showNotification(`Tender ${updatedTender.nitNumber} updated.`, 'success');
    } catch (err: any) {
      showNotification('Failed to update tender in database.', 'error');
      handleFirestoreError(err, OperationType.UPDATE, `tenders/${updatedTender.id}`);
    }
  };

  // Delete tender from Firestore
  const deleteTender = async (id: string) => {
    if (!user) return;
    const targetDocRef = doc(db, 'tenders', id);
    try {
      await deleteDoc(targetDocRef);
      showNotification('Tender document removed from your workspace.', 'info');
    } catch (err: any) {
      showNotification('Failed to delete tender record.', 'error');
      handleFirestoreError(err, OperationType.DELETE, `tenders/${id}`);
    }
  };

  const addBOQItem = async (tenderId: string, itemData: Omit<BOQItem, 'id' | 'totalAmount'>) => {
    const targetTender = tenders.find((t) => t.id === tenderId);
    if (!targetTender) return;

    const newItem: BOQItem = {
      ...itemData,
      id: `boq-${Date.now()}`,
      totalAmount: itemData.quantity * itemData.estimatedRate
    };

    const updatedBOQ = [...targetTender.boqItems, newItem];
    await updateTender({
      ...targetTender,
      boqItems: updatedBOQ
    });
  };

  const updateBOQItem = async (tenderId: string, item: BOQItem) => {
    const targetTender = tenders.find((t) => t.id === tenderId);
    if (!targetTender) return;

    const recalculatedItem: BOQItem = {
      ...item,
      totalAmount: item.quantity * item.estimatedRate
    };

    const updatedBOQ = targetTender.boqItems.map((b) => b.id === item.id ? recalculatedItem : b);
    await updateTender({
      ...targetTender,
      boqItems: updatedBOQ
    });
  };

  const deleteBOQItem = async (tenderId: string, itemId: string) => {
    const targetTender = tenders.find((t) => t.id === tenderId);
    if (!targetTender) return;

    const updatedBOQ = targetTender.boqItems.filter((b) => b.id !== itemId);
    await updateTender({
      ...targetTender,
      boqItems: updatedBOQ
    });
  };

  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);

    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      try {
        await updateDoc(userDocRef, {
          settings: updated,
          organizationName: updated.organizationName,
          updatedAt: new Date().toISOString()
        });
        showNotification('Settings saved to your cloud profile.', 'success');
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
      }
    }
  };

  const toggleComparisonTender = (id: string) => {
    setComparisonSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      } else {
        if (prev.length >= 4) {
          showNotification('Maximum 4 tenders can be compared simultaneously.', 'warning');
          return prev;
        }
        return [...prev, id];
      }
    });
  };

  return (
    <TenderContext.Provider value={{
      currentPage,
      setCurrentPage,
      tenders,
      activeTenderId,
      activeTender,
      setActiveTenderId,
      loadingTenders,
      addTender,
      updateTender,
      deleteTender,
      addBOQItem,
      updateBOQItem,
      deleteBOQItem,
      settings,
      updateSettings,
      comparisonSelectedIds,
      toggleComparisonTender,
      notification,
      showNotification,
      clearNotification
    }}>
      {children}
    </TenderContext.Provider>
  );
};

export function useTender() {
  const context = useContext(TenderContext);
  if (!context) {
    throw new Error('useTender must be used within a TenderProvider');
  }
  return context;
}
