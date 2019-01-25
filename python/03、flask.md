改变页面一定要重启才能显示已经修改过的页面

```python
from flask import Flask, request, render_template

app = Flask(__name__)

@app.route('/user/<username>')
def index(username):
    return 'User %s'%username

@app.route('/nihao')
def hello():
    return 'hello world'

@app.route('/login',methods=['GET','POST'])
def login():
    if request.method == 'POST':
        name = request.form['name']
        password = request.form['password']
        dict = {}
        dict['name'] = name
        dict['password'] = password
        return render_template('user.html',name=dict)
    else:

        return render_template('login.html')

@app.route('/hello/')
@app.route('/hello/<name>')
def hello_xx(name=None):
    return render_template('index.html',name=name)

if __name__ == '__main__':
    app.run()
```

