require('es6-promise').polyfill();
import 'babel-polyfill';
import moment from 'moment';
import 'moment/locale/zh-cn';

import 'whatwg-fetch';
import ReactDOM from 'react-dom';
import router from './router.jsx';
import 'nprogress/nprogress.css';
ReactDOM.render(router, document.getElementById('main'));
import 'antd/dist/antd.min.css';

import './library/debug'

moment.locale('zh-cn');
