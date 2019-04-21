```
{% extends "bootstrap/base.html" %}
```

Flask-Bootstrap 的base.html 模板还定义了很多其他块，都可在衍生模板中使用，下表列出了所有可用的块： 

| 块名         | 说明                      |
| ------------ | ------------------------- |
| doc          | 整个html文档              |
| html_attribs | html标签属性              |
| html         | html标签中的内容          |
| head         | head标签中的内容          |
| title        | title标签中的内容         |
| metas        | 一组meta标签              |
| styles       | 层叠样式表定义            |
| body_attribs | body标签的属性            |
| body         | body标签中的内容          |
| navbar       | 用户定义的导航条          |
| content      | 用户定义的页面内容        |
| scripts      | 文档底部的JavaScript 声明 |