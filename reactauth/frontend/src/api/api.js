const BASE_URL = "http://127.0.0.1:8000";

const jsonHeaders = (token) => {
  const headers = {
    "Content-Type": "application/json",
  };
  if (token) {
    // Handle both string tokens and token objects
    const cleanToken = String(token?.access || token || '').trim();
    if (cleanToken) {
      headers.Authorization = `Token ${cleanToken}`;
      console.log('Token being used:', cleanToken);
      console.log('Final Authorization header:', headers.Authorization);
    }
  }
  return headers;
};

async function request(path, { method = "GET", body, token } = {}) {
  // All endpoints should go through /api/auth
  const fullPath = `${BASE_URL}/api/auth${path}`;
  console.log("Making request to:", fullPath);
  console.log("With token:", token);
  const response = await fetch(fullPath, {
    method,
    headers: jsonHeaders(token),
    credentials: "include",
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(
      errorData?.detail || errorData?.message || "Request failed"
    );
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export const registerUser = (payload) =>
  request("/register/", {
    method: "POST",
    body: payload,
  });

export const loginUser = ({ usernameOrEmail, password }) => {
  console.log("Login attempt with:", { usernameOrEmail, password });
  return request("/login/", {
    method: "POST",
    body: {
      username: usernameOrEmail,
      password: password,
    },
  });
};

export const fetchStudentClasses = (token) =>
  request("/dashboard/student/", {
    method: "GET",
    token,
  });

export const fetchLecturerCourses = (token) =>
  request("/dashboard/lecturer/", {
    method: "GET",
    token,
  });

export const fetchCourseStudents = (courseId, token) =>
  request(`/courses/${courseId}/students/`, {
    method: "GET",
    token,
  });

export const updateStudentGrades = (courseId, studentId, grades, token) =>
  request(`/courses/${courseId}/students/${studentId}/grades/`, {
    method: "PATCH",
    token,
    body: grades,
  });
