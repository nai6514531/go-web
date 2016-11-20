import api from '../library/request/api'

const Service = {
  list: (serialNumber, pager) => {
    return api.get('/api/trade', {
      params: {
        "serial-number": serialNumber,
        page: pager.page || 1,
        perPage: pager.perPage || 10
      }
    });
  },
};

export default Service;
