import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { FaSpinner, FaSyncAlt, FaExclamationTriangle, FaHistory } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const PAGE_SIZE = 20;

const AuditLogs = () => {
  const { user } = useAuth();
  const orgId = user?.orgId;

  const [logs, setLogs] = useState([]);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  const fetchLogs = useCallback(
    async (afterDoc = null) => {
      const constraints = [
        where('orgId', '==', orgId),
        orderBy('timestamp', 'desc'),
        limit(PAGE_SIZE),
      ];
      if (afterDoc) constraints.push(startAfter(afterDoc));

      const q = query(collection(db, 'auditLogs'), ...constraints);
      const snap = await getDocs(q);
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      return {
        docs,
        lastVisible: snap.docs[snap.docs.length - 1],
        hasMore: snap.docs.length === PAGE_SIZE,
      };
    },
    [orgId]
  );

  const loadInitial = useCallback(async () => {
    if (!orgId) return;
    setLoading(true);
    setError(null);
    try {
      const { docs, lastVisible, hasMore } = await fetchLogs();
      setLogs(docs);
      setLastDoc(lastVisible);
      setHasMore(hasMore);
    } catch (err) {
      console.error(err);
      setError('Failed to load audit logs.');
      toast.error('Failed to load logs');
    } finally {
      setLoading(false);
    }
  }, [orgId, fetchLogs]);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  const loadMore = async () => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    try {
      const { docs, lastVisible, hasMore: more } = await fetchLogs(lastDoc);
      setLogs((prev) => [...prev, ...docs]);
      setLastDoc(lastVisible);
      setHasMore(more);
    } catch (err) {
      toast.error('Failed to load more logs');
    } finally {
      setLoadingMore(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '—';
    if (timestamp.seconds != null) {
      return new Date(timestamp.seconds * 1000).toLocaleString();
    }
    try {
      return new Date(timestamp).toLocaleString();
    } catch {
      return 'Invalid date';
    }
  };

  const summarizeDetails = (details) => {
    if (!details) return '—';
    if (typeof details === 'object') {
      if (details.resource) return `Resource: ${details.resource}`;
      if (details.updated) return `Updated: ${Object.keys(details.updated).join(', ')}`;
      const keys = Object.keys(details);
      return keys.length ? `Keys: ${keys.join(', ')}` : '—';
    }
    return String(details).slice(0, 80);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <div className="mb-1">
            <Link
              to={`/${orgId}/dashboard`}
              className="text-sm text-neutral-500 hover:text-neutral-700 transition-colors font-medium"
            >
              &larr; Back to Dashboard
            </Link>
          </div>
          <h1 className="page-header">Audit Logs</h1>
        </div>
        <button
          onClick={loadInitial}
          disabled={loading}
          className="btn-secondary inline-flex items-center"
          aria-label="Refresh audit logs"
        >
          <FaSyncAlt className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow-md border border-neutral-200/60 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-neutral-200 border-t-primary-600" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-12 h-12 rounded-full bg-danger-50 flex items-center justify-center mb-4">
              <FaExclamationTriangle className="text-danger-600 text-xl" />
            </div>
            <p className="text-sm text-neutral-600 mb-4">{error}</p>
            <button onClick={loadInitial} className="btn-primary">
              Retry
            </button>
          </div>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center">
            <FaHistory className="mx-auto text-3xl text-neutral-200 mb-3" />
            <p className="text-sm text-neutral-500">No audit logs yet.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="min-w-full divide-y divide-neutral-100">
              <thead>
                <tr>
                  <th className="table-header">Action</th>
                  <th className="table-header">User ID</th>
                  <th className="table-header">Details</th>
                  <th className="table-header">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="table-cell font-medium text-neutral-900 capitalize">
                      {log.action}
                    </td>
                    <td className="table-cell text-sm font-mono text-neutral-600">
                      {log.userId}
                    </td>
                    <td className="table-cell text-sm text-neutral-500">
                      {summarizeDetails(log.details)}
                    </td>
                    <td className="table-cell text-sm text-neutral-500">
                      {formatTimestamp(log.timestamp)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {hasMore && !loading && (
          <div className="flex justify-center py-4 border-t border-neutral-100">
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="btn-secondary inline-flex items-center"
            >
              {loadingMore ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Loading...
                </>
              ) : (
                'Load More'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogs;