from django.core.paginator import Paginator, PageNotAnInteger, EmptyPage
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django import conf
from django.db.models import Q
from useradmin import app_setup
from useradmin import form_handle
import json

from useradmin import permissions
from useradmin.sites import site
app_setup.useradmin_auto_discover()



# # print('sites', site.enabled_admins)
# for k,v in site.enabled_admins.items():
#     for table_name,admin_class in v.items():
#         print(table_name,id(admin_class))


# Create your views here.

def app_index(request):

    return render(request, 'useradmin/app_index.html', {'site': site})


def get_filter_result(request, querysets):
    filter_conditions = {}
    for key, value in request.GET.items():
        if key in ('_page', '_o', '_q'):
            continue
        if value:
            filter_conditions[key] = value

    # print('filter_conditions', filter_conditions)
    return querysets.filter(**filter_conditions), filter_conditions


def get_search_result(request, querysets, admin_class):
    search_key = request.GET.get('_q')
    if search_key:
        q = Q()
        q.connector = 'OR'

        for search_field in admin_class.search_fields:
            q.children.append(('%s__contains' % search_field, search_key))

        return querysets.filter(q)
    else:
        return querysets


def get_orderby_result(request, querysets, admin_class):
    """排序"""

    current_ordered_column = {}
    orderby_index = request.GET.get('_o')
    # print(orderby_index)
    if orderby_index:  # 有排序
        # orderby_index = orderby_index.strip()
        orderby_key = admin_class.list_display[abs(int(orderby_index))]

        # 为了让前端知道当前的排序的列
        current_ordered_column[orderby_key] = orderby_index

        if orderby_index.startswith('-'):
            orderby_key = '-' + orderby_key
        # print("==========")
        # print(orderby_key)
        # print(querysets.order_by(orderby_key))
        # print(current_ordered_column)
        return querysets.order_by(orderby_key), current_ordered_column
    else:
        # print('---------')
        return querysets, current_ordered_column

@permissions.check_permission
@login_required
def table_obj_list(request, app_name, model_name):
    """取出指定的model里的数据返回给前端"""
    # print('app_name,model_name:',site.enabled_admins[app_name][model_name])
    admin_class = site.enabled_admins[app_name][model_name]
    # print(request.GET)
    # 打印结果：<QueryDict: {'source': ['1'], 'consultant': ['2'], 'status': ['0'], 'date': ['2018-07-01 11:19:26.324492']}>
    # print('admin_class',admin_class.model)

    if request.method == 'POST':
        selected_action = request.POST.get('action')
        selected_ids = json.loads(request.POST.get('selected_ids'))
        # print(selected_action,selected_ids)
        if not selected_action:
            # 如果有action参数，代表正常action 没有代表可能是一个删除动作
            if selected_ids:# 这些选中的数据都要被删除
                admin_class.model.objects.filter(id__in=selected_ids).delete()
        else:
            selected_objs = admin_class.model.objects.filter(id__in=selected_ids)
            admin_action_func = getattr(admin_class,selected_action)
            response = admin_action_func(request,selected_objs)
            if response:
                return response

    querysets = admin_class.model.objects.order_by('-id')
    # querysets = admin_class.model.objects.all()
    # filter_conditions中有筛选条件，赋值给admin_class
    querysets, filter_conditions = get_filter_result(request, querysets)
    admin_class.filter_conditions = filter_conditions

    # search queryset result
    querysets = get_search_result(request, querysets, admin_class)
    admin_class.search_key = request.GET.get('_q', '')

    # sorted_querysets
    # print(querysets)
    querysets, sorted_column = get_orderby_result(request, querysets, admin_class)

    paginator = Paginator(querysets, admin_class.list_per_page)  # 获取对象，每页几个
    page = request.GET.get('_page')
    try:
        querysets = paginator.page(page)
    except PageNotAnInteger:
        querysets = paginator.page(1)
    except EmptyPage:
        querysets = paginator.page(paginator.num_pages)

    return render(request, 'useradmin/table_obj_list.html',
                  # {'querysets': querysets, 'admin_class': admin_class, 'sorted_column': sorted_column
                  locals())

@permissions.check_permission
@login_required
def table_obj_change(request, app_name, model_name, obj_id):
    """useradmin 数据修改页面"""
    admin_class = site.enabled_admins[app_name][model_name]
    model_form = form_handle.create_dynamic_model_form(admin_class)
    obj = admin_class.model.objects.get(id=obj_id)
    if request.method == 'GET':
        form_obj = model_form(instance=obj)
    elif request.method == 'POST':
        form_obj = model_form(instance=obj, data=request.POST)
        # print(form_obj)
        if form_obj.is_valid():
            form_obj.save()
            return redirect('/useradmin/%s/%s/' % (app_name, model_name))

    # from crm.forms import CustomerForm
    # form_obj = CustomerForm()

    return render(request, 'useradmin/table_obj_change.html', locals())

@permissions.check_permission
def table_obj_add(request, app_name, model_name):
    """添加数据"""
    admin_class = site.enabled_admins[app_name][model_name]
    model_form = form_handle.create_dynamic_model_form(admin_class, form_add=True)
    if request.method == 'GET':
        form_obj = model_form()
    elif request.method == 'POST':
        form_obj = model_form(data=request.POST)
        if form_obj.is_valid():
            form_obj.save()
            return redirect('/useradmin/%s/%s/' % (app_name, model_name))

    return render(request, 'useradmin/table_obj_add.html', locals())

@permissions.check_permission
def table_obj_delete(request, app_name, model_name, obj_id):
    admin_class = site.enabled_admins[app_name][model_name]
    obj = admin_class.model.objects.get(id=obj_id)
    if request.method == 'POST':
        obj.delete()
        return redirect('/useradmin/{app_name}/{model_name}/'.format(app_name=app_name,model_name=model_name))
    return render(request, 'useradmin/table_obj_delete.html', locals())



def acc_login(request):
    error_message = ''
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')

        user = authenticate(username=username, password=password)
        # 如果验证成功，返回的是用户对象
        # 不成功返回None

        if user:
            login(request, user)  # 生成session,真正的登录
            # print(request.GET.get('next'))
            return redirect(request.GET.get('next', '/useradmin/'))
        else:
            error_message = 'username or password is error'
    return render(request, 'useradmin/login.html', {'error_message': error_message})


def acc_logout(request):
    logout(request)
    return redirect('/login/')
