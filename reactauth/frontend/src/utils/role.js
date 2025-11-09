export const detectRoleFromEmail = (email = '') => {
  const normalized = email.trim().toLowerCase();
  if (normalized.endsWith('@student.prasetiyamulya.ac.id')) {
    return 'student';
  }
  if (normalized.endsWith('@prasetiyamulya.ac.id')) {
    return 'lecturer';
  }
  return null;
};

export const redirectPathForRole = (role) => {
  if (role === 'student') return '/dashboard/student';
  if (role === 'lecturer') return '/dashboard/lecturer';
  return '/login';
};
