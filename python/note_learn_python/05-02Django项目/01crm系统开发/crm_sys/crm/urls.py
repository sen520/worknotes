from django.urls import path
from . import views

urlpatterns = [
    path('', views.dashboard, name='sales_dashboard'),
    path('stu_enrollment', views.stu_enrollment, name='stu_enrollment'),
    path('enrollment/<str:enrollment_id>/',views.enrollment,name='enrollment'),
    path('enrollment/<str:enrollment_id>/fileupload/',views.enrollment_fileupload,name='enrollment_fileupload'),
    path('stu_enrollment/<str:enrollment_id>/contract_audit/',views.contract_audit,name='contract_audit'),
]
