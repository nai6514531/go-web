import api from '../library/request/api'

const Service = {
  list: (account, serialNumber, pager) => {
    return api.get('/api/trade', {
      params: {
        "account": account || "",
        "serialNumber": serialNumber || "",
        page: pager.page || 1,
        perPage: pager.perPage || 10
      }
    });
  },
};

export default Service;
