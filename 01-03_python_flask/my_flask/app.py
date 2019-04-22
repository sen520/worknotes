from flask import Flask
from flask import request
from flask import make_response
from flask import abort
from flask import redirect

app = Flask(__name__)


@app.route('/')
def hello_world():
    # 重定向
    return redirect('https://www.baidu.com')

    # 设置cookie
    # response = make_response('<h1>This document carries a cookie!</h1>')
    # response.set_cookie('answer', '42')
    # return  response

    # 获取headers
    # user_agent = request.headers.get('User-Agent')
    # return 'Hello world, %s' % user_agent


@app.route('/user/<test>')
def get_user(test):
    if test:
        abort(404)
    return '<h1>hello %s</h1>' % test


# @app.route('/tewt')
# def index():
#     return 'Bad Request', 404

if __name__ == '__main__':
    app.run(debug=True)
