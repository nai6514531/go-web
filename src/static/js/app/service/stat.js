import api from '../library/request/api'

const Service = {
  recharge: () => {
    return api.get('/api/stat/recharge')
  },
  consume: () => {
    return api.get('/api/stat/consume')
  },
  signInUser: () => {
    return api.get(`/api/stat/signin-user`);
  }

};

export default Service;
