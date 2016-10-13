import React from 'react';
import { Router, Route, IndexRoute, hashHistory } from 'react-router';
import Application from './application.jsx';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { createStore, applyMiddleware } from 'redux';
import rootReducer from './reducers/index';

export const store = applyMiddleware(thunk)(createStore)(rootReducer);


const router = (
	<Provider store = {store}>
	<Router history={hashHistory}>
	<Route path="/" component={ Application }>
		<IndexRoute getComponent={(location, callback) => {
			require.ensure([], (require) => {
				callback(null, require('./view/home/app.jsx').default);
			});
		}} />
		<Route path="/user" getComponent={(location, callback) => {
			require.ensure([], (require) => {
				callback(null, require('./view/user/list/app').default);
			});
		}} />
		<Route path="/user/edit(/:id)" getComponent={(location, callback) => {
			require.ensure([], (require) => {
				callback(null, require('./view/user/edit/app').default);
			});
		}} />
		<Route path="/user/device" getComponent={(location, callback) => {
			require.ensure([], (require) => {
				callback(null, require('./view/user/device/app').default);
			});
		}} />
		<Route path="/user/device/school" getComponent={(location, callback) => {
			require.ensure([], (require) => {
				callback(null, require('./view/user/school_device/app').default);
			});
		}} />
		<Route path="/user/device/edit" getComponent={(location, callback) => {
			require.ensure([], (require) => {
				callback(null, require('./view/user/device_edit/app').default);
			});
		}} />
		<Route path="/settlement" getComponent={(location, callback) => {
			require.ensure([], (require) => {
				callback(null, require('./view/settlement/list/app.jsx').default);
			});
		}} />
	</Route>
</Router>
	</Provider>
);

export default router;
