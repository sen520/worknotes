WTForms支持的HTML标准字段

| 字段类型            | 说明                                |
| ------------------- | ----------------------------------- |
| StringField         | 文本字段                            |
| TextAreaField       | 多行文本字段                        |
| PasswordField       | 密码文本字段                        |
| HiddenField         | 隐藏文本字段                        |
| DateField           | 文本字段，值为datetime.date格式     |
| DateTimeField       | 文本字段，值为datetime.datetime格式 |
| IntegerField        | 文本字段，值为整数                  |
| DecimalField        | 文本字段，值为decimal.Decimal       |
| FloatField          | 文本字段，职位浮点数                |
| BooleanField        | 复选框，值为True和False             |
| RadioField          | 一组单选框                          |
| SelectField         | 下拉列表                            |
| SelectMultipleField | 下拉列表，可选择多个值              |
| FileField           | 文件上传字段                        |
| SubmitField         | 表单提交按钮                        |
| FormField           | 把表单作为字段嵌入另一个表单        |
| FieldList           | 一组指定类型的字段                  |

WTF内建的验证函数

| 验证函数    | 说明                                                   |
| ----------- | ------------------------------------------------------ |
| Email       | 验证电子邮件地址                                       |
| EqualTo     | 比较两个字段的值，常用于要求输入两次密码进行确认的情况 |
| IPAddress   | 验证IPv4网络地址                                       |
| Length      | 验证输入字符串的长度                                   |
| NumberRange | 验证输入的值在数字范围内                               |
| Optional    | 无输入值时跳过其他验证函数                             |
| Required    | 确保字段中有数据                                       |
| Regexp      | 使用正则表达式验证输入值                               |
| URL         | 验证URL                                                |
| AnyOf       | 确保输入值在可选值列表中                               |
| NoneOf      | 确保输入值不在可选值列表中                             |

