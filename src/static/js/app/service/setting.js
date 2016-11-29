import api from '../library/request/api'

const Service = {
  changePassword: (data) => {
    return api.get('/api/statis/consume',{
      params:{
        userId: data.userId,
        oldPassword: data.oldPassword,
        password: data.password,
        confirm: data.confirm,
      }
    });
  },
};

export default Service;
