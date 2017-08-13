import api from '../library/request/api'

const Service = {
  create: () => {
    return api.get('/api/wechat/actions/create/key')
  },
  getKeyDetail: (id) => {
    return api.get('/api/wechat/key/${key}')
  }
};

export default Service;