import { DetailTable } from './app'

module.exports = {
	path: '/new',
	getComponents(location, callback) {
		require.ensure([], function (require) {
			callback(null, DetailTable)
		})
	},
}
