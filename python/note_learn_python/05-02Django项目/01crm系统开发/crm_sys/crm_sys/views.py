from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login,logout


# Create your views here.

@login_required
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
            return redirect(request.GET.get('next','/crm/'))
        else:
            error_message = 'username or password is error'
    return render(request, 'login.html',{'error_message':error_message})


def acc_logout(request):
    logout(request)
    return redirect('/login/')