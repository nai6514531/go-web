import api from '../library/request/api'

const Service = {
  list: () => {
    return api.get('/api/statis/consume');
  },
  dateList: (date, pager) => {
    return api.get('/api/statis/consume', {
      params: {
        date: date,
        page: pager.page || 1,
        perPage: pager.perPage || 10
      }
    })
  },
  deviceList: (date,pager)=> {
    return api.get('/api/statis/consume', {
      params: {
        date: date,
        page: pager.page || 1,
        perPage: pager.perPage || 10
      }
    })
  },
  deviceDetail: (date,serialNumber,pager)=> {
    return api.get('/api/statis/consume', {
      params: {
        date: date,
        serialNumber: serialNumber,
        page: pager.page || 1,
        perPage: pager.perPage || 10
      }
    })
  },
};

export default Service;
