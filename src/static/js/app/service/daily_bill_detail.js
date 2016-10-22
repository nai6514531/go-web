import api from '../library/request/api'

const Service = {
	list: (userId, billAt, page, perPage)=> {
		return api.get('/api/daily-bill-detail', {
			params: {
				userId: userId,
				billAt: billAt,
				page: page || 1,
				perPage: perPage || 10
			}
		})
	}
};

export default Service;
