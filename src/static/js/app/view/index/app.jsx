import React from 'react';
import './app.less';

import Head from './head/app';
import  LeftMenu  from './menu/app';

const App = React.createClass({
  render() {
	  console.log(this.props);
	  return (
      <div className="index">
		  <Head/>
		  <div className="body-panel">
			  <LeftMenu/>
			  {this.props.children}
		  </div>
      </div>
    );
  }
});

export default App;
