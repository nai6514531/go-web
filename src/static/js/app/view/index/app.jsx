import React from 'react';
import './app.less';

import { Head } from './head/app';
import { LeftMenu } from './menu/app';


const App = React.createClass({
  render() {
    return (
      <div className="index">
		  <Head/>
		  <LeftMenu/>
      </div>
    );
  }
});

export default App;
