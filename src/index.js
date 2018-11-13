import React from 'react';
import ReactDOM from 'react-dom';
import Hall from './hall.js';
import Login from './login.js';
import history from './history.js';
import io from 'socket.io-client';
import './App.css';
import {Route, Router} from 'react-router-dom';
//不要使用代理连接，否则会出现WebSocket is closed before the connection is established.
const socket = io.connect('ws://120.79.0.55:5000');
//const socket = io.connect('ws://127.0.0.1:5000');

ReactDOM.render(
    <div style={{textAlign:'center',marginTop:60}}>
      <h1>这是一个聊天室</h1>
      <Router history={history}>
        <div>
          <Route exact path="/" render={() => <Login socket={socket}/>} />
          <Route path="/m" render={() => <Hall socket={socket}/>} />
        </div>
      </Router>
    </div>,
  document.getElementById('root'))
