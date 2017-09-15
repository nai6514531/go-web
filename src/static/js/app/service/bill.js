import api from '../library/request/api'

const Service = {
  list: (data) => {
    return api.get('/api/bill', {
      params: {
        status: data.status,
        startAt: data.startAt,
        endAt: data.endAt,
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
  get: (id) => {
    return api.get(`/api/bill/${id}`)
  },
  getCast: (id) => {
    return api.get(`/api/bill/${id}/cast`)
  },
};

export default Service;