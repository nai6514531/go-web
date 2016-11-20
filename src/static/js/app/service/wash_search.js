import api from '../library/request/api'

const Service = {
  list: (account, pager) => {
    return api.get('/api/trade', {
      params: {
        "account": account,
        page: pager.page || 1,
        perPage: pager.perPage || 10
      }
    });
  },
};

export default Service;
