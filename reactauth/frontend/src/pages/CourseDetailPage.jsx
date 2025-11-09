import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { fetchCourseStudents, updateStudentGrades } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { mockCourseStudents, updateMockGrade } from '../mock/data';

const CourseDetailPage = () => {
  const { courseId } = useParams();
  const { token, setUsingMockData } = useAuth();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [editing, setEditing] = useState({});

  useEffect(() => {
    let active = true;
    const loadStudents = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await fetchCourseStudents(courseId, token);
        if (!active) return;
        setUsingMockData(false);
        setStudents(data);
      } catch (err) {
        if (!active) return;
        setUsingMockData(true);
        setStudents(mockCourseStudents[courseId] || []);
        setError('Unable to reach the API. Showing mock students.');
      } finally {
        if (active) setLoading(false);
      }
    };
    loadStudents();
    return () => {
      active = false;
    };
  }, [courseId, token, setUsingMockData]);

  const clampScore = (val, fallback) => {
    if (val === '' || val === undefined || val === null) {
      return fallback;
    }
    const numeric = Number(val);
    if (Number.isNaN(numeric)) {
      return fallback;
    }
    return Math.max(0, Math.min(100, numeric));
  };

  const handleGradeChange = (studentId, field, rawValue) => {
    const nextValue =
      rawValue === '' ? '' : clampScore(rawValue, rawValue).toString();

    setEditing((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], [field]: nextValue },
    }));
  };

  const handleSave = async (studentId, currentGrades = {}) => {
    const edits = editing[studentId] || {};
    const payload = {
      classwork: clampScore(edits.classwork, currentGrades.classwork ?? 0),
      midterm: clampScore(edits.midterm, currentGrades.midterm ?? 0),
      finals: clampScore(edits.finals, currentGrades.finals ?? 0),
    };
    setStatus('');
    try {
      await updateStudentGrades(courseId, studentId, payload, token);
      setUsingMockData(false);
      setStudents((prev) =>
        prev.map((stu) => (stu.id === studentId ? { ...stu, grades: payload } : stu))
      );
      setEditing((prev) => {
        const next = { ...prev };
        delete next[studentId];
        return next;
      });
      setStatus('Grades updated successfully.');
    } catch (err) {
      setUsingMockData(true);
      const updated = updateMockGrade(courseId, studentId, payload);
      if (updated) {
        setStudents((prev) =>
          prev.map((stu) => (stu.id === studentId ? { ...stu, grades: updated.grades } : stu))
        );
      }
      setStatus('API unavailable. Saved changes locally.');
    }
  };

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">
            <Link to="/dashboard/lecturer" className="link">
              ← Back to dashboard
            </Link>
          </p>
          <h1>Course {courseId}</h1>
        </div>
        <button className="ghost-btn" onClick={() => navigate('/logout')}>
          Logout
        </button>
      </header>

      {error && <div className="info-banner">{error}</div>}
      {status && <div className="toast success">{status}</div>}

      {loading ? (
        <p>Loading students...</p>
      ) : (
        <div className="panel">
          <div className="panel-header">
            <h2>Enrolled Students</h2>
            <p className="muted">Update component grades (0–100)</p>
          </div>
          <div className="table">
            <div className="table-head">
              <span>Name</span>
              <span>Email</span>
              <span>Classwork</span>
              <span>Midterm</span>
              <span>Finals</span>
              <span>Actions</span>
            </div>
            {students.map((student) => (
              <div key={student.id} className="table-row">
                <span>{student.name}</span>
                <span className="muted">{student.email}</span>
                {['classwork', 'midterm', 'finals'].map((field) => (
                  <input
                    key={field}
                    type="number"
                    min="0"
                    max="100"
                    value={
                      editing[student.id]?.[field] ??
                      (student.grades?.[field] ?? '').toString()
                    }
                    onChange={(e) => handleGradeChange(student.id, field, e.target.value)}
                  />
                ))}
                <span>
                  <button
                    className="secondary-btn"
                    onClick={() => handleSave(student.id, student.grades)}
                  >
                    Save
                  </button>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseDetailPage;
