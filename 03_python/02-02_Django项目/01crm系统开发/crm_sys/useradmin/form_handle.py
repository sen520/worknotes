"""
@Author: sen
@Date  : 2018/8/1 19:02
@Software  : PyCharm
@File    : form_handle.py
@Purpose   :
"""
from django.forms import ModelForm


def create_dynamic_model_form(admin_class,form_add=False):
    """动态生成modelform
    form_add: False 默认是修改的表单
            True 为添加
    """

    class Meta:
        model = admin_class.model
        # fields = ['name', 'consultant', 'status']
        fields = '__all__'  # 所有字段
        if not form_add: # change
            admin_class.form_add = False # 修改属性为False,为了避免上一次添加调用将其修改为True
            exclude = admin_class.readonly_fields # 不验证
        else: # add
            admin_class.form_add = True


    def __new__(cls, *args, **kwargs):
        # print('__new__', cls, args, kwargs)
        # print(cls.base_fields)
        for field_name in cls.base_fields:
            field_obj = cls.base_fields[field_name]
            field_obj.widget.attrs.update({'class':'form-control'})
            # if field_name in admin_class.readonly_fields:
            #     field_obj.widget.attrs.update({'disabled': 'true'})


        return ModelForm.__new__(cls)

    dynamic_form = type('DynamicModelForm', (ModelForm,), {'Meta': Meta,'__new__':__new__})
    # print(dynamic_form)
    return dynamic_form