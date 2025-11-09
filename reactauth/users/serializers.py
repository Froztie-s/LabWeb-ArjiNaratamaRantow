from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
import re

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password_confirmation = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
    )

    class Meta:
        model = User
        fields = (
            'email',
            'username',
            'full_name',
            'major',
            'role',
            'password',
            'password_confirmation',
        )
        extra_kwargs = {
            'password': {'write_only': True, 'style': {'input_type': 'password'}},
            'full_name': {'required': True},
            'major': {'required': False, 'allow_blank': True},
            'role': {'required': True},
        }

    def validate_email(self, value):
        email = value.lower()
        student_pattern = re.compile(r'^[a-zA-Z0-9._%+-]+@student\.prasetiyamulya\.ac\.id$')
        instructor_pattern = re.compile(r'^[a-zA-Z0-9._%+-]+@prasetiyamulya\.ac\.id$')

        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError("Email is already in use.")

        if student_pattern.match(email):
            self._detected_role = 'student'
        elif instructor_pattern.match(email):
            self._detected_role = 'instructor'
        else:
            raise serializers.ValidationError("Invalid email domain. Use a valid Prasetiya Mulya email.")

        return email

    def validate(self, attrs):
        if attrs.get('password') != attrs.get('password_confirmation'):
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        password = validated_data.pop('password')
        validated_data.pop('password_confirmation', None)

        email = validated_data['email'].lower()
        username = validated_data.get('username') or email.split('@')[0]
        validated_data['email'] = email
        validated_data['username'] = username

        detected_role = getattr(self, '_detected_role', None)
        if detected_role:
            validated_data['role'] = detected_role

        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate_emails(self, value):
        return value.lower()
    
    @classmethod
    
    def get_token(cls, user):
        token = super().get_token(user)

        
        # Add custom claims
        token['email'] = user.email
        token['full_name'] = user.full_name
        token['major'] = user.major
        token['role'] = user.role

        return token

    def validate(self, attrs):
        data = super().validate(attrs)

        token_data = {
            'access': data['access'],
            'refresh': data['refresh'],
        }

        data.update({
            'email': self.user.email,
            'username': self.user.username,
            'full_name': self.user.full_name,
            'major': self.user.major,
            'role': self.user.role,
            'token': token_data,
        })

        return data
