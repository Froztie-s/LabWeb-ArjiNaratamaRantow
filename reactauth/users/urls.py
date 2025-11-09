from django.urls import path

from .views import (
    LecturerDashboardView,
    LecturerRegistrationView,
    CourseStudentsView,
    StudentDashboardView,
    StudentRegistrationView,
    UserLoginView,
    UserLogoutView,
    UnifiedRegistrationView,
)

urlpatterns = [
    path('register/', UnifiedRegistrationView.as_view(), name='register'),
    path('register/student/', StudentRegistrationView.as_view(), name='register_student'),
    path('register/lecturer/', LecturerRegistrationView.as_view(), name='register_lecturer'),
    path('login/', UserLoginView.as_view(), name='login'),
    path('logout/', UserLogoutView.as_view(), name='logout'),
    path('dashboard/student/', StudentDashboardView.as_view(), name='student_dashboard'),
    path('dashboard/lecturer/', LecturerDashboardView.as_view(), name='lecturer_dashboard'),
    path('courses/<str:course_id>/students/', CourseStudentsView.as_view(), name='course_students'),
    path('courses/<str:course_id>/students/<int:student_id>/grades/', CourseStudentsView.as_view(), name='course_student_grades'),
]
