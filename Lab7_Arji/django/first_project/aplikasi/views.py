from django.http import HttpResponse
from django.template import loader
from .models import Mahasiswa
from django.shortcuts import redirect

def mahasiswa(request):
    if request.method == "POST":
        action = request.POST.get("action")

        if action == "add":
            Mahasiswa.objects.create(
                firstname=request.POST.get("firstname"),
                lastname=request.POST.get("lastname"),
                nim=request.POST.get("nim"),
                jurusan=request.POST.get("jurusan"),
            )
        elif action == "update":
            mhs = Mahasiswa.objects.get(id=request.POST.get("id"))
            mhs.firstname = request.POST.get("firstname")
            mhs.lastname = request.POST.get("lastname")
            mhs.nim = request.POST.get("nim")
            mhs.jurusan = request.POST.get("jurusan")
            mhs.save()

        elif action == "delete":
            Mahasiswa.objects.filter(id=request.POST.get("id")).delete()

            return redirect("mahasiswa")
        
    mymahasiswa = Mahasiswa.objects.all().values()
    template = loader.get_template("index.html")
    context = {
        "mymahasiswa": mymahasiswa,
    }
    return HttpResponse(template.render(context, request))

