"""
@Author: sen
@Date  : 2018/8/1 18:36
@Software  : PyCharm
@File    : forms.py
@Purpose   : djangoform
"""
from django.forms import ModelForm
from django import forms
from crm import models



class EnrollmentForm(ModelForm):
    def __new__(cls, *args, **kwargs):
        # print('__new__', cls, args, kwargs)
        # print(cls.base_fields)
        for field_name in cls.base_fields:
            field_obj = cls.base_fields[field_name]
            field_obj.widget.attrs.update({'class': 'form-control'})

            if field_name in cls.Meta.readonly_fields:
                field_obj.widget.attrs.update({'disabled': 'true'})

        return ModelForm.__new__(cls)

    class Meta:  # 关联表
        model = models.StudentEnrollment
        # fields = ['name', 'consultant', 'status']
        fields = '__all__'  # 所有字段
        exclude = ['contract_approved_date']
        readonly_fields = ['contract_agreed']

    def clean(self):  # form 保存之前会调用
        if self.errors:
            raise forms.ValidationError(("Please fix errors before re-submit."))
        if self.instance.id is not None:  # means this is a change form ,should check the readonly fields
            for field in self.Meta.readonly_fields:
                old_field_val = getattr(self.instance, field)  # 数据库里的数据
                form_val = self.cleaned_data.get(field)
                # print("filed differ compare:", old_field_val, form_val)
                if old_field_val != form_val:
                    # add_error 字段错误
                    self.add_error(field, "Readonly Field: field should be '{value}' ,not '{new_value}' ". \
                                   format(**{'value': old_field_val, 'new_value': form_val}))



class CustomerForm(ModelForm):
    def __new__(cls, *args, **kwargs):
        # print('__new__', cls, args, kwargs)
        # print(cls.base_fields)
        for field_name in cls.base_fields:
            field_obj = cls.base_fields[field_name]
            field_obj.widget.attrs.update({'class': 'form-control'})

            if field_name in cls.Meta.readonly_fields:
                field_obj.widget.attrs.update({'disabled': 'true'})

        return ModelForm.__new__(cls)

    class Meta:  # 关联表
        model = models.CustomerInfo
        # fields = ['name', 'consultant', 'status']
        fields = '__all__'  # 所有字段
        exclude = ['consult_content', 'status', 'consult_courses']
        readonly_fields = ['contact_type', 'contact', 'consultant', 'referral_from', 'source']

    def clean(self):  # form 保存之前会调用
        if self.errors:
            raise forms.ValidationError(("Please fix errors before re-submit."))
        if self.instance.id is not None:  # means this is a change form ,should check the readonly fields
            for field in self.Meta.readonly_fields:
                old_field_val = getattr(self.instance, field)  # 数据库里的数据
                form_val = self.cleaned_data.get(field)
                # print("filed differ compare:", old_field_val, form_val)
                if old_field_val != form_val:
                    # add_error 字段错误
                    self.add_error(field, "Readonly Field: field should be '{value}' ,not '{new_value}' ". \
                                   format(**{'value': old_field_val, 'new_value': form_val}))
