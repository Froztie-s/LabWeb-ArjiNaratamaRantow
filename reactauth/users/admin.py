from django.contrib import admin
from .models import CustomUser, Course, CourseSchedule, Enrollment, Score
from django.contrib.auth.admin import UserAdmin


# Register your models here.

class CustomUserAdmin(UserAdmin):
    list_display = ('email', 'username', 'full_name', 'major', 'role')

    list_filter = ('role', 'major')

    fieldsets = (
        (None, {'fields': ('email', 'username', 'password')}),
        ('Personal Info', {'fields': ('full_name', 'major', 'role')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username', 'full_name', 'major', 'role', 'password1', 'password2'),
        }),
    )

    ordering = ('email',)

admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(Course)
admin.site.register(CourseSchedule)
admin.site.register(Enrollment)
admin.site.register(Score)