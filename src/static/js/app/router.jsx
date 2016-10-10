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
					callback(null, require('./view/index/app.jsx').default);
				  });
				}} />
		  </Route>
		</Router>
</Provider>
);

export default router;
