module.exports = {
	path: '/app',
	getComponents(location, callback) {
		require.ensure([], function (require) {
			callback(null, require('./app.jsx').default)
		})
	},
	childRoutes: [
		// 分两个子路由,一个是代理商管理,一个是结算管理
		require('./agent_panel/agent/index'),
		// require('./body_panel/index'),
	]
}
