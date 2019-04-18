###### 准备

首先进入src目录下， 删除所有文件，并新建`index.js`，`index.css`

将下述代码拷入

index.css

```css
body {
  font: 14px "Century Gothic", Futura, sans-serif;
  margin: 20px;
}

ol, ul {
  padding-left: 30px;
}

.board-row:after {
  clear: both;
  content: "";
  display: table;
}

.status {
  margin-bottom: 10px;
}

.square {
  background: #fff;
  border: 1px solid #999;
  float: left;
  font-size: 24px;
  font-weight: bold;
  line-height: 34px;
  height: 34px;
  margin-right: -1px;
  margin-top: -1px;
  padding: 0;
  text-align: center;
  width: 34px;
}

.square:focus {
  outline: none;
}

.kbd-navigation .square:focus {
  background: #ddd;
}

.game {
  display: flex;
  flex-direction: row;
}

.game-info {
  margin-left: 20px;
}

```

index.js

```js
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css'

class Square extends React.Component {
  render() {
    return (
      <button className="square">
        {/* TODO */}
      </button>
    );
  }
}

class Board extends React.Component {
  renderSquare(i) {
    return <Square />;
  }

  render() {
    const status = 'Next player: X';

    return (
      <div>
        <div className="status">{status}</div>
        <div className="board-row">
          {this.renderSquare(0)}
          {this.renderSquare(1)}
          {this.renderSquare(2)}
        </div>
        <div className="board-row">
          {this.renderSquare(3)}
          {this.renderSquare(4)}
          {this.renderSquare(5)}
        </div>
        <div className="board-row">
          {this.renderSquare(6)}
          {this.renderSquare(7)}
          {this.renderSquare(8)}
        </div>
      </div>
    );
  }
}

class Game extends React.Component {
  render() {
    return (
      <div className="game">
        <div className="game-board">
          <Board />
        </div>
        <div className="game-info">
          <div>{/* status */}</div>
          <ol>{/* TODO */}</ol>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);

```

其中ReactDOM.render指明了程序启动时所要执行的组件

Game，要执行的组件类似于html标签的写法，不过除了是自闭和标签外，首字母要大写，以区分于html标签。

`document.getElementById('root')`指明了组件所要存放的位置。

###### 练习

新建一个组件ShoppingList，注意要集成于React，目前是React.Component，记得下面执行要改为ShoppingList

`this.props.name` 是在调用组件时，标签后面所填的内容

```js
class ShoppingList extends React.Component{
  render() {
    return (
      <div className="shopping-list">
        <h1>Shopping List for {this.props.name}</h1>
        <ul>
          <li>Instagram</li>
          <li>WhatsApp</li>
          <li>Oculus</li>
        </ul>
      </div>
    )
  }
}

ReactDOM.render(
  <ShoppingList name={'test'}/>,
  document.getElementById('root')
);
```

npm start，打开浏览器，输入`localhost:你设置的端口`

![first_test](.\img\first_test.png)

注意：程序是自动刷新的，所以只需要执行一次`npm start`即可

