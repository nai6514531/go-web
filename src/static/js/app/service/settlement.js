import api from '../library/request/api'

const Service = {
  getAmount: () => {
    return api.get('/api/settlement/detail')
  }
};

export default Service;