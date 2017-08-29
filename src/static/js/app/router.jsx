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
          // 用户首页
            callback(null, require('./view/user/detail/app.jsx').default);
          });
        }} />
        <Route path="/user/:id" getComponent={(location, callback) => {
          require.ensure([], (require) => {
          // 下级代理商列表
            callback(null, require('./view/user/list/app.jsx').default);
          });
        }} />
         <Route path="/user/ic-card/recharge" getComponent={(location, callback) => {
          require.ensure([], (require) => {
          // 下级代理商列表
            callback(null, require('./view/user/ic-card/app.jsx').default);
          });
        }} />
         <Route path="/user/ic-card/recharge/:id" getComponent={(location, callback) => {
          require.ensure([], (require) => {
          // 下级代理商列表
            callback(null, require('./view/user/ic-card-detail/app.jsx').default);
          });
        }} />
        <Route path="/user/edit/:id" getComponent={(location, callback) => {
          require.ensure([], (require) => {
          // 编辑/新增代理商列表
            callback(null, require('./view/user/edit/app.jsx').default);
          });
        }} />
        <Route path="/user/:id/device/school/:schoolId" getComponent={(location, callback) => {
          require.ensure([], (require) => {
            // 原来的具体学校的设备列表,现暂时没用
            callback(null, require('./view/user/school_device/app.jsx').default);
          });
        }} />
        <Route path="/user/:id/device/school/:schoolId/edit(/:deviceId)" getComponent={(location, callback) => {
          require.ensure([], (require) => {
          // 原设备新增/编辑页面,现暂时没用
            callback(null, require('./view/user/device_edit/app.jsx').default);
          });
        }} />
        <Route path="/settlement" getComponent={(location, callback) => {
          require.ensure([], (require) => {
          // 每日账单
            callback(null, require('./view/settlement/list/app.jsx').default);
          });
        }} />
        <Route path="/settlement/bill" getComponent={(location, callback) => {
          require.ensure([], (require) => {
          // 结算查询
            callback(null, require('./view/settlement/bill/app.jsx').default);
          });
        }} />
        <Route path="/settlement/bill/detail" getComponent={(location, callback) => {
          require.ensure([], (require) => {
          // 结算日账单列表
            callback(null, require('./view/settlement/bill/detail.jsx').default);
          });
        }} />
        <Route path="/settlement/bill/:id" getComponent={(location, callback) => {
          require.ensure([], (require) => {
          // 结算日账单列表
            callback(null, require('./view/settlement/bill/detail.jsx').default);
          });
        }} />
        <Route path="/settlement/bill/detail/daily-bill-detail/:userId/:billAt" getComponent={(location, callback) => {
          require.ensure([], (require) => {
          // 日账单详情
            callback(null, require('./view/settlement/daily-bill-detail/app.jsx').default);
          });
        }} />
        <Route path="/settlement/daily-bill-detail/:userId/:billAt" getComponent={(location, callback) => {
          require.ensure([], (require) => {
          // 日账单详情
            callback(null, require('./view/settlement/daily-bill-detail/app.jsx').default);
          });
        }} />
        <Route path="/device" getComponent={(location, callback) => {
          require.ensure([], (require) => {
          // 设备管理列表(按用户分类)
            callback(null, require('./view/device/list/self-device.jsx').default);
          });
        }} />
        <Route path="/device/child" getComponent={(location, callback) => {
          require.ensure([], (require) => {
          // 设备管理列表(按用户分类)
            callback(null, require('./view/device/list/child-device.jsx').default);
          });
        }} />
        <Route path="/device/user/:id/list" getComponent={(location, callback) => {
          require.ensure([], (require) => {
          // 设备管理列表(按学校分类)
            callback(null, require('./view/device/school_filter_list/app.jsx').default);
          });
        }} />
        <Route path="/device/list" getComponent={(location, callback) => {
          require.ensure([], (require) => {
          // 设备管理列表,具体到某个用户某个学校
            callback(null, require('./view/device/list/app.jsx').default);
          });
        }} />
        <Route path="/device/edit(/:id)" getComponent={(location, callback) => {
          require.ensure([], (require) => {
          // 设备编辑/新增
            callback(null, require('./view/device/edit/app.jsx').default);
          });
        }} />
        <Route path="/device/batch-edit" getComponent={(location, callback) => {
          require.ensure([], (require) => {
          // 批量修改设备
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
          // 消费统计
            callback(null, require('./view/data-manager/consume-month/app.jsx').default);
          });
        }} />
        <Route path="/data/consume/month/:id" getComponent={(location, callback) => {
          require.ensure([], (require) => {
          // 消费统计(具体月份)
            callback(null, require('./view/data-manager/consume-daily/app.jsx').default);
          });
        }} />
        <Route path="/data/consume/month/:id/:date" getComponent={(location, callback) => {
          require.ensure([], (require) => {
          //消费统计(具体日期)
            callback(null, require('./view/data-manager/consume-daily-device/app.jsx').default);
          });
        }} />
        <Route path="/data/consume/month/:id/:date/:serialNumber" getComponent={(location, callback) => {
          require.ensure([], (require) => {
          // 消费统计(具体日期的具体设备号)
            callback(null, require('./view/data-manager/consume-daily-device-detail/app.jsx').default);
          });
        }} />
        <Route path="/data/manage" getComponent={(location, callback) => {
          require.ensure([], (require) => {
          // 经营统计(按月)
            callback(null, require('./view/data-manager/operate-month/app.jsx').default);
          });
        }} />
        <Route path="/data/manage/month/:id" getComponent={(location, callback) => {
          require.ensure([], (require) => {
          // 经营统计(按日)
            callback(null, require('./view/data-manager/operate-daily/app.jsx').default);
          });
        }} />
        <Route path="/data/device_search" getComponent={(location, callback) => {
          require.ensure([], (require) => {
          // 设备查询(已合并进了消费查询)
            callback(null, require('./view/data-manager/device-search/app.jsx').default);
          });
        }} />
        <Route path="/data/consume_search" getComponent={(location, callback) => {
          require.ensure([], (require) => {
          // 消费查询
            callback(null, require('./view/data-manager/consume-search/app.jsx').default);
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
        <Route path="/setting/reset-password" getComponent={(location, callback) => {
          require.ensure([], (require) => {
            callback(null, require('./view/user/resetPwd/app.jsx').default);
          });
        }} />
      </Route>

    </Router>
  </Provider>
);

export default router;
