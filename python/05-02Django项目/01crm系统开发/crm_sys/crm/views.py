from django.shortcuts import render, HttpResponse, redirect
from django.contrib.auth.decorators import login_required
from crm import models
from crm import forms
from django import conf
from django.views.decorators.csrf import csrf_exempt
from django.utils.timezone import datetime
import os
import json
from django.db.utils import IntegrityError


# Create your views here.
@login_required
def dashboard(request):
    return render(request, 'crm/dashboard.html')


@login_required
def stu_enrollment(request):
    customers = models.CustomerInfo.objects.all()
    class_lists = models.ClassList.objects.all()
    if request.method == 'POST':
        customer_id = request.POST.get('customer_id')
        class_grade_id = request.POST.get('class_grade_id')
        try:
            enrollment_obj = models.StudentEnrollment.objects.create(
                customer_id=customer_id,
                class_grade_id=class_grade_id,
                consulant_id=request.user.userprofile.id
            )
        except IntegrityError as e:  # 代表已经生成报名表
            enrollment_obj = models.StudentEnrollment.objects.get(customer_id=customer_id,
                                                                  class_grade_id=class_grade_id)
            if enrollment_obj.contract_agreed:
                return redirect('/crm/stu_enrollment/%s/contract_audit/' % enrollment_obj.id)

        enrollment_link = 'http://localhost:8000/crm/enrollment/%s/' % enrollment_obj.id

    return render(request, 'crm/stu_enrollment.html', locals())


def enrollment(request, enrollment_id):
    """学员在线报名表地址"""
    enrollment_obj = models.StudentEnrollment.objects.get(id=enrollment_id)
    if enrollment_obj.contract_agreed:
        return HttpResponse("报名合同正在审核中....")
    if request.method == 'POST':
        # print('enrollment:' ,request.POST)
        customer_form = forms.CustomerForm(instance=enrollment_obj.customer, data=request.POST)
        if customer_form.is_valid():
            # print(customer_form.cleaned_data)
            # customer_form.save()
            enrollment_obj.contract_agreed = True
            enrollment_obj.contract_signed_date = datetime.now()
            enrollment_obj.save()
            return HttpResponse('您已成功提交报名信息，请等待审核')

        # print('form err',customer_form.errors)
    else:
        customer_form = forms.CustomerForm(instance=enrollment_obj.customer)
    # 列出已上传的文件
    uploaded_files = []
    enrollment_upload_dir = os.path.join(conf.settings.CRM_FILE_UPLOAD_DIR, enrollment_id)
    if os.path.isdir(enrollment_upload_dir):
        uploaded_files = os.listdir(enrollment_upload_dir)

    return render(request, 'crm/enrollment.html', locals())


@csrf_exempt
def enrollment_fileupload(request, enrollment_id):
    # print(request.FILES)
    # print(conf.settings.CRM_FILE_UPLOAD_DIR)

    enrollment_upload_dir = os.path.join(conf.settings.CRM_FILE_UPLOAD_DIR, enrollment_id)
    if not os.path.isdir(enrollment_upload_dir):
        os.mkdir(enrollment_upload_dir)

    file_obj = request.FILES.get('file')

    if len(os.listdir(enrollment_upload_dir)) <= 2:

        with open(os.path.join(enrollment_upload_dir, file_obj.name), 'wb') as f:
            for chunks in file_obj.chunks():
                f.write(chunks)
    else:
        return HttpResponse(json.dumps({'status': False, 'err_msg': 'max upload limit is 2'}))

    return HttpResponse(json.dumps({'status': True}))


@login_required
def contract_audit(request, enrollment_id):
    enrollment_obj = models.StudentEnrollment.objects.get(id=enrollment_id)
    if request.method == 'POST':

        enrollment_form = forms.EnrollmentForm(instance=enrollment_obj,data=request.POST)
        if enrollment_form.is_valid():
            enrollment_form.save()
            stu_obj = models.Student.objects.get_or_create(customer=enrollment_obj.customer)[0]
            stu_obj.class_grades.add(enrollment_obj.class_grade_id)
            stu_obj.save()

            enrollment_obj.customer.status = 1
            enrollment_obj.customer.save()
            return redirect('/useradmin/crm/customerinfo/%s/change/'%enrollment_obj.customer.id)
    else:

        customer_form = forms.CustomerForm(instance=enrollment_obj.customer)

        enrollment_form = forms.EnrollmentForm(instance=enrollment_obj)

    return render(request, 'crm/contract_audit.html',locals())
