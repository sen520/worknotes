"""
@Author: sen
@Date  : 2018/7/29 10:44
@Software  : PyCharm
@File    : admin_base.py
@Purpose   :基类
"""
from django.shortcuts import render, redirect
import json

class BaseUserAdmin(object):
    def __init__(self):
        self.actions.extend(self.default_actions)

    list_display = []
    list_filter = []
    search_fields = []
    readonly_fields = []
    filter_horizontal = []
    list_per_page = 20
    default_actions = ['delete_selected_objs']
    actions = []

    def delete_selected_objs(self, request, querysets):

        querysets_ids = json.dumps([i.id for i in querysets])
        return render(request, 'useradmin/table_obj_delete.html',{'admin_class':self,
                                                                  'objs':querysets,
                                                                  'querysets_ids':querysets_ids})


        # return redirect('/useradmin/%s/%s/')
