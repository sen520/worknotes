"""
@File  : sites.py
@Author: sen
@Date  : 2018/7/28 15:26
@Software  : PyCharm
@Purpose   :
"""
from useradmin.admin_base import BaseUserAdmin


class AdminSite(object):
    def __init__(self):
        self.enabled_admins = {}

    def register(self, model_class, admin_class=None):
        """注册admin表"""
        # print(model_class, admin_class)

        app_name = model_class._meta.app_label  # 获取系统中的app
        model_name = model_class._meta.model_name

        if not admin_class: # 为了避免多个model共享同一个BaseUserAdmin内存对象
            admin_class = BaseUserAdmin()
        else:
            admin_class = admin_class()
        admin_class.model = model_class  # 把model_class 赋值给了admin_class

        if app_name not in self.enabled_admins:
            self.enabled_admins[app_name] = {}
        self.enabled_admins[app_name][model_name] = admin_class


site = AdminSite()
