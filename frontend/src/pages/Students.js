import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { FaEdit, FaTrash, FaPlus, FaSpinner, FaExclamationTriangle, FaUserPlus } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

// ----------------------------------------------------------------------
// Service functions (unchanged)
// ----------------------------------------------------------------------
const PAGE_SIZE = 20;

async function fetchStudents(orgId, lastDoc = null) {
  const constraints = [
    where('orgId', '==', orgId),
    orderBy('createdAt', 'desc'),
    limit(PAGE_SIZE),
  ];
  if (lastDoc) constraints.push(startAfter(lastDoc));

  const q = query(collection(db, 'students'), ...constraints);
  const snapshot = await getDocs(q);
  const students = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  const lastVisible = snapshot.docs[snapshot.docs.length - 1];
  const hasMore = snapshot.docs.length === PAGE_SIZE;
  return { students, lastVisible, hasMore };
}

async function fetchCourses(orgId) {
  const q = query(
    collection(db, 'courses'),
    where('orgId', '==', orgId),
    orderBy('code', 'asc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

async function addStudent(orgId, data) {
  const docRef = await addDoc(collection(db, 'students'), {
    ...data,
    orgId,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

async function updateStudent(id, data) {
  await updateDoc(doc(db, 'students', id), data);
}

async function removeStudent(id) {
  await deleteDoc(doc(db, 'students', id));
}

// ----------------------------------------------------------------------
// Custom hook (unchanged)
// ----------------------------------------------------------------------
function useStudents(orgId) {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);

  const loadInitial = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [studentResult, coursesData] = await Promise.all([
        fetchStudents(orgId),
        fetchCourses(orgId),
      ]);
      setStudents(studentResult.students);
      setLastDoc(studentResult.lastVisible);
      setHasMore(studentResult.hasMore);
      setCourses(coursesData);
    } catch (err) {
      console.error(err);
      setError(err);
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    if (orgId) loadInitial();
  }, [loadInitial, orgId]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore) return;
    try {
      setLoadingMore(true);
      const { students: newStudents, lastVisible, hasMore: more } =
        await fetchStudents(orgId, lastDoc);
      setStudents((prev) => [...prev, ...newStudents]);
      setLastDoc(lastVisible);
      setHasMore(more);
    } catch (err) {
      toast.error('Failed to load more students');
    } finally {
      setLoadingMore(false);
    }
  }, [orgId, lastDoc, hasMore, loadingMore]);

  const add = async (data) => {
    try {
      await addStudent(orgId, data);
      toast.success('Student added');
      await loadInitial();
    } catch (err) {
      toast.error('Failed to add student');
      throw err;
    }
  };

  const update = async (id, data) => {
    try {
      await updateStudent(id, data);
      toast.success('Student updated');
      setStudents((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...data } : s))
      );
    } catch (err) {
      toast.error('Failed to update student');
      throw err;
    }
  };

  const remove = async (id) => {
    try {
      await removeStudent(id);
      toast.success('Student deleted');
      setStudents((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      toast.error('Failed to delete student');
      throw err;
    }
  };

  return {
    students,
    courses,
    loading,
    loadingMore,
    hasMore,
    error,
    loadMore,
    add,
    update,
    remove,
    refresh: loadInitial,
  };
}

// ----------------------------------------------------------------------
// Component
// ----------------------------------------------------------------------
const Students = () => {
  const { user } = useAuth();
  const orgId = user?.orgId;

  const {
    students,
    courses,
    loading,
    loadingMore,
    hasMore,
    error,
    loadMore,
    add,
    update,
    remove,
    refresh,
  } = useStudents(orgId);

  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    studentId: '',
    name: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    gender: 'Male',
    courseId: '',
    status: 'Active',
  });
  const [formErrors, setFormErrors] = useState({});

  const courseMap = useMemo(() => {
    const map = {};
    courses.forEach((c) => { map[c.id] = c.name; });
    return map;
  }, [courses]);

  const resetForm = () => {
    setFormData({
      studentId: '',
      name: '',
      email: '',
      phone: '',
      address: '',
      dateOfBirth: '',
      gender: 'Male',
      courseId: '',
      status: 'Active',
    });
    setFormErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.studentId.trim()) errors.studentId = 'Student ID is required.';
    if (!formData.name.trim()) errors.name = 'Full name is required.';
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'A valid email is required.';
    }
    if (!formData.phone.trim() || !/^\+?\d{7,15}$/.test(formData.phone)) {
      errors.phone = 'Enter a valid phone number.';
    }
    if (!formData.courseId) errors.courseId = 'Please select a course.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!orgId) return;
    if (!validateForm()) return;

    try {
      setSaving(true);
      if (editingStudent) {
        await update(editingStudent.id, formData);
      } else {
        await add(formData);
      }
      setShowModal(false);
      setEditingStudent(null);
      resetForm();
    } catch (err) {
      // error handled in service
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      studentId: student.studentId || '',
      name: student.name || '',
      email: student.email || '',
      phone: student.phone || '',
      address: student.address || '',
      dateOfBirth: student.dateOfBirth ? student.dateOfBirth.split('T')[0] : '',
      gender: student.gender || 'Male',
      courseId: student.courseId || '',
      status: student.status || 'Active',
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      await remove(id);
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
        <p className="text-sm text-neutral-600 mb-4">Failed to load students.</p>
        <button onClick={refresh} className="btn-primary">Retry</button>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active': return 'badge badge-success';
      case 'Inactive': return 'badge badge-warning';
      case 'Suspended': return 'badge badge-danger';
      default: return 'badge';
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="page-header">Students</h1>
          <p className="text-sm text-neutral-500 mt-1">Manage student records for your institute</p>
        </div>
        <button
          onClick={() => {
            setEditingStudent(null);
            resetForm();
            setShowModal(true);
          }}
          className="btn-primary inline-flex items-center"
        >
          <FaPlus className="mr-2" /> Add Student
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-md border border-neutral-200/60 overflow-hidden">
        <div className="table-container">
          <table className="min-w-full divide-y divide-neutral-100">
            <thead>
              <tr>
                <th className="table-header">Student ID</th>
                <th className="table-header">Name</th>
                <th className="table-header">Email</th>
                <th className="table-header">Phone</th>
                <th className="table-header">Course</th>
                <th className="table-header">Status</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <FaUserPlus className="mx-auto text-3xl text-neutral-200 mb-3" />
                    <p className="text-sm text-neutral-500">No students found. Add your first student.</p>
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="table-cell font-medium text-neutral-900">{student.studentId}</td>
                    <td className="table-cell">{student.name}</td>
                    <td className="table-cell text-neutral-600">{student.email}</td>
                    <td className="table-cell">{student.phone}</td>
                    <td className="table-cell">{courseMap[student.courseId] || '—'}</td>
                    <td className="table-cell">
                      <span className={getStatusBadge(student.status)}>{student.status}</span>
                    </td>
                    <td className="table-cell">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(student)}
                          className="p-1.5 rounded-lg text-primary-600 hover:bg-primary-50 transition-colors"
                          title="Edit student"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(student.id)}
                          className="p-1.5 rounded-lg text-danger-600 hover:bg-danger-50 transition-colors"
                          title="Delete student"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {hasMore && (
          <div className="flex justify-center py-4 border-t border-neutral-100">
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="btn-secondary inline-flex items-center"
            >
              {loadingMore ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Loading…
                </>
              ) : (
                'Load More'
              )}
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm"
              onClick={() => setShowModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-neutral-100 max-h-[85vh] overflow-y-auto"
            >
              <div className="p-6">
                <h2 className="text-xl font-semibold text-neutral-900 mb-5">
                  {editingStudent ? 'Edit Student' : 'Add New Student'}
                </h2>
                <form onSubmit={handleSubmit} noValidate>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="studentId" className="block text-sm font-medium text-neutral-700 mb-1.5">Student ID</label>
                      <input
                        id="studentId"
                        type="text"
                        name="studentId"
                        value={formData.studentId}
                        onChange={handleInputChange}
                        className={`w-full ${formErrors.studentId ? 'border-danger-500 focus:ring-danger-500' : ''}`}
                        required
                        aria-required="true"
                      />
                      {formErrors.studentId && <p className="text-danger-600 text-xs mt-1">{formErrors.studentId}</p>}
                    </div>
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-1.5">Full Name</label>
                      <input
                        id="name"
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={`w-full ${formErrors.name ? 'border-danger-500 focus:ring-danger-500' : ''}`}
                        required
                      />
                      {formErrors.name && <p className="text-danger-600 text-xs mt-1">{formErrors.name}</p>}
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1.5">Email</label>
                      <input
                        id="email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full ${formErrors.email ? 'border-danger-500 focus:ring-danger-500' : ''}`}
                        required
                      />
                      {formErrors.email && <p className="text-danger-600 text-xs mt-1">{formErrors.email}</p>}
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-neutral-700 mb-1.5">Phone</label>
                      <input
                        id="phone"
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={`w-full ${formErrors.phone ? 'border-danger-500 focus:ring-danger-500' : ''}`}
                        required
                      />
                      {formErrors.phone && <p className="text-danger-600 text-xs mt-1">{formErrors.phone}</p>}
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="address" className="block text-sm font-medium text-neutral-700 mb-1.5">Address</label>
                      <input
                        id="address"
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label htmlFor="dob" className="block text-sm font-medium text-neutral-700 mb-1.5">Date of Birth</label>
                      <input
                        id="dob"
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label htmlFor="gender" className="block text-sm font-medium text-neutral-700 mb-1.5">Gender</label>
                      <select
                        id="gender"
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        className="w-full"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="courseId" className="block text-sm font-medium text-neutral-700 mb-1.5">Course</label>
                      <select
                        id="courseId"
                        name="courseId"
                        value={formData.courseId}
                        onChange={handleInputChange}
                        className={`w-full ${formErrors.courseId ? 'border-danger-500 focus:ring-danger-500' : ''}`}
                        required
                      >
                        <option value="">Select Course</option>
                        {courses.map((course) => (
                          <option key={course.id} value={course.id}>
                            {course.name} ({course.code})
                          </option>
                        ))}
                      </select>
                      {formErrors.courseId && <p className="text-danger-600 text-xs mt-1">{formErrors.courseId}</p>}
                    </div>
                    <div>
                      <label htmlFor="status" className="block text-sm font-medium text-neutral-700 mb-1.5">Status</label>
                      <select
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="w-full"
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="Suspended">Suspended</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 mt-6 pt-5 border-t border-neutral-100">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="btn-primary inline-flex items-center"
                    >
                      {saving && <FaSpinner className="animate-spin mr-2" />}
                      {editingStudent ? 'Update' : 'Add'} Student
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Students;