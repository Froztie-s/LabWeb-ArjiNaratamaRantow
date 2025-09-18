from django.db import models

# Create your models here.
class Mahasiswa(models.Model):
    nim = models.IntegerField(blank=False, null=False)
    firstname = models.CharField(max_length=255, blank=False, null=False)
    lastname = models.CharField(max_length=255, blank=False, null=False)
    jurusan = models.CharField(max_length=100, blank=False, null=False)

    def __str__(self):
        return f"{self.firstname} {self.lastname}"