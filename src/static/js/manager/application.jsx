import React from 'react';
import './application.less';

import '../../css/normalize/normalize.css';
import '../../css/animate/animate.css';
import 'lib-flexible';       //响应式布局js
import 'antd/dist/antd.min.css';

import Header from './view/header/app.jsx';

const Application = React.createClass({
  render() {
    const { location, children } = this.props;
    return (
      <div className="app-main">
      	<Header />
        {children}
      </div>
    );
  }
});

export default Application;
