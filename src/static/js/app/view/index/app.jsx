import React from 'react';
import './app.less';

import { Head } from './head/app';
import { BodyPanel } from './body_panel/app';


const App = React.createClass({
  render() {
    return (
      <div className="index">
		  <Head/>
		  <BodyPanel/>
      </div>
    );
  }
});

export default App;
