const password = document.getElementById('newPasswordtest');
const repeatPassword = document.getElementById('repeatPassword');
const repeatPasswordSpan = document.getElementById('repeatPasswordSpan');
const buttonCheck = document.getElementById('button');
const passwordSpan = document.getElementById('newPasswordSpan');
const token = document.getElementById('token');

function newPassword() {
    if (password.value !== '') {
        var patern = /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,21}$/;
        if (!patern.exec(password.value)) {
            password.style.color = 'red';
            password.style.border = '2px solid red';
            passwordSpan.innerHTML = '请输入6-20位数字字母组合'
        } else {
            password.style.color = '';
            password.style.border = '';
            passwordSpan.innerHTML = ''
        } if (repeatPassword.value !== '') {
            checkPassword(repeatPassword.value)
        }
    }
}

function checkinput(event) {
    checkPassword(event.target.value)
}

function checkPassword(valueNext) {
    if (valueNext !== password.value) {
        repeatPasswordSpan.style.color = 'red';
        repeatPassword.style.border = '2px solid red';
        repeatPasswordSpan.innerHTML = ' 两次输入的密码不一致';
        buttonCheck.disabled = 'disabled'
    } else {
        password.style.color = '';
        password.style.border = '';
        password.innerHTML = '';
        repeatPasswordSpan.style.color = '';
        repeatPassword.style.border = '';
        repeatPasswordSpan.innerHTML = ''
    } if (repeatPasswordSpan.innerHTML === '' && passwordSpan.innerHTML === '') {
        buttonCheck.disabled = ''
    }
}

function buttonClick() {
    const newPassword = document.getElementById('newPasswordtest').value;
    const repeatPassword = document.getElementById('repeatPassword').value;
    if (newPassword === repeatPassword) {
        const ajax = new XMLHttpRequest();
        const SALT = '4fe41995-b7e8-4bc3-9cda-b9a0f444b460';
        ajax.open('post', 'http://' + window.location.host + '/password/reset');
        ajax.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        ajax.send('password=' + sha256_digest(newPassword + SALT) + '&token=' + token.innerText);
        ajax.onreadystatechange = function() {
            if (ajax.readyState === 4) {
                if (ajax.status === 200) {
                    const textObject = JSON.parse(ajax.responseText);
                    try {
                        if (textObject.response.code === 404) {
                            alert('网络错误，请前往官网重试')
                        } else if (textObject.response.code === 200) {
                            alert('修改成功,点击前往登录')
                        }
                        window.location.href = 'https://alpha.button.tech/user/login';
                        return
                    } catch (e) {}
                    alert('操作失败，请联系网站管理员')
                }
            }
        }
    } else {
        alert('两次输入的密码不一致')
    }
}