"""
@File  : useradmin.py
@Author: sen
@Date  : 2018/7/28 10:00
@Software  : PyCharm
@Purpose   :useradmin管理
"""
from useradmin.sites import site
from useradmin.admin_base import BaseUserAdmin

from crm import models


# print('crm useradmin ...')


class CustomerAdmin(BaseUserAdmin):
    list_display = ['id', 'name', 'source', 'contact_type', 'contact', 'consultant', 'consult_content', 'status',
                    'date']  # 显示字段
    list_filter = ['source', 'consultant', 'status', 'date']  # 过滤字段
    # search_fields = ['name', 'contact', 'consultant']  # 可搜索字段，由于有外键关联的字段，所以必须写明是外键的哪个字段
    search_fields = ['name', 'contact', 'consultant__name']
    readonly_fields = ['contact', 'status']  # 只读，不可修改字段
    filter_horizontal = ['consult_courses']
    # list_per_page = 5
    actions = ['change_status', ]

    def change_status(self, request, querysets):
        # print('admin action', self, request, querysets)
        # print('----------',self,request,querysets)
        querysets.update(status=0)

class StudentAdmin(BaseUserAdmin):
    filter_horizontal = ['class_grades']

site.register(models.CustomerInfo, CustomerAdmin)
site.register(models.Role)
site.register(models.Menus)
site.register(models.Course)
site.register(models.ClassList)
site.register(models.CourseRecord)
site.register(models.StudyRecord)
site.register(models.UserProfile)
site.register(models.Student,StudentAdmin)
