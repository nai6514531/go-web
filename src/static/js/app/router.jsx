import React from 'react';
import { Router, Route, IndexRoute, hashHistory } from 'react-router';
import Application from './application.jsx';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { createStore, applyMiddleware } from 'redux';
import rootReducer from './reducers/index';
import ga from './library/analytics/ga';

const trackPage = function () {
  const { location } = this.state;
  const path = window.location.pathname + '#' + location.pathname + location.search;
  ga.pageview(path);
};

export const store = applyMiddleware(thunk)(createStore)(rootReducer);

const router = (
  <Provider store = {store}>
    <Router history={hashHistory} onUpdate={trackPage}>
      <Route path="/" component={ Application }>
        <IndexRoute getComponent={(location, callback) => {
          require.ensure([], (require) => {
            callback(null, require('./view/home/app.jsx').default);
          });
        }} />
        <Route path="/user" getComponent={(location, callback) => {
          require.ensure([], (require) => {
            callback(null, require('./view/user/detail/app.jsx').default);
          });
        }} />
        <Route path="/user/:id" getComponent={(location, callback) => {
          require.ensure([], (require) => {
            callback(null, require('./view/user/list/app.jsx').default);
          });
        }} />
        <Route path="/user/edit/:id" getComponent={(location, callback) => {
          require.ensure([], (require) => {
            callback(null, require('./view/user/edit/app.jsx').default);
          });
        }} />
        <Route path="/user/:id/device/list" getComponent={(location, callback) => {
          require.ensure([], (require) => {
            callback(null, require('./view/user/device_list/app.jsx').default);
          });
        }} />
        <Route path="/user/:id/device/school/:schoolId" getComponent={(location, callback) => {
          require.ensure([], (require) => {
            callback(null, require('./view/user/school_device/app.jsx').default);
          });
        }} />
        <Route path="/user/:id/device/school/:schoolId/edit(/:deviceId)" getComponent={(location, callback) => {
          require.ensure([], (require) => {
            callback(null, require('./view/user/device_edit/app.jsx').default);
          });
        }} />
        <Route path="/user/edit" getComponent={(location, callback) => {
          require.ensure([], (require) => {
            callback(null, require('./view/user/list/app.jsx').default);
          });
        }} />
        <Route path="/settlement" getComponent={(location, callback) => {
          require.ensure([], (require) => {
            callback(null, require('./view/settlement/list/app.jsx').default);
          });
        }} />
        <Route path="/settlement/daily-bill-detail/:user_id/:bill_at" getComponent={(location, callback) => {
          require.ensure([], (require) => {
            callback(null, require('./view/settlement/daily-bill-detail/app.jsx').default);
          });
        }} />
        <Route path="/device" getComponent={(location, callback) => {
          require.ensure([], (require) => {
            callback(null, require('./view/device/list/app.jsx').default);
          });
        }} />
        <Route path="/device/edit(/:id)" getComponent={(location, callback) => {
          require.ensure([], (require) => {
            callback(null, require('./view/device/edit/app.jsx').default);
          });
        }} />
        <Route path="/device/batch-edit" getComponent={(location, callback) => {
          require.ensure([], (require) => {
            callback(null, require('./view/device/batch-edit/app.jsx').default);
          });
        }} />
        <Route path="/stat" getComponent={(location, callback) => {
          require.ensure([], (require) => {
            callback(null, require('./view/stat/app.jsx').default);
          });
        }} />
        <Route path="/data/consume" getComponent={(location, callback) => {
          require.ensure([], (require) => {
            callback(null, require('./view/data-manager/consume-month/app.jsx').default);
          });
        }} />
        <Route path="/data/consume/month/:id" getComponent={(location, callback) => {
          require.ensure([], (require) => {
            callback(null, require('./view/data-manager/consume-daily/app.jsx').default);
          });
        }} />
        <Route path="/data/consume/month/:id/:date" getComponent={(location, callback) => {
          require.ensure([], (require) => {
            callback(null, require('./view/data-manager/consume-daily-device/app.jsx').default);
          });
        }} />
        <Route path="/data/consume/month/:id/:date/:serialNumber" getComponent={(location, callback) => {
          require.ensure([], (require) => {
            callback(null, require('./view/data-manager/consume-daily-device-detail/app.jsx').default);
          });
        }} />
        <Route path="/data/manage" getComponent={(location, callback) => {
          require.ensure([], (require) => {
            callback(null, require('./view/data-manager/operate-month/app.jsx').default);
          });
        }} />
        <Route path="/data/manage/month/:id" getComponent={(location, callback) => {
          require.ensure([], (require) => {
            callback(null, require('./view/data-manager/operate-daily/app.jsx').default);
          });
        }} />
        <Route path="/data/device_search" getComponent={(location, callback) => {
          require.ensure([], (require) => {
            callback(null, require('./view/data-manager/device-search/app.jsx').default);
          });
        }} />
        <Route path="/data/wash_search" getComponent={(location, callback) => {
          require.ensure([], (require) => {
            callback(null, require('./view/data-manager/wash-search/app.jsx').default);
          });
        }} />
        <Route path="/data/device" getComponent={(location, callback) => {
          require.ensure([], (require) => {
            callback(null, require('./view/data-manager/device-month/app.jsx').default);
          });
        }} />
        <Route path="/data/device/month/:id/:serial_number" getComponent={(location, callback) => {
          require.ensure([], (require) => {
            callback(null, require('./view/data-manager/device-daily/app.jsx').default);
          });
        }} />
        <Route path="/setting/password" getComponent={(location, callback) => {
          require.ensure([], (require) => {
            callback(null, require('./view/setting/password/app.jsx').default);
          });
        }} />
      </Route>

    </Router>
  </Provider>
);

export default router;
