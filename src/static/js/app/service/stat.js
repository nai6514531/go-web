import api from '../library/request/api'

const Service = {
  dailyPay:()=>{
    return api.get(`/api/stat/daily-pay`)
  },
  dailyBill:()=>{
    return api.get(`/api/stat/daily-bill`)
  },
  recharge: () => {
    return api.get('/api/stat/recharge')
  },
  consume: () => {
    return api.get('/api/stat/consume')
  },
  signInUser: () => {
    return api.get(`/api/stat/signin-user`)
  },
};

export default Service;
