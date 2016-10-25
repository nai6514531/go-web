import api from '../library/request/api'

const Service = {
	list: (data) => {
		return api.get('/api/daily-bill', {
			params: {
				cashAccountType: data.cashAccountType,
				status: data.status,
				billAt: data.billAt,
				page: data.page || 1,
				perPage: data.perPage || 10
			}
		})
	},
	apply: (data) => {
		return api.get('/api/daily-bill/apply', {
			params: {
				userId: data.userId,
				billAt: data.billAt,
				status: data.willApplyStatus
			}
		})
	},
	updateSettlement: (data) => {
		return api.get('/api/daily-bill/settlement', {
			params: {
				userId: data.userId,
				billAt: data.billAt
			}
		})
	}
};

export default Service;
