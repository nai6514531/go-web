import React from 'react';
import { Router, Route, IndexRoute, hashHistory, IndexRedirect } from 'react-router';
import Application from './application.jsx';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { createStore, applyMiddleware } from 'redux';
import rootReducer from './reducers/index';

export const store = applyMiddleware(thunk)(createStore)(rootReducer);
import  App  from './view/index/app.jsx';
import Agent from './view/index/agent/app';
import Cash from './view/index/cash/app';
import AgentTable from './view/index/agent_table/app';
import { UserForm } from './view/index/agent_form/app';
import SchoolTable from  './view/index/school_table/app';
import DeviceTable from  './view/index/device_table/app';
import { DeviceForm } from './view/index/device_form/app';

const rootRoute = {
	childRoutes: [ {
		path: '/',
		component: Application,
		getIndexRoute(location, callback) {
			require.ensure([], function (require) {
				callback(null, require('./view/index/app.jsx').default);
			})
		},
		childRoutes: [
			require('./view/index/index'),
		]
	} ]
}

const router = (
	<Provider store = {store}>
		<Router history={hashHistory} >
			<Route component={Application}>
				<Route path="/" component={App}>
					<IndexRedirect to="agent" />
					<Route path="agent" component={ Agent }>
						<IndexRoute component= {AgentTable}/>
						<Route path="new" component={UserForm}/>
						<Route path="device" component={SchoolTable}>
							<Route path="list" component={DeviceTable}>
								<Route path="new" component={DeviceForm}/>
							</Route>
						</Route>
					</Route>
					<Route path="cash" component={Cash}/>
				</Route>
			</Route>
		</Router>
	</Provider>
);

export default router;
