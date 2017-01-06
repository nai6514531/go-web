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
  SevenBill: () => {
    return api.get(`/api/stat/balance`)
  },
  OrderFail: () => {
    // return api.get(`/api/stat/balance`)
  },
};

export default Service;
