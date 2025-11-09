import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchLecturerCourses } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { mockLecturerCourses } from '../mock/data';

const getEnrollmentCount = (value) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (Array.isArray(value)) {
    return value.length;
  }
  if (value && typeof value === 'object') {
    if (typeof value.count === 'number') {
      return value.count;
    }
    if (Array.isArray(value.results)) {
      return value.results.length;
    }
    if (Array.isArray(value.data)) {
      return value.data.length;
    }
    if ('id' in value && 'name' in value) {
      return 1;
    }
    return Object.keys(value).length;
  }
  return 0;
};

const LecturerDashboard = () => {
  const { user, token, setUsingMockData } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const loadCourses = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await fetchLecturerCourses(token);
        if (!active) return;
        setUsingMockData(false);
        setCourses(data);
      } catch (err) {
        if (!active) return;
        setUsingMockData(true);
        setCourses(mockLecturerCourses);
        setError('Unable to reach the API. Showing mock courses.');
      } finally {
        if (active) setLoading(false);
      }
    };
    loadCourses();
    return () => {
      active = false;
    };
  }, [token, setUsingMockData]);

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Prasetiya Mulya University</p>
          <h1>Good day, {user?.first_name || user?.full_name || user?.username}</h1>
        </div>
        <button className="ghost-btn" onClick={() => navigate('/logout')}>
          Logout
        </button>
      </header>

      {error && <div className="info-banner">{error}</div>}

      <section className="panel">
        <div className="panel-header">
          <h2>Your Courses</h2>
          <p className="muted">Manage attendance, materials, and grades.</p>
        </div>
        {loading ? (
          <p>Loading courses...</p>
        ) : (
          <div className="course-grid">
            {courses.map((course) => (
              <article key={course.id} className="course-card">
                <p className="course-code">{course.code}</p>
                <h3>{course.name}</h3>
                <p className="muted">
                  Room {course.room} · Next session {course.nextSession}
                </p>
                <p className="muted">Enrolled students: {getEnrollmentCount(course.students)}</p>
                <div className="card-actions">
                  <Link to={`/courses/${course.id}`} className="link">
                    Open course →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default LecturerDashboard;
