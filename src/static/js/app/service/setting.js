import api from '../library/request/api'

const Service = {
  changePassword: (data) => {
    return api.put('/api/user/password',{
      params:{
        current: data.current,
        newer: data.newer,
      }
    });
  },
};

export default Service;
