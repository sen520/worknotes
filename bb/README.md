这里的数据平台的后端代码，主要是出于安全考虑不应该放置在前端的代码，比如

# 登录

## 用法

POST https://auth.button.tech/login
Body should contain a json object containing the following fields:

- **email**
- **phone** ignored when an valid email is provided
- **password** it should be obfuscated

## 结果

Status 200 and the body is a json object containing the following fields:

- **token** an uuid for *future* authorization purpose;
- **user** full information of current user;

# 获取验证码

## 用法

POST https://auth.button.tech/verification
Body should contain a json object containing the following fields:

- **email**
- **phone** ignored when an valid email is provided
- **message** optional. If provided, it will be a string as the addition message sent to user

## 结果

Status 200。用户应该收到一封邮件或者一条短信，里面有验证码。有效期10分钟。

# 注册

## 用法

POST https://auth.button.tech/register
Body should contain a json object containing the following fields:

- **email**
- **phone** optional when email is valid
- **name**
- **password** it should be obfuscated
- **type** optional. an integer indicate the user type
- **groupId** optional. an uuid string indicate which group to add user to
- **verificationCode** a string as 验证码

## 结果

Status 200.

# 取回密码

## 用法

POST https://auth.button.tech/password/retrieve
Body should contain a json object containing the following fields:

- **email**
- **phone** optional when email is valid

## 结果

Status 200. 用户应该回收一封邮件/一条短信，里面有一个链接用来重置密码。链接有效期一天，而且只可以使用一次。

# 重制密码

## 用法

GET https://auth.button.tech/password/reset/token

- **token** token is an uuid included in the email or text message

## 结果

Status 200. 用户应该回收一封邮件/一条短信，里面有一个链接用来重置密码。

# 发送邮件

## 用法

POST https://auth.button.tech/mail
Body should contain a json object containing the following fields:

- **to** receipt's email address
- **subject** 
- **body** should be a pure text string. HTML is **NOT** supported

## 结果

Status 200. 用户应该回收一封邮件。

# 阿里云上传验证码

## 用法

GET https://auth.button.tech/policy

## 结果

Status 200. Body should be a json object containing the following fields:

- **OSSAccessKeyId** access key
- **host** url to upload file to
- **policy** policy allowed for the file to upload
- **signature** signature of the policy
- **saveName** the name of the file to be saved, can be ignored
- **startsWith** the prefix of the name of file to be saved, can be ignored

# 使用说明

# 安装xelatex和相应的字体

```bash
apt-get install texlive-xetex
apt-get install fonts-arphic-ukai fonts-arphic-uming
apt-get install fonts-wqy-zenhei
fc-cache -v
```

