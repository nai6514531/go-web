require('es6-promise').polyfill();
import 'babel-polyfill';
import 'whatwg-fetch';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './app.jsx';
import router from './router.jsx';
import 'nprogress/nprogress.css';
import 'antd/dist/antd.min.css';
import './ga'

ReactDOM.render(router, document.getElementById('main'));

