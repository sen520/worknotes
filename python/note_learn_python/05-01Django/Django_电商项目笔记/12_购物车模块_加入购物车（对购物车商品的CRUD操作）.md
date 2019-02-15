
1.在goods模块包/templates目录下的detail.html中进行完善
- 完善1：在颜色，大小相应位置添加colorid sizeid
    
    ```
    <div class="color">
        <p class="p-item">颜色：</p>
        <ul class="MinImgList">
         
            {% for color in goods.getColors %}
                 <li class="MinImg  {% if forloop.first %}active{% endif %}" colorid="{{ color.id }}">
                    <img src="{{ MEDIA_URL }}{{ color.value }}" width="30px" height="30px">
                </li>
            {% endfor %}

        </ul>
    </div>
    <div class="size">
        <p class="p-item">
            尺码：
        </p>
        <ul class="size-list">
                {% for size in goods.getSizes %}
                    <li sizeid="{{ size.id }}" class="size-item {% if forloop.first %} active{% endif %}">{{ size.value }}</li>
                {% endfor %}


        </ul>
    </div>
    ```
- 完善2：在单独购买处添加隐藏域
    ```
    <form action="/cart/" method="post" >
        <input name="colorid" type="hidden">
        <input name="goodsid" type="hidden" value="{{ goods.id }}">
        <input name="sizeid" type="hidden">
        <input name="count" type="hidden">
        <input name="type" value="add" type="hidden"/>
        {% csrf_token %}
        <button class="male" onclick="goCart()">单独购买</button>
    </form>
    ```
    
- 完善3：在页面中添加goCart()js函数
    ```
     //单独购买
    function goCart() {
        $('form').children('input[name="colorid"]').val($('.MinImg.active').attr('colorid'))
        $('form').children('input[name="sizeid"]').val($('.size-item.active').attr('sizeid'))
        $('form').children('input[name="count"]').val($('.num').children('input[type="number"]').val())


    }
    ```
    
- 完善4：在"单独购买"所在表单添加action请求地址"/cart/"
    
2. 在项目包下的urls.py中添加映射路径
    ```
    from django.conf.urls import url, include
    from django.contrib import admin
    
    from .settings import DEBUG,MEDIA_ROOT
    
    urlpatterns = [
        url(r'^admin/', admin.site.urls),
        url(r'', include('goods.urls')),
        url(r'^user/', include('User.urls')),
        url(r'^cart/', include('cart.urls')),
        
    
    
    ]
    
    if DEBUG:
        from django.views.static import serve
        urlpatterns.append(url(r'media/(.*)',serve,kwargs={'document_root':MEDIA_ROOT}))
    ```

    

3. 创建cart新模块
```
python manage.py startapp cart
```

4. 在cart模块包下创建urls.py文件并添加映射路径

```
#coding=utf-8

from django.conf.urls import url
import views
urlpatterns=[
    url(r'^$',views.CartView.as_view()),

]

```

5. 在cart模块包下views.py文件中添加CartView类
```
# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.contrib.sessions.backends.cache import SessionStore
from django.http import HttpResponseRedirect, JsonResponse
from django.shortcuts import render

# Create your views here.
from django.views import View
from cartmanager import *


 

class CartView(View):
    def post(self,request):
        # 显式的告诉会话对象被修改了。默认情况下只有session被创建或修改才会被存储到数据库中
        request.session.modified=True

        #判断当前操作类型
        #加入购物车操作
        if request.POST.get('type')=='add':
            self.add(request)
            return HttpResponseRedirect('cart.html')
        #移除购物车操作
        elif request.POST.get('type')=='delete':
            self.delete(request)
            return JsonResponse({'result':True})

        #增加购物车商品数量操作
        elif request.POST.get('type')=='plus':
            self.plus(request)
            return JsonResponse({'result':True})

        #减少购物车商品数量操作
        elif request.POST.get('type')=='minus':
            self.minus(request)
            return JsonResponse({'result':True})



    def add(self,request):

        cart_manager = getCartManger(request)
        cart_manager.add(**request.POST.dict())

    def delete(self,request):
        cart_manager = getCartManger(request)
        cart_manager.delete(**request.POST.dict())



    def plus(self,request):
        cart_manager = getCartManger(request)

        cart_manager.update(step=1,**request.POST.dict())



    def minus(self,request):
        cart_manager = getCartManger(request)
        cart_manager.update(step=-1,**request.POST.dict())

 
```

6. cart模块包/models.py中添加CartItem模型类
```
# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models

# Create your models here.
from goods.models import Goods,Color,Size
from User.models import User

class CartItem(models.Model):
    goodsid = models.IntegerField()
    colorid = models.IntegerField()
    sizeid = models.IntegerField()
    count = models.PositiveIntegerField()#正整数
    user = models.ForeignKey(User)
    isdelete = models.BooleanField(default=False)

    class Meta:
        unique_together=['goodsid','colorid','sizeid']

    def goods(self):
        return Goods.objects.get(id=self.goodsid)

    def color(self):
        return Color.objects.get(id=self.colorid)

    def size(self):
        return Size.objects.get(id=self.sizeid)

    def total_price(self):
        return int(str(self.count))*float(str(self.goods().price))

```



7. 将cartmanager.py文件拷贝到cart模块包下
```
#coding=utf-8

from collections import OrderedDict
from models import *
from django.db.models import F

class CartManager(object):
    def add(self,goodsid,colorid,sizeid,count,*args,**kwargs):
        '''添加商品，如果商品已经存在就更新商品的数量(self.update())，否则直接放到购物车'''
        pass

    def delete(self,goodsid,colorid,sizeid,*args,**kwargs):
        '''删除一个购物项'''
        pass

    def update(self,goodsid,colorid,sizeid,count,step,*args,**kwargs):
        '''更新购物项的数据,添加减少购物项数据'''
        pass

    def queryAll(self,*args,**kwargs):
        ''':return CartItem  多个购物项'''
        pass


class SessionCartManager(CartManager):
    cart_name = 'cart'
    def __init__(self,session):
        self.session = session
        # 创建购物车[cartItem1,cartItem2]  {'goodsid,colorid,sizeid':catr}
        if self.cart_name not in self.session:
            self.session[self.cart_name] = OrderedDict()


    def __get_key(self,goodsid,colorid,sizeid):
        return goodsid+','+colorid+','+sizeid



    def add(self,goodsid,colorid,sizeid,count,*args,**kwargs):
        #获取购物项的唯一标示
        key = self.__get_key(goodsid,colorid,sizeid)

        if key in self.session[self.cart_name]:
            self.update(goodsid,colorid,sizeid,count,*args,**kwargs)
        else:
            self.session[self.cart_name][key] = CartItem(goodsid=goodsid,colorid=colorid,sizeid=sizeid,count=count)
            pass




    def delete(self,goodsid,colorid,sizeid,*args,**kwargs):
        key = self.__get_key(goodsid,colorid,sizeid)
        if key in self.session[self.cart_name]:
            del self.session[self.cart_name][key]


    def update(self,goodsid,colorid,sizeid,step,*args,**kwargs):

        key = self.__get_key(goodsid,colorid,sizeid)
        if key in self.session[self.cart_name]:
            cartitem = self.session[self.cart_name][key]
            cartitem.count = int(str(cartitem.count))+int(step)
            print cartitem.count,type(cartitem.count)

        else:
            raise Exception('SessionManager中的update出错了')



    def queryAll(self,*args,**kwargs):
        return self.session[self.cart_name].values()

    def migrateSession2DB(self):
        if 'user' in self.session:
            user = self.session.get('user')
            for cartitem in self.queryAll():
                if CartItem.objects.filter(goodsid=cartitem.goodsid,colorid=cartitem.colorid,sizeid=cartitem.sizeid).count()==0:
                    cartitem.user = user
                    cartitem.save()
                else:
                    item = CartItem.objects.get(goodsid=cartitem.goodsid,colorid=cartitem.colorid,sizeid=cartitem.sizeid)
                    item.count = int(item.count)+int(cartitem.count)
                    item.save()

            del self.session[self.cart_name]


class DBCartManger(CartManager):
    def __init__(self,user):
        self.user = user

    def add(self,goodsid,colorid,sizeid,count,*args,**kwargs):


        if self.user.cartitem_set.filter(goodsid=goodsid,colorid=colorid,sizeid=sizeid).count()==1:
            self.update(goodsid,colorid,sizeid,count,*args,**kwargs)
        else:
            CartItem.objects.create(goodsid=goodsid,colorid=colorid,sizeid=sizeid,count=count,user=self.user)



    def delete(self,goodsid,colorid,sizeid,*args,**kwargs):
        self.user.cartitem_set.filter(goodsid=goodsid,colorid=colorid,sizeid=sizeid).update(isdelete=True)


    def update(self,goodsid,colorid,sizeid,step,*args,**kwargs):
        self.user.cartitem_set.filter(goodsid,colorid,sizeid).update(count=F('count')+int(step))

    def queryAll(self,*args,**kwargs):

        return self.user.cartitem_set.order_by('id').filter(isdelete=False).all()

    #获取当前用户下的所有购物项
    def get_cartitems(self,goodsid,sizeid,colorid,*args,**kwargs):
        return self.user.cartitem_set.get(goodsid=goodsid,sizeid=sizeid,colorid=colorid)



# 工厂方法
#根据当前用户是否登录返回相应的CartManger对象
def getCartManger(request):
    if request.session.get('user'):
        return DBCartManger(request.session.get('user'))
    return SessionCartManager(request.session)

```


8. 在cart模块包/urls.py中添加映射路径
```
#coding=utf-8

from django.conf.urls import url
import views
urlpatterns=[
    url(r'^$',views.CartView.as_view()),
    url(r'^cart.html$',views.CartListView.as_view()),

]
```

9. 在cart模块包/views中添加CartListView类
```
class CartListView(View):
    def get(self,request):
        #查询购物车中的所有商品
        cartItems = getCartManger(request).queryAll()
        return render(request,'cart.html',{'cartItems':cartItems})
```

10. 在cart模块包/templates中创建cart.html文件
```
{% extends 'base.html' %}

{% block main %}
    <section class="cartMain">
        <div class="cartMain_hd">
            <ul class="order_lists cartTop">
                <li class="list_chk">
                    <!--所有商品全选-->
                    <input type="checkbox" id="all" class="whole_check" style="display: inline-block;position:relative;left: -8px;top: 4px">

                    全选
                </li>
                <li class="list_con">商品信息</li>
                <li class="list_info">商品参数</li>
                <li class="list_price">单价</li>
                <li class="list_amount">数量</li>
                <li class="list_sum">金额</li>
                <li class="list_op">操作</li>
            </ul>
        </div>

        <div class="cartBox">
            <div class="order_content">

            {% for cartitem in cartItems %}
                     <ul style="position: relative" class="order_lists"  goodsid="{{ cartitem.goods.id }}" sizeid="{{ cartitem.size.id }}" colorid="{{ cartitem.color.id }}">
                        <li class="list_chk">
                            <input type="checkbox" id="checkbox_2" class="son_check" style="display: inline-block;position:absolute;left: 21px;top: 54px">

                        </li>
                        <li class="list_con">
                            <div class="list_img"><a href="javascript:;"><img src="{{ MEDIA_URL }}{{ cartitem.color.value }}" alt=""></a></div>
                            <div class="list_text"><a href="javascript:;">{{ cartitem.goods.desc }}</a></div>
                        </li>
                        <li class="list_info">
                            <p>颜色：{{ cartitem.color.name }}</p>
                            <p>尺寸：{{ cartitem.size.name }}</p>
                        </li>
                        <li class="list_price">
                            <p class="price">￥{{ cartitem.goods.price }}</p>
                        </li>
                        <li class="list_amount">
                            <div class="amount_box">
                                <a href="javascript:;" class="reduce reSty" goodsid="{{ cartitem.goods.id }}" colorid="{{ cartitem.color.id }}" sizeid="{{ cartitem.size.id }}">-</a>
                                <input type="text"  value="{{ cartitem.count }}" class="sum" readonly>
                                <a href="javascript:;" class="plus" goodsid="{{ cartitem.goods.id }}" colorid="{{ cartitem.color.id }}" sizeid="{{ cartitem.size.id }}">+</a>
                            </div>
                        </li>
                        <li class="list_sum">
                            <p class="sum_price">￥{{ cartitem.total_price}}</p>
                        </li>
                        <li class="list_op">
                            <p class="del"><a href="javascript:;" class="delBtn" goodsid="{{ cartitem.goods.id }}" colorid="{{ cartitem.color.id }}" sizeid="{{ cartitem.size.id }}" >移除商品</a></p>
                        </li>
                    </ul>

            {% endfor %}


            </div>
        </div>
        <!--底部-->
        <div class="bar-wrapper">
            <div class="bar-right">
                <div class="piece">已选商品<strong class="piece_num" id="all_count">0</strong>件</div>
                <div class="totalMoney">共计: <strong class="total_text" id="all_price">0.00</strong></div>
                <div class="calBtn"><a href="javascript:;" id="jiesuan">结算</a></div>
            </div>
        </div>
    </section>


    <section class="model_bg" style="display: none;"></section>
    <section class="my_model" style="display: none;">
        <p class="title">删除宝贝<span class="closeModel">X</span></p>
        <p>您确认要删除该宝贝吗？</p>
        <div class="opBtn"><a href="javascript:;" class="dialog-sure" >确定</a><a href="javascript:;" class="dialog-close">关闭</a>
        </div>
    </section>
    {% csrf_token %}
{% endblock main %}
{% block footerjs %}
    <script>
        $('.plus').click(function(event){
            <!--将数据同步到服务器-->
            var csrfmiddlewaretoken = $('input[name="csrfmiddlewaretoken"]').val()
            var goodsid = $(this).attr('goodsid')
            var colorid = $(this).attr('colorid')
            var sizeid = $(this).attr('sizeid')


            var data={
                goodsid:goodsid,
                colorid:colorid,
                sizeid:sizeid,

                csrfmiddlewaretoken:csrfmiddlewaretoken,
                type:'plus'
            }
            $.ajax({
                async:false,
                url:'/cart/',
                data:data,
                type:'post',
                success:function(data) {

                },
                error:function(){
                    <!--按钮设置了两个点击事件-->
    {#                event.target =null#}
                    event.stopImmediatePropagation()
                }

            })
        })
          $('.reduce').click(function(event){
            <!--将数据同步到服务器-->
            if ($(this).next('input').val()<=1){
                event.stopImmediatePropagation()
                return
            }
            var csrfmiddlewaretoken = $('input[name="csrfmiddlewaretoken"]').val()
            var goodsid = $(this).attr('goodsid')
            var colorid = $(this).attr('colorid')
            var sizeid = $(this).attr('sizeid')

            var data={
                goodsid:goodsid,
                colorid:colorid,
                sizeid:sizeid,
                csrfmiddlewaretoken:csrfmiddlewaretoken,
                type:'minus'
            }

            $.ajax({
                async:false,
                url:'/cart/',
                type:'post',
                data:data,
                success:function(data) {

                },
                error:function(){
                    <!--按钮设置了两个点击事件-->
   
                    event.stopImmediatePropagation()
                }

            })
        })
        $('.delBtn').click(function(){
            var goodsid= $(this).attr('goodsid')
            var colorid= $(this).attr('colorid')
            var sizeid= $(this).attr('sizeid')
            $('.dialog-sure').attr('goodsid',goodsid).attr('colorid',colorid).attr('sizeid',sizeid)
        })
        $('.dialog-sure').click(function(event){
             var goodsid= $(this).attr('goodsid')
            var colorid= $(this).attr('colorid')
            var sizeid= $(this).attr('sizeid')
               var csrfmiddlewaretoken = $('input[name="csrfmiddlewaretoken"]').val()

             var data={
                goodsid:goodsid,
                colorid:colorid,
                sizeid:sizeid,
                csrfmiddlewaretoken:csrfmiddlewaretoken,
                type:'delete'
            }
            $.ajax({
                method:'post',
                url:'/cart/',
                data:data,
                async:false,
                success:function(result) {

                },
                error:function(event){
                    //停止事件传播
                    event.stopImmediatePropagation()
                }

            })
        })

        //在购物车页面点击登录按钮后回转到购物车页面
        $('.sign > a').click(function(event){
    {#        alert($(this).attr('href'))#}
            var link = $(this).attr('href')
            $(this).attr('href',link+"?redirct=cart")
        })

        //单击结算按钮
        $('#jiesuan').click(function(){


            cks = $('.son_check')
            cartitem = []
            $.each(cks,function(index,ck){
                if($(ck).prop('checked')){
                    var goodsid = $(ck).parents('.order_lists').attr('goodsid')
                    var sizeid = $(ck).parents('.order_lists').attr('sizeid')
                    var colorid = $(ck).parents('.order_lists').attr('colorid')



                    cartitem.push(JSON.stringify({'goodsid':goodsid,'sizeid':sizeid,'colorid':colorid}))


                }
            })


            if(cartitem.length==0){
                return;
            }

            var url = '/order/?cartitems='+cartitem
            $(this).attr('href',url)


        })

    </script>
{% endblock footerjs %}
```


























