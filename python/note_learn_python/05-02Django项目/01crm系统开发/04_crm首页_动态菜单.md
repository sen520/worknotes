OneToOne的反向查找：request.user.userprofile 后面跟小写表名

ForeigKey的反向查找：request.user.userprofile_set 后面跟小写表名+_set

修改html页面

index.html

```html
...
<div class="col-sm-3 col-md-2 sidebar">
    <ul class="nav nav-sidebar">
        <li class="active"><a href="https://v3.bootcss.com/examples/dashboard/#">Overview <span
                                                                                                class="sr-only">(current)</span></a>
        </li>

        {% for role in request.user.userprofile.role.all %}
        {% for menu in role.menus.all %}
        <li><a href="
            {% if menu.url_type == 0 %}
            {{ menu.url_name }}
            {% else %}
            {% url menu.url_name %}
            {% endif %}
            ">{{ menu.name }}</a>
        </li>
        {% endfor %}
        {% endfor %}
        {#{{ request.user.userprofile.role.select_related }}  同样的效果#}
    </ul>
</div>
....
```

效果图：

![04_crm首页效果图01](./img/04_01crm%E9%A6%96%E9%A1%B5%E6%95%88%E6%9E%9C%E5%9B%BE.png)

再登录另外一个账号，会发现两个界面显示的菜单不相同。