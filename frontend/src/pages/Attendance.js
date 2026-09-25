import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import {
  FaCalendar,
  FaCheck,
  FaTimes,
  FaUserClock,
  FaSpinner,
  FaExclamationTriangle,
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';

// ----------------------------------------------------------------------
// Service helpers
// ----------------------------------------------------------------------
async function fetchOrgCourses(orgId) {
  const q = query(collection(db, 'courses'), where('orgId', '==', orgId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function fetchStudentsByCourse(orgId, courseId) {
  if (!courseId) return [];
  const q = query(
    collection(db, 'students'),
    where('orgId', '==', orgId),
    where('courseId', '==', courseId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function fetchAttendanceForCourseDate(orgId, courseId, date) {
  const q = query(
    collection(db, 'attendance'),
    where('orgId', '==', orgId),
    where('courseId', '==', courseId),
    where('date', '==', date)
  );
  const snapshot = await getDocs(q);
  const records = [];
  snapshot.forEach(doc => {
    records.push({ id: doc.id, ...doc.data() });
  });
  return records;
}

async function saveAttendance(orgId, records) {
  const batch = writeBatch(db);
  records.forEach(record => {
    const { id, studentId, status, courseId, date, recordedBy } = record;
    const docRef = id ? doc(db, 'attendance', id) : doc(collection(db, 'attendance'));
    const data = {
      studentId,
      status,
      courseId,
      date,
      orgId,
      recordedBy,
      timestamp: serverTimestamp(),
    };
    if (id) {
      batch.update(docRef, data);
    } else {
      batch.set(docRef, data);
    }
  });
  await batch.commit();
}

// ----------------------------------------------------------------------
// Custom hook
// ----------------------------------------------------------------------
function useAttendance(orgId, currentUserId) {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [coursesLoading, setCoursesLoading] = useState(true);

  useEffect(() => {
    if (!orgId) return;
    setCoursesLoading(true);
    fetchOrgCourses(orgId)
      .then(data => {
        setCourses(data);
        if (data.length > 0 && !selectedCourse) {
          setSelectedCourse(data[0].id);
        }
        setError(null);
      })
      .catch(() => {
        toast.error('Failed to load courses');
        setError('Failed to load courses');
      })
      .finally(() => setCoursesLoading(false));
    // selectedCourse is intentionally not in the deps array — we only
    // want to re-fetch courses when the org changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId]);

  useEffect(() => {
    if (!orgId || !selectedCourse || !selectedDate) return;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [studentsData, attendanceRecords] = await Promise.all([
          fetchStudentsByCourse(orgId, selectedCourse),
          fetchAttendanceForCourseDate(orgId, selectedCourse, selectedDate),
        ]);
        setStudents(studentsData);
        const map = {};
        attendanceRecords.forEach(rec => {
          map[rec.studentId] = { status: rec.status, docId: rec.id };
        });
        setAttendanceMap(map);
      } catch (err) {
        toast.error('Failed to load attendance data');
        setError('Failed to load attendance data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [orgId, selectedCourse, selectedDate]);

  const markStatus = useCallback((studentId, status) => {
    setAttendanceMap(prev => ({
      ...prev,
      [studentId]: {
        status,
        docId: prev[studentId]?.docId || null,
      },
    }));
  }, []);

  const submitAttendance = useCallback(async () => {
    if (!orgId || !selectedCourse || !selectedDate) return;
    setSubmitting(true);
    try {
      const records = students.map(student => ({
        id: attendanceMap[student.id]?.docId || null,
        studentId: student.id,
        status: attendanceMap[student.id]?.status || 'absent',
        courseId: selectedCourse,
        date: selectedDate,
        recordedBy: currentUserId || '',
      }));
      await saveAttendance(orgId, records);
      toast.success('Attendance saved');
      const updatedRecords = await fetchAttendanceForCourseDate(
        orgId,
        selectedCourse,
        selectedDate
      );
      const newMap = {};
      updatedRecords.forEach(rec => {
        newMap[rec.studentId] = { status: rec.status, docId: rec.id };
      });
      setAttendanceMap(newMap);
    } catch (err) {
      toast.error('Failed to save attendance');
    } finally {
      setSubmitting(false);
    }
  }, [orgId, selectedCourse, selectedDate, students, attendanceMap, currentUserId]);

  const stats = {
    present: Object.values(attendanceMap).filter(v => v.status === 'present').length,
    absent: Object.values(attendanceMap).filter(v => v.status === 'absent').length,
    late: Object.values(attendanceMap).filter(v => v.status === 'late').length,
  };

  return {
    courses,
    selectedCourse,
    setSelectedCourse,
    selectedDate,
    setSelectedDate,
    students,
    attendanceMap,
    loading,
    submitting,
    error,
    coursesLoading,
    markStatus,
    submitAttendance,
    stats,
  };
}

// ----------------------------------------------------------------------
// Component
// ----------------------------------------------------------------------
const Attendance = () => {
  const { user } = useAuth();
  const orgId = user?.orgId;
  const currentUserId = user?.uid;

  const {
    courses,
    selectedCourse,
    setSelectedCourse,
    selectedDate,
    setSelectedDate,
    students,
    attendanceMap,
    loading,
    submitting,
    error,
    coursesLoading,
    markStatus,
    submitAttendance,
    stats,
  } = useAttendance(orgId, currentUserId);

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="page-header">Attendance</h1>
        <p className="text-sm text-content-muted mt-1">Track and manage student attendance</p>
      </div>

      {/* Filters */}
      <div className="stat-card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label
              htmlFor="att-course"
              className="block text-sm font-medium text-content-primary mb-1.5"
            >
              Select Course
            </label>
            <select
              id="att-course"
              value={selectedCourse}
              onChange={e => setSelectedCourse(e.target.value)}
              disabled={coursesLoading}
              className="input"
            >
              {courses.length === 0 && <option value="">No courses available</option>}
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.name} ({course.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="att-date"
              className="block text-sm font-medium text-content-primary mb-1.5"
            >
              Select Date
            </label>
            <div className="relative">
              <FaCalendar
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-content-muted"
                aria-hidden="true"
              />
              <input
                id="att-date"
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={submitAttendance}
              disabled={loading || submitting || students.length === 0}
              className="btn-primary w-full inline-flex items-center justify-center"
            >
              {submitting ? (
                <>
                  <FaSpinner className="animate-spin mr-2" aria-hidden="true" />
                  Saving...
                </>
              ) : (
                'Save Attendance'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-surface rounded-xl shadow-card border border-border overflow-hidden mb-6">
        {loading || coursesLoading ? (
          <div className="flex justify-center py-16">
            <div
              className="animate-spin rounded-full h-10 w-10 border-2 border-border border-t-primary-600"
              role="status"
            >
              <span className="sr-only">Loading attendance…</span>
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-12 h-12 rounded-full bg-danger-50 flex items-center justify-center mb-4">
              <FaExclamationTriangle className="text-danger-600 text-xl" aria-hidden="true" />
            </div>
            <p className="text-sm text-content-secondary mb-4">{error}</p>
            <button type="button" onClick={handleRetry} className="btn-primary">
              Retry
            </button>
          </div>
        ) : students.length === 0 ? (
          <div className="py-16 text-center">
            <FaCalendar
              className="mx-auto text-3xl text-content-disabled mb-3"
              aria-hidden="true"
            />
            <p className="text-sm text-content-muted">
              No students enrolled in the selected course.
            </p>
          </div>
        ) : (
          <div className="table-container">
            <table className="min-w-full divide-y divide-border-subtle">
              <thead>
                <tr>
                  <th className="table-header">Student ID</th>
                  <th className="table-header">Name</th>
                  <th className="table-header">Present</th>
                  <th className="table-header">Absent</th>
                  <th className="table-header">Late</th>
                  <th className="table-header">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {students.map(student => (
                  <tr key={student.id} className="hover:bg-surface-muted/60 transition-colors">
                    <td className="table-cell font-medium">{student.studentId}</td>
                    <td className="table-cell">{student.name}</td>

                    <td className="table-cell text-center">
                      <button
                        type="button"
                        onClick={() => markStatus(student.id, 'present')}
                        className={`p-2 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-success-500 focus-visible:ring-offset-2 ${
                          attendanceMap[student.id]?.status === 'present'
                            ? 'bg-success-50 text-success-600'
                            : 'text-content-muted hover:text-success-600'
                        }`}
                        aria-label={`Mark ${student.name} present`}
                      >
                        <FaCheck aria-hidden="true" />
                      </button>
                    </td>

                    <td className="table-cell text-center">
                      <button
                        type="button"
                        onClick={() => markStatus(student.id, 'absent')}
                        className={`p-2 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-danger-500 focus-visible:ring-offset-2 ${
                          attendanceMap[student.id]?.status === 'absent'
                            ? 'bg-danger-50 text-danger-600'
                            : 'text-content-muted hover:text-danger-600'
                        }`}
                        aria-label={`Mark ${student.name} absent`}
                      >
                        <FaTimes aria-hidden="true" />
                      </button>
                    </td>

                    <td className="table-cell text-center">
                      <button
                        type="button"
                        onClick={() => markStatus(student.id, 'late')}
                        className={`p-2 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-warning-500 focus-visible:ring-offset-2 ${
                          attendanceMap[student.id]?.status === 'late'
                            ? 'bg-warning-50 text-warning-600'
                            : 'text-content-muted hover:text-warning-600'
                        }`}
                        aria-label={`Mark ${student.name} late`}
                      >
                        <FaUserClock aria-hidden="true" />
                      </button>
                    </td>

                    <td className="table-cell">
                      {attendanceMap[student.id]?.status ? (
                        <span
                          className={`badge ${
                            attendanceMap[student.id].status === 'present'
                              ? 'badge-success'
                              : attendanceMap[student.id].status === 'absent'
                                ? 'badge-danger'
                                : 'badge-warning'
                          }`}
                        >
                          {attendanceMap[student.id].status.charAt(0).toUpperCase() +
                            attendanceMap[student.id].status.slice(1)}
                        </span>
                      ) : (
                        <span className="badge">Not Marked</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stats */}
      {students.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="stat-card flex items-center">
            <div className="p-3 rounded-xl bg-success-50 text-success-600 mr-4">
              <FaCheck className="text-xl" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-medium text-content-muted uppercase tracking-wider">
                Present
              </p>
              <p className="text-2xl font-bold text-content-primary">{stats.present}</p>
            </div>
          </div>

          <div className="stat-card flex items-center">
            <div className="p-3 rounded-xl bg-danger-50 text-danger-600 mr-4">
              <FaTimes className="text-xl" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-medium text-content-muted uppercase tracking-wider">
                Absent
              </p>
              <p className="text-2xl font-bold text-content-primary">{stats.absent}</p>
            </div>
          </div>

          <div className="stat-card flex items-center">
            <div className="p-3 rounded-xl bg-warning-50 text-warning-600 mr-4">
              <FaUserClock className="text-xl" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-medium text-content-muted uppercase tracking-wider">
                Late
              </p>
              <p className="text-2xl font-bold text-content-primary">{stats.late}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;