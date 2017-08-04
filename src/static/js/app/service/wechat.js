import api from '../library/request/api'

const Service = {
  create: () => {
    return api.post('/api/wechat/ations/create/key')
  },
  getKeyDetail: (id) => {
    return api.get('/api/wechat/key/${key}')
  }
};

export default Service;