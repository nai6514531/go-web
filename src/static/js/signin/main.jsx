require('es6-promise').polyfill();
import 'babel-polyfill';
import 'whatwg-fetch';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './app.jsx';
ReactDOM.render(<App />, document.getElementById('main'));
import 'antd/dist/antd.min.css';

