import api from '../library/axios/api';

// 根据你的接口封装以下服务
const SlickService = {
  list: () => {
    return api.get('http://mockee.maizuo.com/smart-cinema/app/list').then((response) => {
      return response.data;
    }).then(function (response) {
      return response.data;
    }, function (response) {
      throw new Error(response.data);
    });;
  },
  detail: (id) => {
    return api.get('/admin/api/card/' + id).then((response) => {
      return response.data;
    });
  },
  create: (card) => {
    return api.post('/admin/api/card', {
      data: card
    }).then(function (response) {
      return response.data;
    }, function (response) {
      throw new Error(response.data);
    });
  },
  edit: (id, card) => {
    return api.put('/admin/api/card/' + id, {
      data: card
    }).then(function (response) {
      return response.data;
    }, function (response) {
      throw new Error(response.data);
    });
  },
  remove: (id) => {
    return api.delete('/admin/api/card/' + id).then(function (response) {
      return response.data;
    }, function (response) {
      throw new Error(response.data);
    });
  }
};

export default SlickService;
