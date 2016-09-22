import api from '../library/axios/api';

// 根据你的接口封装以下服务
const AppService = {
  getDevice: (id) => {
    return api.get('/api/device/1').then((response) => {
      return response.data;
    }, function (response) {
      throw new Error(response.data);
    });
  },
  getGoodsBasic: (id) => {
    return api.get('/api/cinema/1/goods?filter=basic').then((response) => {
      return response.data;
    }, function (response) {
      throw new Error(response.data);
    });
  },
  getGoodsFavor: (id) => {
    return api.get('api/goods/'+ id +'/favor').then((response) => {
      return response.data;
    }, function (response) {
      throw new Error(response.data);
    });
  }
};

export default AppService;
