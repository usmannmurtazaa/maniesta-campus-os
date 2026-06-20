import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import { FaPlus, FaEdit, FaTrash, FaSpinner, FaExclamationTriangle, FaChartBar } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

// ----------------------------------------------------------------------
// Service helpers (unchanged)
// ----------------------------------------------------------------------
async function fetchOrgCourses(orgId) {
  const q = query(collection(db, 'courses'), where('orgId', '==', orgId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

async function fetchStudentsByCourse(orgId, courseId) {
  if (!courseId) return [];
  const q = query(
    collection(db, 'students'),
    where('orgId', '==', orgId),
    where('courseId', '==', courseId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

async function fetchMarksByCourse(orgId, courseId) {
  const q = query(
    collection(db, 'marks'),
    where('orgId', '==', orgId),
    where('courseId', '==', courseId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

async function addMark(orgId, data) {
  const docRef = await addDoc(collection(db, 'marks'), {
    ...data,
    orgId,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

async function updateMark(id, data) {
  await updateDoc(doc(db, 'marks', id), data);
}

async function deleteMark(id) {
  await deleteDoc(doc(db, 'marks', id));
}

// ----------------------------------------------------------------------
// Custom hook (unchanged)
// ----------------------------------------------------------------------
function useMarks(orgId) {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [marks, setMarks] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!orgId) return;
    fetchOrgCourses(orgId)
      .then((data) => {
        setCourses(data);
        if (data.length > 0 && !selectedCourse) {
          setSelectedCourse(data[0].id);
        }
      })
      .catch(() => toast.error('Failed to load courses'));
  }, [orgId]);

  useEffect(() => {
    if (!orgId || !selectedCourse) return;
    fetchStudentsByCourse(orgId, selectedCourse)
      .then((data) => setStudents(data))
      .catch(() => toast.error('Failed to load students'));
  }, [orgId, selectedCourse]);

  const loadMarks = useCallback(async () => {
    if (!orgId || !selectedCourse) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMarksByCourse(orgId, selectedCourse);
      setMarks(data);
    } catch (err) {
      setError(err);
      toast.error('Failed to load marks');
    } finally {
      setLoading(false);
    }
  }, [orgId, selectedCourse]);

  useEffect(() => {
    loadMarks();
  }, [loadMarks]);

  const add = async (data) => {
    setSaving(true);
    try {
      await addMark(orgId, data);
      toast.success('Mark added');
      await loadMarks();
    } catch (err) {
      toast.error('Failed to add mark');
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const update = async (id, data) => {
    setSaving(true);
    try {
      await updateMark(id, data);
      toast.success('Mark updated');
      setMarks((prev) => prev.map((m) => (m.id === id ? { ...m, ...data } : m)));
    } catch (err) {
      toast.error('Failed to update mark');
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    try {
      await deleteMark(id);
      toast.success('Mark deleted');
      setMarks((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      toast.error('Failed to delete mark');
      throw err;
    }
  };

  return {
    courses,
    selectedCourse,
    setSelectedCourse,
    marks,
    students,
    loading,
    saving,
    error,
    add,
    update,
    remove,
    loadMarks,
  };
}

// ----------------------------------------------------------------------
// Grade helpers
// ----------------------------------------------------------------------
function calculateGrade(percentage) {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B+';
  if (percentage >= 60) return 'B';
  if (percentage >= 50) return 'C+';
  if (percentage >= 40) return 'C';
  if (percentage >= 33) return 'D';
  return 'F';
}

function getGradeBadgeClass(grade) {
  if (!grade) return 'badge';
  if (grade.startsWith('A')) return 'badge badge-success';
  if (grade.startsWith('B')) return 'badge badge-success';
  if (grade.startsWith('C')) return 'badge badge-warning';
  if (grade === 'D') return 'badge badge-warning';
  if (grade === 'F') return 'badge badge-danger';
  return 'badge';
}

// ----------------------------------------------------------------------
// Component
// ----------------------------------------------------------------------
const Marks = () => {
  const { user } = useAuth();
  const orgId = user?.orgId;

  const {
    courses,
    selectedCourse,
    setSelectedCourse,
    marks,
    students,
    loading,
    saving,
    error,
    add,
    update,
    remove,
    loadMarks,
  } = useMarks(orgId);

  const [showModal, setShowModal] = useState(false);
  const [editingMark, setEditingMark] = useState(null);
  const [formData, setFormData] = useState({
    studentId: '',
    subject: '',
    examType: 'Mid-term',
    marksObtained: '',
    totalMarks: 100,
  });
  const [formErrors, setFormErrors] = useState({});

  const studentMap = useMemo(() => {
    const map = {};
    students.forEach((s) => { map[s.id] = s.name; });
    return map;
  }, [students]);

  const resetForm = () => {
    setFormData({
      studentId: '',
      subject: '',
      examType: 'Mid-term',
      marksObtained: '',
      totalMarks: 100,
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
    if (!formData.studentId) errors.studentId = 'Please select a student.';
    if (!formData.subject.trim()) errors.subject = 'Subject is required.';
    const obtained = parseFloat(formData.marksObtained);
    const total = parseFloat(formData.totalMarks);
    if (isNaN(obtained) || obtained < 0) errors.marksObtained = 'Enter a valid mark (0 or more).';
    if (isNaN(total) || total <= 0) errors.totalMarks = 'Total must be greater than 0.';
    if (!errors.marksObtained && !errors.totalMarks && obtained > total) {
      errors.marksObtained = 'Obtained marks cannot exceed total marks.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!orgId) return;
    if (!validateForm()) return;

    const obtained = parseFloat(formData.marksObtained);
    const total = parseFloat(formData.totalMarks);
    const percentage = Math.round((obtained / total) * 100);
    const grade = calculateGrade(percentage);
    const payload = {
      studentId: formData.studentId,
      courseId: selectedCourse,
      subject: formData.subject.trim(),
      examType: formData.examType,
      obtainedMarks: obtained,
      totalMarks: total,
      percentage,
      grade,
      recordedBy: user?.uid || '',
    };

    try {
      if (editingMark) {
        await update(editingMark.id, payload);
      } else {
        await add(payload);
      }
      setShowModal(false);
      setEditingMark(null);
      resetForm();
    } catch (err) {
      // error handled in hook
    }
  };

  const handleEdit = (mark) => {
    setEditingMark(mark);
    setFormData({
      studentId: mark.studentId || '',
      subject: mark.subject || '',
      examType: mark.examType || 'Mid-term',
      marksObtained: mark.obtainedMarks?.toString() || '',
      totalMarks: mark.totalMarks?.toString() || '100',
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this mark?')) {
      await remove(id);
    }
  };

  const stats = useMemo(() => {
    if (marks.length === 0) return null;
    const sum = marks.reduce((acc, m) => acc + (m.obtainedMarks || 0), 0);
    const avg = (sum / marks.length).toFixed(1);
    const highest = Math.max(...marks.map((m) => m.obtainedMarks || 0));
    const lowest = Math.min(...marks.map((m) => m.obtainedMarks || 0));
    const passCount = marks.filter((m) => (m.percentage || 0) >= 40).length;
    const passRate = Math.round((passCount / marks.length) * 100);
    return { avg, highest, lowest, passRate, count: marks.length };
  }, [marks]);

  const gradeDistribution = useMemo(() => {
    const grades = ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F'];
    return grades.map((grade) => ({
      grade,
      count: marks.filter((m) => m.grade === grade).length,
    }));
  }, [marks]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="page-header">Marks Management</h1>
          <p className="text-sm text-neutral-500 mt-1">Record and evaluate student marks</p>
        </div>
        <button
          onClick={() => {
            setEditingMark(null);
            resetForm();
            setShowModal(true);
          }}
          className="btn-primary inline-flex items-center"
        >
          <FaPlus className="mr-2" /> Add Marks
        </button>
      </div>

      {/* Course Selector */}
      <div className="stat-card mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1 w-full sm:w-auto">
            <label htmlFor="marks-course" className="block text-sm font-medium text-neutral-700 mb-1.5">
              Select Course
            </label>
            <select
              id="marks-course"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full sm:w-auto min-w-[200px]"
            >
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.code}: {course.name}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={loadMarks}
            className="btn-secondary inline-flex items-center"
            disabled={loading}
          >
            {loading ? <FaSpinner className="animate-spin mr-2" /> : null}
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Marks Table */}
      <div className="bg-white rounded-xl shadow-md border border-neutral-200/60 overflow-hidden mb-8">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-neutral-200 border-t-primary-600" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-12 h-12 rounded-full bg-danger-50 flex items-center justify-center mb-4">
              <FaExclamationTriangle className="text-danger-600 text-xl" />
            </div>
            <p className="text-sm text-neutral-600 mb-4">Failed to load marks.</p>
            <button onClick={loadMarks} className="btn-primary">Retry</button>
          </div>
        ) : marks.length === 0 ? (
          <div className="py-16 text-center">
            <FaChartBar className="mx-auto text-3xl text-neutral-200 mb-3" />
            <p className="text-sm text-neutral-500">No marks recorded for this course yet.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="min-w-full divide-y divide-neutral-100">
              <thead>
                <tr>
                  <th className="table-header">Student</th>
                  <th className="table-header">Subject</th>
                  <th className="table-header">Exam</th>
                  <th className="table-header">Marks</th>
                  <th className="table-header">Percent</th>
                  <th className="table-header">Grade</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {marks.map((mark) => {
                  const student = students.find((s) => s.id === mark.studentId);
                  const percentage = mark.percentage || 0;
                  const gradeClass = getGradeBadgeClass(mark.grade);
                  return (
                    <tr key={mark.id} className="hover:bg-neutral-50/50 transition-colors">
                      <td className="table-cell font-medium">
                        {student?.name || 'Unknown'} ({student?.studentId || ''})
                      </td>
                      <td className="table-cell">{mark.subject}</td>
                      <td className="table-cell">
                        <span className="badge">{mark.examType}</span>
                      </td>
                      <td className="table-cell">
                        <span className="font-semibold text-neutral-900">{mark.obtainedMarks}</span>
                        <span className="text-neutral-400">/{mark.totalMarks}</span>
                      </td>
                      <td className="table-cell">
                        <span
                          className={`badge ${
                            percentage >= 80
                              ? 'badge-success'
                              : percentage >= 60
                              ? 'badge-success'
                              : percentage >= 40
                              ? 'badge-warning'
                              : 'badge-danger'
                          }`}
                        >
                          {percentage}%
                        </span>
                      </td>
                      <td className="table-cell">
                        <span className={gradeClass}>{mark.grade}</span>
                      </td>
                      <td className="table-cell">
                        <span className={`badge ${percentage >= 40 ? 'badge-success' : 'badge-danger'}`}>
                          {percentage >= 40 ? 'Pass' : 'Fail'}
                        </span>
                      </td>
                      <td className="table-cell">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(mark)}
                            className="p-1.5 rounded-lg text-primary-600 hover:bg-primary-50 transition-colors"
                            title="Edit mark"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(mark.id)}
                            className="p-1.5 rounded-lg text-danger-600 hover:bg-danger-50 transition-colors"
                            title="Delete mark"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="stat-card">
            <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Average</p>
            <p className="text-2xl font-bold text-neutral-900 mt-1">{stats.avg}%</p>
          </div>
          <div className="stat-card">
            <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Highest</p>
            <p className="text-2xl font-bold text-neutral-900 mt-1">{stats.highest}%</p>
          </div>
          <div className="stat-card">
            <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Lowest</p>
            <p className="text-2xl font-bold text-neutral-900 mt-1">{stats.lowest}%</p>
          </div>
          <div className="stat-card">
            <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Pass Rate</p>
            <p className="text-2xl font-bold text-neutral-900 mt-1">{stats.passRate}%</p>
          </div>
        </div>
      )}

      {/* Grade Distribution */}
      {marks.length > 0 && (
        <div className="stat-card mb-8">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Grade Distribution</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
            {gradeDistribution.map((item) => {
              const gradeClass = getGradeBadgeClass(item.grade);
              return (
                <div key={item.grade} className="text-center p-4 rounded-xl border border-neutral-100">
                  <div className={`text-2xl font-bold ${gradeClass.split(' ')[1] || 'text-neutral-600'}`}>
                    {item.count}
                  </div>
                  <div className="text-sm font-medium text-neutral-700 mt-1">Grade {item.grade}</div>
                  <div className="text-xs text-neutral-500">
                    {marks.length > 0
                      ? Math.round((item.count / marks.length) * 100) + '%'
                      : '0%'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

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
                  {editingMark ? 'Edit Mark' : 'Add New Mark'}
                </h2>
                <form onSubmit={handleSubmit} noValidate>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="mark-student" className="block text-sm font-medium text-neutral-700 mb-1.5">
                        Student
                      </label>
                      <select
                        id="mark-student"
                        name="studentId"
                        value={formData.studentId}
                        onChange={handleInputChange}
                        className={`w-full ${formErrors.studentId ? 'border-danger-500 focus:ring-danger-500' : ''}`}
                        required
                        aria-required="true"
                      >
                        <option value="">Select a student</option>
                        {students.map((student) => (
                          <option key={student.id} value={student.id}>
                            {student.name} ({student.studentId})
                          </option>
                        ))}
                      </select>
                      {formErrors.studentId && (
                        <p className="text-danger-600 text-xs mt-1">{formErrors.studentId}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="mark-subject" className="block text-sm font-medium text-neutral-700 mb-1.5">
                        Subject
                      </label>
                      <input
                        id="mark-subject"
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        className={`w-full ${formErrors.subject ? 'border-danger-500 focus:ring-danger-500' : ''}`}
                        required
                      />
                      {formErrors.subject && (
                        <p className="text-danger-600 text-xs mt-1">{formErrors.subject}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="mark-exam-type" className="block text-sm font-medium text-neutral-700 mb-1.5">
                        Exam Type
                      </label>
                      <select
                        id="mark-exam-type"
                        name="examType"
                        value={formData.examType}
                        onChange={handleInputChange}
                        className="w-full"
                      >
                        <option>Mid-term</option>
                        <option>Final</option>
                        <option>Assignment</option>
                        <option>Quiz</option>
                        <option>Project</option>
                        <option>Practical</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="mark-obtained" className="block text-sm font-medium text-neutral-700 mb-1.5">
                          Marks Obtained
                        </label>
                        <input
                          id="mark-obtained"
                          type="number"
                          name="marksObtained"
                          value={formData.marksObtained}
                          onChange={handleInputChange}
                          className={`w-full ${formErrors.marksObtained ? 'border-danger-500 focus:ring-danger-500' : ''}`}
                          min="0"
                          step="0.5"
                          required
                        />
                        {formErrors.marksObtained && (
                          <p className="text-danger-600 text-xs mt-1">{formErrors.marksObtained}</p>
                        )}
                      </div>
                      <div>
                        <label htmlFor="mark-total" className="block text-sm font-medium text-neutral-700 mb-1.5">
                          Total Marks
                        </label>
                        <input
                          id="mark-total"
                          type="number"
                          name="totalMarks"
                          value={formData.totalMarks}
                          onChange={handleInputChange}
                          className={`w-full ${formErrors.totalMarks ? 'border-danger-500 focus:ring-danger-500' : ''}`}
                          min="1"
                          step="1"
                          required
                        />
                        {formErrors.totalMarks && (
                          <p className="text-danger-600 text-xs mt-1">{formErrors.totalMarks}</p>
                        )}
                      </div>
                    </div>
                    {formData.marksObtained && formData.totalMarks && (
                      <div className="p-3 bg-neutral-50 rounded-lg text-sm text-neutral-600">
                        Preview: {formData.marksObtained}/{formData.totalMarks} ={' '}
                        {Math.round(
                          (parseFloat(formData.marksObtained) / parseFloat(formData.totalMarks)) * 100
                        )}
                        % ({calculateGrade(
                          Math.round(
                            (parseFloat(formData.marksObtained) / parseFloat(formData.totalMarks)) * 100
                          )
                        )})
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
                      {editingMark ? 'Update' : 'Add'} Mark
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

export default Marks;