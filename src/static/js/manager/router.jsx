import React from 'react';
import { Router, Route, IndexRoute, hashHistory } from 'react-router';
import Application from './application.jsx';

const router = (<Router history={hashHistory}>
  <Route path="/" component={ Application }>
    <IndexRoute getComponent={(location, callback) => {
      require.ensure([], (require) => {
        callback(null, require('./view/index/app.jsx').default);
      });
    }} />
    <Route path="/detail" getComponent={(location, callback) => {
		  require.ensure([], (require) => {
		    callback(null, require('./view/detail/app.jsx').default);
		  });
		}} />
  </Route>
</Router>);

export default router;
