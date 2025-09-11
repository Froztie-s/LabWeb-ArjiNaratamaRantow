from django.http import HttpResponse
from django.template import loader
from .models import Mahasiswa

def mahasiswa(request):
    mymahasiswa=Mahasiswa.objects.all().values()
    template = loader.get_template("index.html")

    context= {
        'mymahasiswa' : mymahasiswa
    }

    return HttpResponse(template.render(context,request))

# Create your views here.
