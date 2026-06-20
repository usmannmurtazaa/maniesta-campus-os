import React, { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { FaEdit, FaTrash, FaPlus, FaSpinner, FaExclamationTriangle, FaBook } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

// ----------------------------------------------------------------------
// Service functions (unchanged)
// ----------------------------------------------------------------------
async function fetchCourses(orgId) {
  const q = query(
    collection(db, 'courses'),
    where('orgId', '==', orgId),
    orderBy('code', 'asc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

async function addCourse(orgId, data) {
  const docRef = await addDoc(collection(db, 'courses'), {
    ...data,
    orgId,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

async function updateCourse(id, data) {
  await updateDoc(doc(db, 'courses', id), data);
}

async function removeCourse(id) {
  await deleteDoc(doc(db, 'courses', id));
}

// ----------------------------------------------------------------------
// Custom hook (unchanged)
// ----------------------------------------------------------------------
function useCourses(orgId) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!orgId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await fetchCourses(orgId);
      setCourses(data);
    } catch (err) {
      console.error(err);
      setError(err);
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    load();
  }, [load]);

  const add = async (data) => {
    try {
      await addCourse(orgId, data);
      toast.success('Course added');
      await load();
    } catch (err) {
      toast.error('Failed to add course');
      throw err;
    }
  };

  const update = async (id, data) => {
    try {
      await updateCourse(id, data);
      toast.success('Course updated');
      setCourses((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...data } : c))
      );
    } catch (err) {
      toast.error('Failed to update course');
      throw err;
    }
  };

  const remove = async (id) => {
    try {
      await removeCourse(id);
      toast.success('Course deleted');
      setCourses((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      toast.error('Failed to delete course');
      throw err;
    }
  };

  return { courses, loading, error, load, add, update, remove };
}

// ----------------------------------------------------------------------
// Component (UI upgraded)
// ----------------------------------------------------------------------
const Courses = () => {
  const { user } = useAuth();
  const orgId = user?.orgId;

  const { courses, loading, error, load, add, update, remove } = useCourses(orgId);

  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    instructor: '',
    duration: '',
    fees: '',
    totalStudents: 0,
    description: '',
  });
  const [formErrors, setFormErrors] = useState({});

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      instructor: '',
      duration: '',
      fees: '',
      totalStudents: 0,
      description: '',
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
    if (!formData.code.trim()) errors.code = 'Course code is required.';
    if (!formData.name.trim()) errors.name = 'Course name is required.';
    if (!formData.instructor.trim()) errors.instructor = 'Instructor is required.';
    if (!formData.duration.trim()) errors.duration = 'Duration is required.';
    if (
      formData.fees === '' ||
      isNaN(parseFloat(formData.fees)) ||
      parseFloat(formData.fees) < 0
    ) {
      errors.fees = 'Enter a valid fee amount (0 or more).';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!orgId) return;
    if (!validateForm()) return;

    try {
      setSaving(true);
      const payload = {
        code: formData.code.trim(),
        name: formData.name.trim(),
        instructor: formData.instructor.trim(),
        duration: formData.duration.trim(),
        fees: parseFloat(formData.fees) || 0,
        totalStudents: parseInt(formData.totalStudents, 10) || 0,
        description: formData.description.trim(),
      };
      if (editingCourse) {
        await update(editingCourse.id, payload);
      } else {
        await add(payload);
      }
      setShowModal(false);
      setEditingCourse(null);
      resetForm();
    } catch (err) {
      // error handled in hook
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setFormData({
      code: course.code || '',
      name: course.name || '',
      instructor: course.instructor || '',
      duration: course.duration || '',
      fees: course.fees != null ? course.fees.toString() : '',
      totalStudents: course.totalStudents || 0,
      description: course.description || '',
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
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
        <p className="text-sm text-neutral-600 mb-4">Failed to load courses.</p>
        <button onClick={load} className="btn-primary">Retry</button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="page-header">Courses</h1>
          <p className="text-sm text-neutral-500 mt-1">Manage courses for your institute</p>
        </div>
        <button
          onClick={() => {
            setEditingCourse(null);
            resetForm();
            setShowModal(true);
          }}
          className="btn-primary inline-flex items-center"
        >
          <FaPlus className="mr-2" /> Add Course
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-md border border-neutral-200/60 overflow-hidden">
        <div className="table-container">
          <table className="min-w-full divide-y divide-neutral-100">
            <thead>
              <tr>
                <th className="table-header">Course Code</th>
                <th className="table-header">Course Name</th>
                <th className="table-header">Instructor</th>
                <th className="table-header">Duration</th>
                <th className="table-header">Students</th>
                <th className="table-header">Fees</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {courses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <FaBook className="mx-auto text-3xl text-neutral-200 mb-3" />
                    <p className="text-sm text-neutral-500">No courses yet. Add your first course.</p>
                  </td>
                </tr>
              ) : (
                courses.map((course) => (
                  <tr key={course.id} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="table-cell font-medium text-neutral-900">{course.code}</td>
                    <td className="table-cell">{course.name}</td>
                    <td className="table-cell">{course.instructor}</td>
                    <td className="table-cell">{course.duration}</td>
                    <td className="table-cell">{course.totalStudents}</td>
                    <td className="table-cell">
                      {course.fees != null
                        ? `$${Number(course.fees).toLocaleString()}`
                        : '—'}
                    </td>
                    <td className="table-cell">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(course)}
                          className="p-1.5 rounded-lg text-primary-600 hover:bg-primary-50 transition-colors"
                          title="Edit course"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(course.id)}
                          className="p-1.5 rounded-lg text-danger-600 hover:bg-danger-50 transition-colors"
                          title="Delete course"
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
              className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-neutral-100 max-h-[85vh] overflow-y-auto"
            >
              <div className="p-6">
                <h2 className="text-xl font-semibold text-neutral-900 mb-5">
                  {editingCourse ? 'Edit Course' : 'Add New Course'}
                </h2>
                <form onSubmit={handleSubmit} noValidate>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="code" className="block text-sm font-medium text-neutral-700 mb-1.5">
                        Course Code
                      </label>
                      <input
                        id="code"
                        type="text"
                        name="code"
                        value={formData.code}
                        onChange={handleInputChange}
                        className={`w-full ${formErrors.code ? 'border-danger-500 focus:ring-danger-500' : ''}`}
                        required
                        aria-required="true"
                      />
                      {formErrors.code && (
                        <p className="text-danger-600 text-xs mt-1">{formErrors.code}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-1.5">
                        Course Name
                      </label>
                      <input
                        id="name"
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={`w-full ${formErrors.name ? 'border-danger-500 focus:ring-danger-500' : ''}`}
                        required
                      />
                      {formErrors.name && (
                        <p className="text-danger-600 text-xs mt-1">{formErrors.name}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="instructor" className="block text-sm font-medium text-neutral-700 mb-1.5">
                        Instructor
                      </label>
                      <input
                        id="instructor"
                        type="text"
                        name="instructor"
                        value={formData.instructor}
                        onChange={handleInputChange}
                        className={`w-full ${formErrors.instructor ? 'border-danger-500 focus:ring-danger-500' : ''}`}
                        required
                      />
                      {formErrors.instructor && (
                        <p className="text-danger-600 text-xs mt-1">{formErrors.instructor}</p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="duration" className="block text-sm font-medium text-neutral-700 mb-1.5">
                          Duration
                        </label>
                        <input
                          id="duration"
                          type="text"
                          name="duration"
                          value={formData.duration}
                          onChange={handleInputChange}
                          className={`w-full ${formErrors.duration ? 'border-danger-500 focus:ring-danger-500' : ''}`}
                          placeholder="e.g., 4 Years"
                          required
                        />
                        {formErrors.duration && (
                          <p className="text-danger-600 text-xs mt-1">{formErrors.duration}</p>
                        )}
                      </div>
                      <div>
                        <label htmlFor="fees" className="block text-sm font-medium text-neutral-700 mb-1.5">
                          Fees
                        </label>
                        <input
                          id="fees"
                          type="number"
                          name="fees"
                          value={formData.fees}
                          onChange={handleInputChange}
                          className={`w-full ${formErrors.fees ? 'border-danger-500 focus:ring-danger-500' : ''}`}
                          min="0"
                          step="0.01"
                          required
                        />
                        {formErrors.fees && (
                          <p className="text-danger-600 text-xs mt-1">{formErrors.fees}</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-neutral-700 mb-1.5">
                        Description
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        className="w-full"
                        rows="3"
                      />
                    </div>
                    {editingCourse && (
                      <div>
                        <label htmlFor="totalStudents" className="block text-sm font-medium text-neutral-700 mb-1.5">
                          Total Students (manual override)
                        </label>
                        <input
                          id="totalStudents"
                          type="number"
                          name="totalStudents"
                          value={formData.totalStudents}
                          onChange={handleInputChange}
                          className="w-full"
                          min="0"
                        />
                        <p className="text-xs text-neutral-500 mt-1">
                          Normally updated automatically when students enroll.
                        </p>
                      </div>
                    )}
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
                      {editingCourse ? 'Update' : 'Add'} Course
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

export default Courses;