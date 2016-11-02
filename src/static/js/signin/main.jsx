require('es5-shim');
require('es5-shim/es5-sham');
require('console-polyfill');
require('es6-promise').polyfill();
import 'babel-polyfill';

import 'whatwg-fetch';
import React from 'react';
import ReactDOM from 'react-dom';
// import './app.less';
import App from './app.js';
ReactDOM.render(<App />, document.getElementById('main'));
import 'antd/dist/antd.min.css';

