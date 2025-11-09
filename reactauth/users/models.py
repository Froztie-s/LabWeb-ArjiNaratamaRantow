from django.contrib.auth.models import AbstractUser
from django.db import models


class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('student', 'Student'),
        ('instructor', 'Instructor'),
    )

    MAJOR_CHOICES = (
        ('artificial_intelligence_and_robotics', 'AIR'),
        ('business_mathematics', 'BM'),
        ('digital_business_technology', 'DBT'),
        ('product_design_innovation', 'PDI'),
        ('energy_business_technology', 'EBT'),
        ('food_business_technology', 'FBT'),
    )

    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=255)
    major = models.CharField(max_length=100, choices=MAJOR_CHOICES, blank=True, null=True)
    role = models.CharField(max_length=50, blank=True, null=True, choices=ROLE_CHOICES)
    is_student = models.BooleanField(default=False)
    is_lecturer = models.BooleanField(default=False)

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email']

    def __str__(self):
        return self.email or self.username


class Course(models.Model):
    code = models.CharField(max_length=10, unique=True)
    name = models.CharField(max_length=255)
    lecturer = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, related_name='courses_taught')
    description = models.TextField(blank=True)

    def __str__(self):
        return f"{self.code} - {self.name}"


class CourseSchedule(models.Model):
    DAY_CHOICES = [
        ('Mon', 'Monday'),
        ('Tue', 'Tuesday'),
        ('Wed', 'Wednesday'),
        ('Thu', 'Thursday'),
        ('Fri', 'Friday'),
    ]

    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='schedules')
    day = models.CharField(max_length=3, choices=DAY_CHOICES)
    start_time = models.TimeField()
    end_time = models.TimeField()
    room = models.CharField(max_length=10)

    class Meta:
        unique_together = ['course', 'day', 'start_time']

    def __str__(self):
        return f"{self.course.code} - {self.day} {self.start_time}-{self.end_time}"


class Enrollment(models.Model):
    student = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='enrollments')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrollments')
    semester = models.CharField(max_length=20)  # e.g., "Fall 2023"
    enrollment_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['student', 'course', 'semester']

    def __str__(self):
        return f"{self.student.username} - {self.course.code}"


class Score(models.Model):
    enrollment = models.ForeignKey(Enrollment, on_delete=models.CASCADE, related_name='scores')
    assessment_name = models.CharField(max_length=100)  # e.g., "Midterm", "Final", "Assignment 1"
    score = models.DecimalField(max_digits=5, decimal_places=2)
    weight = models.DecimalField(max_digits=5, decimal_places=2)  # Percentage weight of this score
    date_added = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.enrollment} - {self.assessment_name}: {self.score}"
