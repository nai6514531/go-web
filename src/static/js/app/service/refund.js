import api from '../library/request/api'

const Service = {
  refund: (account, washId) => {
    return api.get('/api/trade/refund', {
      params: {
        account: account,
        washId: washId,
      }
    });
  },
};

export default Service;
