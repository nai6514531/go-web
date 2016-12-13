import api from '../library/request/api'

const Service = {
  list: (data) => {
    return api.get('/api/daily-bill', {
      params: {
        cashAccountType: data.cashAccountType,
        status: data.status,
        billAt: data.billAt,
        billEndAt: data.billEndAt,
        searchStr: data.userOrBank,
        page: data.page || 1,
        perPage: data.perPage || 10
      }
    })
  },
  billCancel: (data) => {
    return api.post('/api/daily-bill/cancel', data)
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
    return api.put('/api/daily-bill/batch-pay', {
      params: data
    })
  },
  mark: (id) => {
    return api.get('/api/daily-bill/mark',{
      params: {
        id: id
      }
    })
  }
};

export default Service;
