import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  FaUsers,
  FaBook,
  FaCalendarCheck,
  FaChartLine,
  FaPercentage,
  FaUserGraduate,
  FaExclamationTriangle,
} from 'react-icons/fa';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  collection,
  query,
  where,
  getDocs,
  getCountFromServer,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { toast } from 'react-hot-toast';

// ============================================================
// Custom hook – fetches all dashboard data scoped by orgId
// (unchanged logic, same implementation)
// ============================================================
function useDashboardData(orgId) {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCourses: 0,
    todayAttendance: 0,
    averageMarks: 0,
    presentToday: 0,
    passedStudents: 0,
  });
  const [recentMarks, setRecentMarks] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [courseDistribution, setCourseDistribution] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!orgId) return;
    try {
      setLoading(true);
      setError(null);

      const [studentCountSnap, courseCountSnap] = await Promise.all([
        getCountFromServer(
          query(collection(db, 'students'), where('orgId', '==', orgId))
        ),
        getCountFromServer(
          query(collection(db, 'courses'), where('orgId', '==', orgId))
        ),
      ]);

      const today = new Date().toISOString().split('T')[0];
      const attendanceTodayQuery = query(
        collection(db, 'attendance'),
        where('orgId', '==', orgId),
        where('date', '==', today)
      );
      const attendanceTodaySnap = await getDocs(attendanceTodayQuery);
      const totalToday = attendanceTodaySnap.size;
      const presentToday = attendanceTodaySnap.docs.filter(
        (doc) => doc.data().status === 'present'
      ).length;
      const todayAttendancePct =
        totalToday > 0 ? Math.round((presentToday / totalToday) * 100) : 0;

      const recentMarksQuery = query(
        collection(db, 'marks'),
        where('orgId', '==', orgId),
        orderBy('createdAt', 'desc'),
        limit(5)
      );
      const recentMarksSnap = await getDocs(recentMarksQuery);
      const recentMarksData = recentMarksSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const allMarksQuery = query(
        collection(db, 'marks'),
        where('orgId', '==', orgId)
      );
      const allMarksSnap = await getDocs(allMarksQuery);
      let avgMarks = 0;
      let passCount = 0;
      if (allMarksSnap.size > 0) {
        let totalMarksSum = 0;
        allMarksSnap.forEach((doc) => {
          const m = doc.data().obtainedMarks || 0;
          totalMarksSum += m;
          if (m >= 40) passCount++;
        });
        avgMarks = Math.round(totalMarksSum / allMarksSnap.size);
      }
      const passPct =
        allMarksSnap.size > 0 ? Math.round((passCount / allMarksSnap.size) * 100) : 0;

      const weekDays = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        weekDays.push(d.toISOString().split('T')[0]);
      }
      const weeklyData = [];
      for (const day of weekDays) {
        const dayQuery = query(
          collection(db, 'attendance'),
          where('orgId', '==', orgId),
          where('date', '==', day)
        );
        const daySnap = await getDocs(dayQuery);
        const total = daySnap.size;
        const present = daySnap.docs.filter(
          (doc) => doc.data().status === 'present'
        ).length;
        const absent = total - present;
        weeklyData.push({
          day: new Date(day).toLocaleDateString('en-US', { weekday: 'short' }),
          present,
          absent,
        });
      }

      const coursesQuery = query(
        collection(db, 'courses'),
        where('orgId', '==', orgId)
      );
      const coursesSnap = await getDocs(coursesQuery);
      const courseDist = coursesSnap.docs.slice(0, 5).map((doc) => ({
        name: doc.data().code || 'Course',
        students: doc.data().totalStudents || 0,
      }));

      setStats({
        totalStudents: studentCountSnap.data().count,
        totalCourses: courseCountSnap.data().count,
        todayAttendance: todayAttendancePct,
        averageMarks: avgMarks,
        presentToday,
        passedStudents: passPct,
      });
      setRecentMarks(recentMarksData);
      setAttendanceData(weeklyData);
      setCourseDistribution(courseDist);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError(err);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const retry = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    stats,
    recentMarks,
    attendanceData,
    courseDistribution,
    loading,
    error,
    retry,
  };
}

// ============================================================
// Dashboard Component – upgraded UI
// ============================================================
const Dashboard = () => {
  const { user } = useAuth();
  const orgId = user?.orgId;

  const {
    stats,
    recentMarks,
    attendanceData,
    courseDistribution,
    loading,
    error,
    retry,
  } = useDashboardData(orgId);

  const statCards = useMemo(
    () => [
      {
        icon: <FaUsers />,
        label: 'Total Students',
        value: stats.totalStudents,
        iconBg: 'bg-primary-50 text-primary-700',
      },
      {
        icon: <FaBook />,
        label: 'Total Courses',
        value: stats.totalCourses,
        iconBg: 'bg-success-50 text-success-700',
      },
      {
        icon: <FaCalendarCheck />,
        label: "Today's Attendance",
        value: `${stats.todayAttendance}%`,
        iconBg: 'bg-warning-50 text-warning-700',
      },
      {
        icon: <FaChartLine />,
        label: 'Average Marks',
        value: `${stats.averageMarks}%`,
        iconBg: 'bg-accent-50 text-accent-700',
      },
      {
        icon: <FaPercentage />,
        label: 'Pass Percentage',
        value: `${stats.passedStudents}%`,
        iconBg: 'bg-primary-50 text-primary-700',
      },
      {
        icon: <FaUserGraduate />,
        label: 'Present Today',
        value: stats.presentToday,
        iconBg: 'bg-success-50 text-success-700',
      },
    ],
    [stats]
  );

  const COLORS = useMemo(
    () => ['#5c8df8', '#10b981', '#a855f7', '#f59e0b', '#3b82f6'],
    []
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-neutral-200 border-t-primary-600 mb-4" />
        <p className="text-sm text-neutral-500">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="w-12 h-12 rounded-full bg-danger-50 flex items-center justify-center mb-4">
          <FaExclamationTriangle className="text-danger-600 text-xl" />
        </div>
        <p className="text-sm text-neutral-600 mb-4">Failed to load dashboard data.</p>
        <button
          onClick={retry}
          className="btn-primary"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="page-header">Dashboard</h1>
        <p className="text-sm text-neutral-500 mt-1">Welcome to Maniesta Campus OS</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5 mb-8">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="stat-card hover:shadow-lg transition-shadow flex items-center justify-between"
          >
            <div className="flex-1">
              <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
                {stat.label}
              </p>
              <p className="text-2xl font-bold text-neutral-900 mt-1">{stat.value}</p>
            </div>
            <div className={`p-3 rounded-xl ${stat.iconBg} ml-4`}>
              <span className="text-xl">{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Weekly Attendance Chart */}
        <div className="stat-card lg:col-span-2">
          <h2 className="text-lg font-semibold text-neutral-900 mb-2">
            Weekly Attendance Trend
          </h2>
          {attendanceData.length > 0 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f8" />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 12, color: '#6b7280' }} />
                  <Bar
                    dataKey="present"
                    name="Present"
                    fill="#3b6df3"
                    radius={[6, 6, 0, 0]}
                  />
                  <Bar
                    dataKey="absent"
                    name="Absent"
                    fill="#ef4444"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="empty-state">
              <FaCalendarCheck className="text-3xl text-neutral-300 mb-2" />
              <p className="text-sm text-neutral-500">
                No attendance data for the past week.
              </p>
            </div>
          )}
        </div>

        {/* Course Distribution */}
        <div className="stat-card">
          <h2 className="text-lg font-semibold text-neutral-900 mb-2">
            Course Enrollment
          </h2>
          {courseDistribution.length > 0 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={courseDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, students }) => `${name}: ${students}`}
                    outerRadius={80}
                    dataKey="students"
                  >
                    {courseDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="empty-state">
              <FaBook className="text-3xl text-neutral-300 mb-2" />
              <p className="text-sm text-neutral-500">No courses yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Marks */}
      <div className="stat-card mb-8">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Recent Marks</h2>
        {recentMarks.length > 0 ? (
          <div className="space-y-3">
            {recentMarks.map((mark) => (
              <div
                key={mark.id}
                className="flex items-center justify-between p-3 hover:bg-neutral-50 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm ${
                      mark.obtainedMarks >= 80
                        ? 'bg-success-500'
                        : mark.obtainedMarks >= 60
                        ? 'bg-primary-500'
                        : mark.obtainedMarks >= 40
                        ? 'bg-warning-500'
                        : 'bg-danger-500'
                    }`}
                  >
                    {mark.obtainedMarks}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-800">
                      {mark.studentName || 'Student'}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {mark.courseName || 'Course'} · {mark.examType}
                    </p>
                  </div>
                </div>
                <span className="badge badge-success">
                  {mark.grade}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <FaChartLine className="text-3xl text-neutral-300 mb-2" />
            <p className="text-sm text-neutral-500">No marks recorded yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;