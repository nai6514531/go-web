import axios from "axios";
import NProgress from "nprogress";
const api = axios.create({
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 1000 * 60 * 5,
  transformRequest: [(data) => {
    NProgress.start();
    if (!data) {
      return '';
    }
    return JSON.stringify(data);
  }],
  transformResponse: [(data)=> {
    NProgress.done();
    try {
      data = JSON.parse(data);
    } catch (e) {
      return Promise.reject(e);
    }
    if (data) {
      if (parseInt(data.status) < 0) {
        data.status = parseInt(data.status);
        if (data.status == -1) {
          alert(data.msg);
          window.location.href = '/';
        }else{
          alert(data.msg);
        }
      } else {
        data.status = parseInt(data.status.substr(-2));
        return data;
      }
    } else {
      return alert('服务器返回数据异常!');
    }
  }]
});

api.interceptors.response.use(
  (response)=> {
    if (!response.data) {
      return Promise.reject('服务器返回数据异常!');
    }
    return response.data;
  },
  (error) => {
    alert('系统开小差了,请重试!');
    return Promise.reject(error);
  }
);

export default api;
