import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { FaSpinner, FaExclamationTriangle } from 'react-icons/fa';

const AdminSettings = () => {
  const { user } = useAuth();
  const orgId = user?.orgId;

  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchOrg = async () => {
    if (!orgId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const snap = await getDoc(doc(db, 'organizations', orgId));
      if (snap.exists()) {
        setName(snap.data().name || '');
      } else {
        setError('Organisation not found.');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load organisation settings.');
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrg();
  }, [orgId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error('Institute name cannot be empty.');
      return;
    }

    setSaving(true);
    try {
      await updateDoc(doc(db, 'organizations', orgId), {
        name: trimmed,
        updatedAt: serverTimestamp(),
      });
      toast.success('Settings saved');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-neutral-200 border-t-primary-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-12 h-12 rounded-full bg-danger-50 flex items-center justify-center mb-4">
          <FaExclamationTriangle className="text-danger-600 text-xl" />
        </div>
        <p className="text-sm text-neutral-600 mb-4">{error}</p>
        <button onClick={fetchOrg} className="btn-primary">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Back to dashboard */}
      <div className="mb-4">
        <Link
          to={`/${orgId}/dashboard`}
          className="text-sm text-neutral-500 hover:text-neutral-700 transition-colors font-medium"
        >
          &larr; Back to Dashboard
        </Link>
      </div>

      <h1 className="page-header mb-6">Organisation Settings</h1>

      <div className="stat-card max-w-xl">
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <div>
            <label htmlFor="org-name" className="block text-sm font-medium text-neutral-700 mb-1.5">
              Institute Name
            </label>
            <input
              id="org-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full"
              required
              aria-required="true"
              placeholder="Enter institute name"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="btn-primary inline-flex items-center"
          >
            {saving ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminSettings;