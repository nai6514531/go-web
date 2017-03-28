import React from 'react';
import { Router, Route, IndexRoute, hashHistory } from 'react-router';
import ga from '../app/library/analytics/ga';
import Application from './application.jsx';

const trackPage = function () {
  const { location } = this.state;
  const path = window.location.pathname + '#' + location.pathname + location.search;
  ga.pageview(path);
};

const validErrorRoute = function(nextState, replace) {
  replace({ pathname: '/' })
}

const router = (
    <Router history={hashHistory} onUpdate={trackPage}>
      <Route path="/" component={ Application }>
        <IndexRoute getComponent={(location, callback) => {
          require.ensure([], (require) => {
            callback(null, require('./app.jsx').default);
          });
        }} />
        <Route path="/reset" getComponent={(location, callback) => {
          require.ensure([], (require) => {
            callback(null, require('./reset/app.jsx').default);
          });
        }} />
        <Route path="*" onEnter= { validErrorRoute }/>
      </Route>
    </Router>
)

export default router;
