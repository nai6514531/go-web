import React from 'react';

import './app.less';

import Detail from './detail/app.jsx';
import Slick from './home/app.jsx';
import Alert from './alert/app.jsx';

const App = React.createClass({
  render() {
    return (
      <div className="index">
        <Detail />
        <Slick />
        <Alert />
      </div>
    );
  }
});

export default App;
