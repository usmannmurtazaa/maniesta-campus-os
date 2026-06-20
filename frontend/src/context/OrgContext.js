import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from './AuthContext';

const OrgContext = createContext();

export const useOrg = () => useContext(OrgContext);

export const OrgProvider = ({ children }) => {
  const { user } = useAuth();
  const [org, setOrg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrg = useCallback(async () => {
    if (!user || !user.orgId) {
      setOrg(null);
      setError(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const snap = await getDoc(doc(db, 'organizations', user.orgId));
      if (snap.exists()) {
        setOrg({ id: snap.id, ...snap.data() });
      } else {
        setOrg(null);
      }
    } catch (err) {
      console.error('Failed to fetch organisation:', err);
      setError('Failed to load organisation details.');
      setOrg(null);
    } finally {
      setLoading(false);
    }
  }, [user?.orgId]); // only refetch when orgId changes

  useEffect(() => {
    fetchOrg();
  }, [fetchOrg]);

  // Memoize context value to prevent unnecessary re‑renders of consumers
  const value = useMemo(() => ({
    org,
    loading,
    error,
    refetch: fetchOrg,
  }), [org, loading, error, fetchOrg]);

  return <OrgContext.Provider value={value}>{children}</OrgContext.Provider>;
};