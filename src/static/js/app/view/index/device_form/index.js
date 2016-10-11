import { BodyPanel } from './app';
module.exports = {
	path: 'panel',
	getComponent(nextState, callback) {
		require.ensure([], (require) => {
			callback(null, BodyPanel)
		})
	},
	childRoutes: [
		require('./index'),
	]
}
