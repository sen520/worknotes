"""
@File  : useradmin.py
@Author: sen
@Date  : 2018/7/28 10:00
@Software  : PyCharm
@Purpose   :useradmin管理
"""
from useradmin.sites import site
from student import models
from useradmin.admin_base import BaseUserAdmin
# print('student useradmin ...')


class TestAdmin(BaseUserAdmin):
    list_display = ['name']  # 显示字段


site.register(models.Test, TestAdmin)
