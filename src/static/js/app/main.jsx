require('es5-shim');
require('es5-shim/es5-sham');
require('console-polyfill');
require('es6-promise').polyfill();
import 'babel-polyfill';
import 'antd/dist/antd.min.css';
import 'whatwg-fetch';
import ReactDOM from 'react-dom';
import router from './router.jsx';
import 'nprogress/nprogress.css'
ReactDOM.render(router, document.getElementById('main'));
