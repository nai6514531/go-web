import api from '../library/request/api'

const Service = {
	list: (data)=> {
		return api.get('/api/daily-bill', {
			params: {
				cashAccountType: data.cashAccountType,
				status: data.status,
				billAt: data.billAt,
				hasApplied: data.hasApplied,
				page: data.page || 1,
				perPage: data.perPage || 10
			}
		})
	}
};

export default Service;
