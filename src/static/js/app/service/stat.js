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
  signInUserMonth: () => {
    return api.get(`/api/stat/signin-user?format=month`)
  },
  SevenBill: () => {
    return api.get(`/api/stat/balance`)
  },
  OrderFail: () => {
    return api.get(`/api/stat/failed-trade`)
  },
};

export default Service;
