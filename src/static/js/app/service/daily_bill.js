import api from '../library/request/api'

const Service = {
  list: (data) => {
    return api.get('/api/daily-bill', {
      params: {
        cashAccountType: data.cashAccountType,
        status: data.status,
        startAt: data.startAt,
        endAt: data.endAt,
        searchStr: data.userOrBank,
        page: data.page || 1,
        perPage: data.perPage || 10
      }
    })
  },
  billCancel: (data) => {
    return api.post('/api/daily-bill/cancel', data)
  },
  bankBillCancel: (data) => {
    return api.post('/api/daily-bill/bank-cancel', data)
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
    return api.get('/api/daily-bill/mark', {
      params: {
        id: id
      }
    })
  },
  export: (data) => {
    return api.get('/api/daily-bill/export', {
      params: {
        cashAccountType: data.cashAccountType,
        status: data.status,
        startAt: data.startAt,
        endAt: data.endAt,
        searchStr: data.userOrBank,
        page: data.page || 1,
        perPage: data.perPage || 10
      }
    })
  },
};

export default Service;