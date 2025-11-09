from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from users.models import Course, CourseSchedule, Enrollment, Score
from datetime import time, timedelta

User = get_user_model()

class Command(BaseCommand):
    help = 'Creates dummy data for testing'

    def handle(self, *args, **kwargs):
        # Create lecturers
        lecturers = [
            {
                'username': 'maria.santoso',
                'email': 'maria.santoso@prasetiyamulya.ac.id',
                'password': 'lecturer123',
                'first_name': 'Maria',
                'last_name': 'Santoso',
                'full_name': 'Dr. Maria Santoso',
                'role': 'lecturer',
                'is_lecturer': True
            },
            {
                'username': 'nathan.sunaryo',
                'email': 'nathan.sunaryo@prasetiyamulya.ac.id',
                'password': 'lecturer123',
                'first_name': 'Nathan',
                'last_name': 'Sunaryo',
                'full_name': 'Dr. Nathan Sunaryo',
                'role': 'lecturer',
                'is_lecturer': True
            },
            {
                'username': 'carla.irawan',
                'email': 'carla.irawan@prasetiyamulya.ac.id',
                'password': 'lecturer123',
                'first_name': 'Carla',
                'last_name': 'Irawan',
                'full_name': 'Dr. Carla Irawan',
                'role': 'lecturer',
                'is_lecturer': True
            }
        ]

        # Create students
        students = [
            {
                'username': 'andre.student',
                'email': 'andre@student.prasetiyamulya.ac.id',
                'password': 'student123',
                'first_name': 'Andre',
                'last_name': 'Student',
                'full_name': 'Andre Student',
                'role': 'student',
                'is_student': True,
                'major': 'digital_business_technology'
            },
            {
                'username': 'budi.student',
                'email': 'budi@student.prasetiyamulya.ac.id',
                'password': 'student123',
                'first_name': 'Budi',
                'last_name': 'Student',
                'full_name': 'Budi Student',
                'role': 'student',
                'is_student': True,
                'major': 'artificial_intelligence_and_robotics'
            },
            {
                'username': 'clara.student',
                'email': 'clara@student.prasetiyamulya.ac.id',
                'password': 'student123',
                'first_name': 'Clara',
                'last_name': 'Student',
                'full_name': 'Clara Student',
                'role': 'student',
                'is_student': True,
                'major': 'product_design_innovation'
            }
        ]

        created_lecturers = {}
        created_students = {}

        # Create lecturer accounts
        for lecturer_data in lecturers:
            lecturer, created = User.objects.get_or_create(
                username=lecturer_data['username'],
                defaults=lecturer_data
            )
            if created:
                lecturer.set_password(lecturer_data['password'])
                lecturer.save()
                self.stdout.write(f"Created lecturer: {lecturer.username}")
            created_lecturers[lecturer_data['username']] = lecturer

        # Create student accounts
        for student_data in students:
            student, created = User.objects.get_or_create(
                username=student_data['username'],
                defaults=student_data
            )
            if created:
                student.set_password(student_data['password'])
                student.save()
                self.stdout.write(f"Created student: {student.username}")
            created_students[student_data['username']] = student

        # Create courses
        courses_data = [
            {
                'code': 'DBT201',
                'name': 'Data & Business Technology',
                'lecturer': created_lecturers['maria.santoso'],
                'schedule': {
                    'day': 'Mon',
                    'start_time': time(9, 0),
                    'end_time': time(10, 30),
                    'room': 'B201'
                }
            },
            {
                'code': 'AIR220',
                'name': 'Robotics Fundamentals',
                'lecturer': created_lecturers['nathan.sunaryo'],
                'schedule': {
                    'day': 'Wed',
                    'start_time': time(13, 0),
                    'end_time': time(15, 0),
                    'room': 'Lab 3'
                }
            },
            {
                'code': 'PDI105',
                'name': 'Design Thinking Studio',
                'lecturer': created_lecturers['carla.irawan'],
                'schedule': {
                    'day': 'Fri',
                    'start_time': time(8, 30),
                    'end_time': time(10, 0),
                    'room': 'Studio 1'
                }
            }
        ]

        # Create courses and schedules
        current_semester = "Fall 2023"
        for course_data in courses_data:
            schedule_data = course_data.pop('schedule')
            course, created = Course.objects.get_or_create(
                code=course_data['code'],
                defaults=course_data
            )
            if created:
                self.stdout.write(f"Created course: {course.code}")

            schedule, created = CourseSchedule.objects.get_or_create(
                course=course,
                defaults=schedule_data
            )
            if created:
                self.stdout.write(f"Created schedule for {course.code}")

            # Enroll students in courses
            for student in created_students.values():
                enrollment, created = Enrollment.objects.get_or_create(
                    student=student,
                    course=course,
                    semester=current_semester
                )
                if created:
                    self.stdout.write(f"Enrolled {student.username} in {course.code}")

                    # Add some sample scores
                    assessments = [
                        ('Midterm', 40.0),
                        ('Assignment 1', 20.0),
                        ('Assignment 2', 20.0)
                    ]
                    for assessment_name, weight in assessments:
                        score = Score.objects.create(
                            enrollment=enrollment,
                            assessment_name=assessment_name,
                            score=85.0,  # Example score
                            weight=weight
                        )
                        self.stdout.write(f"Added {assessment_name} score for {student.username} in {course.code}")

        self.stdout.write(self.style.SUCCESS('Successfully created dummy data'))