import api from '../library/request/api'

const Service = {
  list: () => {
    return api.get('/api/statis/device');
  },
  dateList: (date, serialNumber, pager) => {
    return api.get('/api/statis/device', {
      params: {
        date: date,
        "serial-number": serialNumber,
        page: pager.page || 1,
        perPage: pager.perPage || 10
      }
    })
  },
};

export default Service;
