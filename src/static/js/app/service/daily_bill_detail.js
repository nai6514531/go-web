import api from '../library/request/api'

const Service = {
  list: (userId, billAt, serialNumber, pager)=> {
    return api.get('/api/daily-bill-detail', {
      params: {
        userId: userId,
        billAt: billAt,
        serialNumber: serialNumber || '',
        page: pager.page || 1,
        perPage: pager.perPage || 10
      }
    })
  },
  deviceBillList: (userId, billAt, serialNumber, pager)=> {
    return api.get('/api/daily-bill/device/'+serialNumber, {
      params: {
        userId: userId,
        billAt: billAt,
        serialNumber: serialNumber || '',
        page: pager.page || 1,
        perPage: pager.perPage || 10
      }
    })
  }
};

export default Service;
