import React from 'react';
import './app.less';

import { Head } from './head/app';

const App = React.createClass({
  render() {
    return (
      <div className="index">
		  <Head/>
      </div>
    );
  }
});

export default App;
