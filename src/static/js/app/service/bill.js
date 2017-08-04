import api from '../library/request/api'

const Service = {
  list: (data) => {
    return api.get('/api/bill', {
      params: {
        status: data.status,
        createdAt: data.createdAt,
        page: data.page || 1,
        perPage: data.perPage || 10
      }
    })
  },
  create: (id) => {
    return api.post('/api/bill', {
      id: id || ''
    })
  },
};

export default Service;