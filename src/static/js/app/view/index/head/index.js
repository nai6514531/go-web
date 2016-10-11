module.exports = {
	path: '/head',
	getComponent(nextState, callback) {
		require.ensure([], (require) => {
			callback(null, require('./app').default)
		})
	}
}
