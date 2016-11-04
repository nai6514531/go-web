require('es6-promise').polyfill();
import 'babel-polyfill';

import 'whatwg-fetch';
import ReactDOM from 'react-dom';
import router from './router.jsx';
import 'nprogress/nprogress.css';
ReactDOM.render(router, document.getElementById('main'));
import 'antd/dist/antd.min.css';

