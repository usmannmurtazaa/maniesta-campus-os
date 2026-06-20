import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { FaSpinner, FaExclamationTriangle, FaShieldAlt } from 'react-icons/fa';

const ROLES = ['admin', 'teacher', 'student'];

const RoleManagement = () => {
  const { user } = useAuth();
  const orgId = user?.orgId;
  const currentUserId = user?.uid;

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(null);

  const fetchMembers = async () => {
    if (!orgId) return;
    try {
      setLoading(true);
      setError(null);
      const q = query(collection(db, 'users'), where('orgId', '==', orgId));
      const snap = await getDocs(q);
      const users = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setMembers(users);
    } catch (err) {
      console.error(err);
      setError('Failed to load members.');
      toast.error('Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [orgId]);

  const handleRoleChange = async (userId, newRole) => {
    if (userId === currentUserId) {
      toast.error('You cannot change your own role.');
      return;
    }

    if (newRole === members.find((m) => m.id === userId)?.role) return;

    if (!window.confirm(`Are you sure you want to change this user's role to "${newRole}"?`)) {
      return;
    }

    setUpdating(userId);
    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole });
      setMembers((prev) =>
        prev.map((m) => (m.id === userId ? { ...m, role: newRole } : m))
      );
      toast.success('Role updated');
    } catch (err) {
      toast.error('Failed to update role');
    } finally {
      setUpdating(null);
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin': return 'badge badge-success';
      case 'teacher': return 'badge badge-warning';
      case 'student': return 'badge';
      default: return 'badge';
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
        <button onClick={fetchMembers} className="btn-primary">Retry</button>
      </div>
    );
  }

  return (
    <div>
      {/* Back navigation */}
      <div className="mb-4">
        <Link
          to={`/${orgId}/dashboard`}
          className="text-sm text-neutral-500 hover:text-neutral-700 transition-colors font-medium"
        >
          &larr; Back to Dashboard
        </Link>
      </div>

      <h1 className="page-header mb-6">Role Management</h1>

      <div className="bg-white rounded-xl shadow-md border border-neutral-200/60 overflow-hidden">
        <div className="table-container">
          <table className="min-w-full divide-y divide-neutral-100">
            <thead>
              <tr>
                <th className="table-header">User</th>
                <th className="table-header">Email</th>
                <th className="table-header">Current Role</th>
                <th className="table-header">Change Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {members.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center">
                    <FaShieldAlt className="mx-auto text-3xl text-neutral-200 mb-3" />
                    <p className="text-sm text-neutral-500">No members found.</p>
                  </td>
                </tr>
              ) : (
                members.map((member) => {
                  const isCurrentUser = member.id === currentUserId;
                  return (
                    <tr key={member.id} className="hover:bg-neutral-50/50 transition-colors">
                      <td className="table-cell font-medium text-neutral-900">
                        {member.displayName || 'User'}
                        {isCurrentUser && (
                          <span className="ml-2 text-xs text-neutral-400 font-normal">(you)</span>
                        )}
                      </td>
                      <td className="table-cell text-neutral-600">{member.email}</td>
                      <td className="table-cell">
                        <span className={getRoleBadge(member.role)}>{member.role}</span>
                      </td>
                      <td className="table-cell">
                        <select
                          value={member.role}
                          onChange={(e) => handleRoleChange(member.id, e.target.value)}
                          disabled={updating === member.id || isCurrentUser}
                          className="w-auto text-sm"
                          aria-label={`Change role for ${member.displayName || member.email}`}
                        >
                          {ROLES.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                        {updating === member.id && (
                          <FaSpinner className="animate-spin inline-block ml-2 text-neutral-400 text-xs" />
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RoleManagement;