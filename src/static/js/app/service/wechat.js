import api from '../library/request/api'

const Service = {
  create: (userId) => {
    return api.post('/api/wechat/actions/create/key', {
    	id: parseInt(userId, 10) 
    })
  },
  getKeyDetail: (key) => {
    return api.get(`/api/wechat/key/${key}`)
  }
};

export default Service;