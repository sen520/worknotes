decodeURI()定义和用法:decodeURI()函数可对encodeURI()函数编码过的URI进行解码.
语法:decodeURI(URIstring)
参数描述:URIstring必需,一个字符串,含有要解码的URI组或其他要解码的文本.
返回值:URIstring的副本,其中的十六进制转义序列将被它们表示的字符替换.

decodeURIComponent()定义和用法:decodeURIComponent()函数可对encodeURIComponent()函数编码过的URI进行解码.
语法:decodeURIComponent(URIstring)
参数描述:URIstring必需,一个字符串,含有解码的URI组件或其他要解码的文本.
返回值:URIstring的副本,其中的十六进制转义序列将被它们表示的字符替换.

```html
<html>
  <body>
    <script type="text/javascript">
      var test = "http://www.test.com/My test/";
      var test1 = encodeURI(test);
      var test2 = decodeURI(test1);
      var test3 = encodeURIComponent(test);
      var test4 = decodeURIComponent(test3);

      document.write(test1 + "<br />");
      document.write(test2 + "<br />");
      document.write(test3 + "<br />");
      document.write(test4 + "<br />");
    // 运行结果:
    // http://www.test.com/My%20test/
    // http://www.test.com/My test/
    // http%3A%2F%2Fwww.test.com%2FMy%20test%2F
    </script>

```
