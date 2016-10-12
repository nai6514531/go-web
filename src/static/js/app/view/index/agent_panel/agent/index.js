import { Detail } from './app';
module.exports = {
	path: '/user',
	getComponent(nextState, callback) {
		require.ensure([], (require) => {
			callback(null, Detail)
		})
	},
	childRoutes: [
		// 分三个子路由,分别是 添加修改代理商,设备管理,查看下级代理商
		require('./index'),
	]
}
