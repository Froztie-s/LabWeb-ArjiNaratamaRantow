from django.contrib.auth import authenticate, get_user_model
from rest_framework import permissions, status
from rest_framework.authentication import TokenAuthentication
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Course, CourseSchedule, Enrollment, Score

User = get_user_model()


def _apply_no_cache_headers(response):
    """Prevent dashboard responses from being cached (no back button revisit)."""
    response['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
    response['Pragma'] = 'no-cache'
    response['Expires'] = '0'
    return response


def summarize_scores(score_qs):
    summary = {'classwork': 0, 'midterm': 0, 'finals': 0}
    for score in score_qs:
        label = score.assessment_name.lower()
        value = float(score.score)
        if 'class' in label or 'assignment' in label:
            summary['classwork'] = value
        elif 'mid' in label:
            summary['midterm'] = value
        elif 'final' in label:
            summary['finals'] = value
    return summary


class BaseRegistrationView(APIView):
    permission_classes = [permissions.AllowAny]
    role_flag = None  # 'is_student' or 'is_lecturer'
    role_value = None  # optional string stored in CustomUser.role

    def post(self, request):
        required_fields = ['username', 'password', 'email', 'first_name', 'last_name']
        missing = [field for field in required_fields if not request.data.get(field)]
        if missing:
            return Response(
                {'detail': f"Missing required fields: {', '.join(missing)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        full_name = f"{request.data.get('first_name')} {request.data.get('last_name')}".strip()

        user = User.objects.create_user(
            username=request.data['username'],
            password=request.data['password'],
            email=request.data['email'],
            first_name=request.data['first_name'],
            last_name=request.data['last_name'],
            full_name=full_name,
        )

        if self.role_flag:
            setattr(user, self.role_flag, True)
        if self.role_value:
            user.role = self.role_value
        user.save()

        token = Token.objects.create(user=user)
        return Response({'token': token.key}, status=status.HTTP_201_CREATED)


class StudentRegistrationView(BaseRegistrationView):
    role_flag = 'is_student'
    role_value = 'student'


class LecturerRegistrationView(BaseRegistrationView):
    role_flag = 'is_lecturer'
    role_value = 'instructor'


class UnifiedRegistrationView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        required_fields = ['first_name', 'last_name', 'email', 'username', 'password']
        missing = [field for field in required_fields if not request.data.get(field)]
        if missing:
            return Response(
                {'detail': f"Missing required fields: {', '.join(missing)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        email = request.data['email'].strip().lower()
        role = None
        if email.endswith('@student.prasetiyamulya.ac.id'):
            role = 'student'
        elif email.endswith('@prasetiyamulya.ac.id'):
            role = 'lecturer'

        if role is None:
            return Response(
                {'detail': 'Email must use a Prasetiya Mulya domain.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        full_name = f"{request.data.get('first_name')} {request.data.get('last_name')}".strip()

        user = User.objects.create_user(
            username=request.data['username'],
            password=request.data['password'],
            email=email,
            first_name=request.data['first_name'],
            last_name=request.data['last_name'],
            full_name=full_name,
        )
        user.role = role
        user.is_student = role == 'student'
        user.is_lecturer = role == 'lecturer'
        user.save()

        token = Token.objects.create(user=user)
        return Response(
            {
                'user': {
                    'id': user.id,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'email': user.email,
                    'username': user.username,
                    'role': user.role,
                },
                'token': token.key,
            },
            status=status.HTTP_201_CREATED,
        )


class UserLoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get('username') or request.data.get('usernameOrEmail')
        password = request.data.get('password')

        if not username or not password:
            return Response({'detail': 'Username/Email and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

        # First try to authenticate with the provided username/email directly
        user = authenticate(request, username=username, password=password)
        
        # If that fails and the username looks like an email, try to find the user by email
        if user is None and '@' in username:
            try:
                user_obj = User.objects.get(email=username)
                # Try to authenticate with the found username
                user = authenticate(request, username=user_obj.username, password=password)
            except User.DoesNotExist:
                return Response({'detail': 'Invalid credentials.'}, status=status.HTTP_401_UNAUTHORIZED)
        
        if user is None:
            return Response({'detail': 'Invalid credentials.'}, status=status.HTTP_401_UNAUTHORIZED)

        token, _ = Token.objects.get_or_create(user=user)

        if user.is_student:
            user_role = 'student'
        elif user.is_lecturer:
            user_role = 'lecturer'
        else:
            user_role = 'unknown'

        return Response({
            'token': {
                'access': token.key,
                'refresh': token.key  # Since you're using token auth, we'll use same token for both
            },
            'user': {
                'id': user.id,
                'email': user.email,
                'username': user.username,
                'full_name': user.full_name,
                'role': user_role,
            }
        }, status=status.HTTP_200_OK)


class UserLogoutView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        Token.objects.filter(user=request.user).delete()
        return Response({'detail': 'Successfully logged out.'}, status=status.HTTP_200_OK)


class StudentDashboardView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if not request.user.is_student:
            return Response({'detail': 'Forbidden.'}, status=status.HTTP_403_FORBIDDEN)

        # Get current semester enrollments for the student
        current_semester = "Fall 2023"  # You might want to make this dynamic
        enrollments = (
            Enrollment.objects.filter(
                student=request.user,
                semester=current_semester,
            )
            .select_related('course', 'course__lecturer')
            .prefetch_related('scores')
        )

        classes = []
        for enrollment in enrollments:
            course = enrollment.course
            schedule = course.schedules.first()
            schedule_info = None
            if schedule:
                schedule_info = {
                    'day': schedule.day,
                    'start': schedule.start_time.strftime('%H:%M'),
                    'end': schedule.end_time.strftime('%H:%M'),
                    'room': schedule.room,
                }

            classes.append({
                'id': course.code,
                'code': course.code,
                'name': course.name,
                'schedule': schedule_info,
                'lecturer': course.lecturer.get_full_name() if course.lecturer else 'TBA',
                'grades': summarize_scores(enrollment.scores.all()),
            })

        response = Response(classes, status=status.HTTP_200_OK)
        return _apply_no_cache_headers(response)


class LecturerDashboardView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if not request.user.is_lecturer:
            return Response({'detail': 'Forbidden.'}, status=status.HTTP_403_FORBIDDEN)
            
        # Get courses taught by the lecturer
        courses = Course.objects.filter(lecturer=request.user).prefetch_related('schedules', 'enrollments')
        
        courses_data = []
        for course in courses:
            schedule = course.schedules.first()  # Get the first schedule for this course
            enrollments = course.enrollments.select_related('student').all()
            
            # Calculate course statistics
            total_students = enrollments.count()
            course_data = {
                'id': course.code,
                'code': course.code,
                'name': course.name,
                'totalStudents': total_students,
                'schedule': {
                    'day': schedule.day if schedule else None,
                    'start': schedule.start_time.strftime('%H:%M') if schedule else None,
                    'end': schedule.end_time.strftime('%H:%M') if schedule else None,
                    'room': schedule.room if schedule else None
                } if schedule else None,
                'students': [{
                    'id': enrollment.student.id,
                    'name': enrollment.student.full_name,
                    'email': enrollment.student.email,
                    'scores': [{
                        'name': score.assessment_name,
                        'score': float(score.score),
                        'weight': float(score.weight)
                    } for score in enrollment.scores.all()]
                } for enrollment in enrollments]
            }
            courses_data.append(course_data)
        
        response = Response(courses_data, status=status.HTTP_200_OK)
        return _apply_no_cache_headers(response)


class CourseStudentsView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    SCORE_MAP = {
        'classwork': ('Classwork', 30.0),
        'midterm': ('Midterm', 30.0),
        'finals': ('Final Exam', 40.0),
    }

    def _get_course(self, course_code):
        lookup = course_code.upper()
        try:
            return Course.objects.get(code__iexact=lookup)
        except Course.DoesNotExist:
            return None

    def _grades_from_scores(self, enrollment):
        grades = {key: 0 for key in self.SCORE_MAP}
        for score in enrollment.scores.all():
            name = score.assessment_name.lower()
            if 'class' in name or 'assignment' in name:
                grades['classwork'] = float(score.score)
            elif 'mid' in name:
                grades['midterm'] = float(score.score)
            elif 'final' in name:
                grades['finals'] = float(score.score)
        return grades

    def _enrollment_response(self, enrollment):
        student = enrollment.student
        return {
            'id': student.id,
            'name': student.full_name or student.get_full_name() or student.username,
            'email': student.email,
            'grades': self._grades_from_scores(enrollment),
        }

    def get(self, request, course_id):
        course = self._get_course(course_id)
        if not course:
            return Response({'detail': 'Course not found.'}, status=status.HTTP_404_NOT_FOUND)

        if not request.user.is_staff and request.user != course.lecturer:
            return Response({'detail': 'Forbidden.'}, status=status.HTTP_403_FORBIDDEN)

        enrollments = (
            Enrollment.objects.filter(course=course)
            .select_related('student')
            .prefetch_related('scores')
        )

        data = [self._enrollment_response(enrollment) for enrollment in enrollments]
        return Response(data, status=status.HTTP_200_OK)

    def patch(self, request, course_id, student_id):
        course = self._get_course(course_id)
        if not course:
            return Response({'detail': 'Course not found.'}, status=status.HTTP_404_NOT_FOUND)

        if not request.user.is_staff and request.user != course.lecturer:
            return Response({'detail': 'Forbidden.'}, status=status.HTTP_403_FORBIDDEN)

        try:
            enrollment = Enrollment.objects.select_related('student').get(
                course=course, student_id=student_id
            )
        except Enrollment.DoesNotExist:
            return Response({'detail': 'Enrollment not found.'}, status=status.HTTP_404_NOT_FOUND)

        updated = {}
        for key, (label, default_weight) in self.SCORE_MAP.items():
            if key not in request.data:
                continue
            value = float(request.data[key])
            score_obj, _created = Score.objects.get_or_create(
                enrollment=enrollment,
                assessment_name=label,
                defaults={'score': value, 'weight': default_weight},
            )
            score_obj.score = value
            if score_obj.weight in (None, 0):
                score_obj.weight = default_weight
            score_obj.save()
            updated[key] = value

        response_data = self._enrollment_response(enrollment)
        if updated:
            response_data['grades'].update(updated)
        return Response(response_data, status=status.HTTP_200_OK)
