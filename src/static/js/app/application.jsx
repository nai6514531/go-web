import React from 'react';
import './application.less';

import '../../css/normalize/normalize.css';
import '../../css/animate/animate.css';
import 'lib-flexible';       //响应式布局js
//import 'antd/dist/antd.min.css';

const Application = React.createClass({
  render() {
    const { location, children } = this.props;
    return (
      <div className="app-main">
        {children}
      </div>
    );
  }
});

export default Application;
