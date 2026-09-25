import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { doc, setDoc, serverTimestamp, collection } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const OrgSetup = () => {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [orgName, setOrgName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('create'); // 'create' | 'join'

  const handleCreateOrg = async e => {
    e.preventDefault();
    if (!orgName.trim()) {
      toast.error('Organisation name is required');
      return;
    }
    if (!user || !user.uid) {
      toast.error('User not authenticated');
      return;
    }

    setLoading(true);
    try {
      const orgRef = doc(collection(db, 'organizations'));
      const newOrgId = orgRef.id;

      // 1. Create the organisation document
      await setDoc(orgRef, {
        name: orgName.trim(),
        plan: 'free',
        createdAt: serverTimestamp(),
        studentCount: 0,
        courseCount: 0,
      });

      // 2. Create / update the user's profile to belong to this org as admin
      await setDoc(
        doc(db, 'users', user.uid),
        {
          orgId: newOrgId,
          role: 'admin',
          email: user.email,
          displayName: user.displayName || user.email?.split('@')[0],
          avatarURL: user.photoURL || null,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      // 3. Refresh the profile in AuthContext
      await refreshProfile();

      toast.success('Organisation created successfully!');
      navigate(`/${newOrgId}/dashboard`, { replace: true });
    } catch (error) {
      console.error('Org creation error:', error);
      toast.error('Failed to create organisation');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinOrg = e => {
    e.preventDefault();
    if (!joinCode.trim()) {
      toast.error('Invite code is required');
      return;
    }
    toast.error('Joining via invite code is not yet available. Please ask your admin to add you.');
  };

  return (
    <div className="min-h-screen bg-surface-subtle flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        <div className="bg-surface rounded-2xl shadow-2xl ring-1 ring-border p-6 sm:p-8">
          {/* Back link */}
          <div className="mb-5">
            <Link
              to="/login"
              className="inline-flex items-center text-sm text-content-muted hover:text-content-primary transition-colors duration-200 font-medium rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
            >
              &larr; Back to Login
            </Link>
          </div>

          <h1 className="text-2xl font-bold text-content-primary mb-1 tracking-tight">
            Set Up Your Organisation
          </h1>
          <p className="text-sm text-content-muted mb-6">
            Create a new campus or join an existing one.
          </p>

          {/* Mode toggle */}
          <div className="flex mb-6 p-1 bg-surface-muted rounded-lg">
            <button
              type="button"
              onClick={() => setMode('create')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 ${
                mode === 'create'
                  ? 'bg-surface text-content-primary shadow-sm'
                  : 'text-content-muted hover:text-content-primary'
              }`}
            >
              Create New
            </button>
            <button
              type="button"
              onClick={() => setMode('join')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 ${
                mode === 'join'
                  ? 'bg-surface text-content-primary shadow-sm'
                  : 'text-content-muted hover:text-content-primary'
              }`}
            >
              Join Existing
            </button>
          </div>

          {mode === 'create' ? (
            <form onSubmit={handleCreateOrg}>
              <div className="mb-4">
                <label
                  htmlFor="org-name"
                  className="block text-sm font-medium text-content-primary mb-1.5"
                >
                  Organisation Name
                </label>
                <input
                  id="org-name"
                  type="text"
                  value={orgName}
                  onChange={e => setOrgName(e.target.value)}
                  className="input"
                  placeholder="e.g., ABC Academy"
                  required
                  aria-required="true"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-2.5 text-sm font-semibold"
              >
                {loading ? 'Creating...' : 'Create Organisation'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleJoinOrg}>
              <div className="mb-4">
                <label
                  htmlFor="invite-code"
                  className="block text-sm font-medium text-content-primary mb-1.5"
                >
                  Invite Code
                </label>
                <input
                  id="invite-code"
                  type="text"
                  value={joinCode}
                  onChange={e => setJoinCode(e.target.value)}
                  className="input"
                  placeholder="Enter code provided by admin"
                  required
                  aria-required="true"
                />
              </div>
              <p className="text-xs text-content-muted mb-3">
                Joining via invite code will be available soon. For now, your admin can add you
                directly.
              </p>
              <button
                type="submit"
                disabled
                className="w-full py-2.5 rounded-lg text-sm font-medium bg-surface-muted text-content-disabled cursor-not-allowed"
              >
                Join Organisation (Coming Soon)
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default OrgSetup;
