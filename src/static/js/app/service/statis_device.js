import api from '../library/request/api'

const Service = {
  list: (date) => {
    return api.get('/api/statis/device', {
      params: {
        groupBy:"month",
        date: date
      }
    });
  },
  dateList: (date, serialNumber, pager) => {
    return api.get('/api/statis/device', {
      params: {
        groupBy:"date",
        date: date,
        serialNumber: serialNumber,
        page: pager.page || 1,
        perPage: pager.perPage || 10
      }
    })
  },
};

export default Service;
