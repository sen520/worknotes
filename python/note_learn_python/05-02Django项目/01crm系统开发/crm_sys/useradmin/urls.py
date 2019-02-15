"""
@File  : urls.py
@Author: sen
@Date  : 2018/7/28 9:06
@Software  : PyCharm
@Purpose   :配置url
"""

from django.urls import path
from . import views

urlpatterns = [
    path('', views.app_index, name='app_index'),
    path('<str:app_name>/<str:model_name>/', views.table_obj_list, name='table_obj_list'),
    path('<str:app_name>/<str:model_name>/<int:obj_id>/change/', views.table_obj_change, name='table_obj_change'),
    path('<str:app_name>/<str:model_name>/add/', views.table_obj_add, name='table_obj_add'),
    path('<str:app_name>/<str:model_name>/<int:obj_id>/delete/', views.table_obj_delete, name='obj_delete'),
    path('login/', views.acc_login),
    path('logout/', views.acc_logout, name='logout'),
]
