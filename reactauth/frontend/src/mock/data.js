export const mockStudentClasses = [
  {
    id: 'CLS123',
    code: 'DBT201',
    name: 'Data & Business Technology',
    lecturer: 'Dr. Maria Santoso',
    schedule: { day: 'Mon', start: '09:00', end: '10:30', room: 'B201' },
    grades: { classwork: 85, midterm: 78, finals: 90 },
  },
  {
    id: 'CLS456',
    code: 'AIR220',
    name: 'Robotics Fundamentals',
    lecturer: 'Dr. Nathan Sunaryo',
    schedule: { day: 'Wed', start: '13:00', end: '15:00', room: 'Lab 3' },
    grades: { classwork: 92, midterm: 88, finals: 94 },
  },
  {
    id: 'CLS789',
    code: 'PDI105',
    name: 'Design Thinking Studio',
    lecturer: 'Dr. Carla Irawan',
    schedule: { day: 'Fri', start: '08:30', end: '10:00', room: 'Studio 1' },
    grades: { classwork: 80, midterm: 82, finals: 86 },
  },
];

export const mockLecturerCourses = [
  {
    id: 'CRS100',
    code: 'AIR210',
    name: 'Introduction to AI Systems',
    room: 'LAB-1',
    nextSession: 'Tue 10:00',
    students: 28,
  },
  {
    id: 'CRS200',
    code: 'DBT330',
    name: 'Data Integration & APIs',
    room: 'B304',
    nextSession: 'Thu 14:00',
    students: 32,
  },
  {
    id: 'CRS300',
    code: 'PDI250',
    name: 'Product Strategy Workshop',
    room: 'Studio 5',
    nextSession: 'Fri 09:00',
    students: 18,
  },
];

export const mockCourseStudents = {
  CRS100: [
    {
      id: 'STU1',
      name: 'Aria Hartanto',
      email: 'aria@student.prasetiyamulya.ac.id',
      grades: { classwork: 88, midterm: 80, finals: 0 },
    },
    {
      id: 'STU2',
      name: 'Jonathan Situmorang',
      email: 'jonathan@student.prasetiyamulya.ac.id',
      grades: { classwork: 90, midterm: 83, finals: 0 },
    },
  ],
  CRS200: [
    {
      id: 'STU7',
      name: 'Marcell Leo',
      email: 'marcell@student.prasetiyamulya.ac.id',
      grades: { classwork: 75, midterm: 70, finals: 0 },
    },
  ],
  CRS300: [
    {
      id: 'STU8',
      name: 'Klara Halim',
      email: 'klara@student.prasetiyamulya.ac.id',
      grades: { classwork: 95, midterm: 91, finals: 0 },
    },
  ],
};

export const updateMockGrade = (courseId, studentId, grades) => {
  const students = mockCourseStudents[courseId];
  if (!students) return null;
  const idx = students.findIndex((s) => s.id === studentId);
  if (idx === -1) return null;
  students[idx] = {
    ...students[idx],
    grades: { ...students[idx].grades, ...grades },
  };
  return students[idx];
};
