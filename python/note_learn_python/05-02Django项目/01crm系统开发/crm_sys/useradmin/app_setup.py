"""
@File  : app_setup.py
@Author: sen
@Date  : 2018/7/28 16:02
@Software  : PyCharm
@Purpose   :
"""
from django import conf


def useradmin_auto_discover():

    for app_name in conf.settings.INSTALLED_APPS:
        # mod = importlib.import_module(app_name, 'kingadmin')
        try:
            mod = __import__("%s.useradmin" % app_name)
            # print(mod.useradmin)
        except ImportError:
            pass


