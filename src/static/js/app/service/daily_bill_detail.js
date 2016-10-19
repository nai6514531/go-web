import api from '../library/request/api'

const Service = {
	list: (userId, billAt, page, perPage)=> {
		return api.get('/api/daily-bill-detail', {
			params: {
				user_id: userId,
				bill_at: billAt,
				page: page || 1,
				per_page: perPage || 10
			}
		})
	}
};

export default Service;
