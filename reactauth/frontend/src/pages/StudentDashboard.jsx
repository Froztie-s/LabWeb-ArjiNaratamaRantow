import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchStudentClasses } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { mockStudentClasses } from '../mock/data';

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

const StudentDashboard = () => {
  const { user, token, setUsingMockData } = useAuth();
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const loadClasses = async () => {
      setLoading(true);
      setError('');
      try {
        console.log('Raw token from auth:', token);
        if (!token) {
          throw new Error('No authentication token available');
        }
        const data = await fetchStudentClasses(token);
        if (!active) return;
        setUsingMockData(false);
        setClasses(data);
      } catch (err) {
        console.error('Error fetching classes:', err);
        if (!active) return;
        setUsingMockData(true);
        setClasses(mockStudentClasses);
        setError('Unable to reach the API. Showing mock data.');
      } finally {
        if (active) setLoading(false);
      }
    };
    loadClasses();
    return () => {
      active = false;
    };
  }, [token, setUsingMockData]);

  const timetable = useMemo(() => {
    const initial = Object.fromEntries(days.map((day) => [day, []]));
    classes.forEach((cls) => {
      const dayKey = cls.schedule?.day;
      if (!dayKey) {
        return;
      }
      if (!initial[dayKey]) {
        initial[dayKey] = [];
      }
      initial[dayKey].push(cls);
    });
    return initial;
  }, [classes]);

  const toggleCard = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Prasetiya Mulya University</p>
          <h1>Hi {user?.first_name || user?.full_name || user?.username}, ready for class?</h1>
        </div>
        <button className="ghost-btn" onClick={() => navigate('/logout')}>
          Logout
        </button>
      </header>

      {error && <div className="info-banner">{error}</div>}

      <section className="panel">
        <div className="panel-header">
          <h2>My Timetable</h2>
          <p className="muted">Week at a glance</p>
        </div>
        <div className="timetable-grid">
          {days.map((day) => (
            <div key={day} className="timetable-column">
              <div className="column-title">{day}</div>
              {timetable[day]?.length ? (
                timetable[day].map((cls) => (
                  <div key={cls.id} className="timetable-card">
                    <p className="course-code">{cls.code}</p>
                    <p className="course-name">{cls.name}</p>
                    <p className="muted">
                      {cls.schedule.start} - {cls.schedule.end} · {cls.schedule.room}
                    </p>
                    <p className="muted">{cls.lecturer}</p>
                  </div>
                ))
              ) : (
                <p className="muted empty-state">No classes</p>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <h2>My Classes</h2>
          <p className="muted">Track lecturers and grades</p>
        </div>
        {loading ? (
          <p>Loading classes...</p>
        ) : (
          <div className="class-list">
            {classes.map((cls) => (
              <div key={cls.id} className={`class-card ${expanded[cls.id] ? 'expanded' : ''}`}>
                <button className="class-toggle" onClick={() => toggleCard(cls.id)}>
                  <div>
                    <p className="course-code">{cls.code}</p>
                    <p className="course-name">{cls.name}</p>
                  </div>
                  <span>{expanded[cls.id] ? '−' : '+'}</span>
                </button>
                {expanded[cls.id] && (
                  <div className="class-details">
                    <p>
                      <strong>Lecturer:</strong> {cls.lecturer}
                    </p>
                    {cls.schedule ? (
                      <p>
                        <strong>Schedule:</strong> {cls.schedule.day} · {cls.schedule.start} - {cls.schedule.end} ·{' '}
                        {cls.schedule.room}
                      </p>
                    ) : (
                      <p>
                        <strong>Schedule:</strong> To be announced
                      </p>
                    )}
                    <div className="grades-grid">
                      <div>
                        <p className="muted">Classwork</p>
                        <p className="grade-value">{cls.grades?.classwork ?? '—'}</p>
                      </div>
                      <div>
                        <p className="muted">Midterm</p>
                        <p className="grade-value">{cls.grades?.midterm ?? '—'}</p>
                      </div>
                      <div>
                        <p className="muted">Finals</p>
                        <p className="grade-value">{cls.grades?.finals ?? '—'}</p>
                      </div>
                    </div>
                    <a href="#syllabus" className="link">
                      View syllabus →
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default StudentDashboard;
