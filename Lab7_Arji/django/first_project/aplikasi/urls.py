from django.urls import path
from . import views

urlpatterns = [
    path('mahasiswa/', views.mahasiswa, name='mahasiswa')
]