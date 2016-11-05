import axios from 'axios';
import NProgress from "nprogress";

const api = axios.create({
  headers: {
      'Content-Type': 'application/json;charset=utf-8'
    },
  transformRequest: [(data) => {
    NProgress.start();
    if (!data) {
      return '';
    }
    return JSON.stringify(data.data);
  }],
  transformResponse: [(data) => {
    NProgress.done();

    if (!data) {
      return '';
    }
    return JSON.parse(data);
  }],
});

function handleResponse(promise, resolve, reject) {
  return promise.then((response) => {
    return response.data;
  }).then(( data ) => {
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
        if (data.status !== 0) {
          reject(data);
        } else {
          resolve(data);
        }
      }
    } else {
      reject(data);
      return alert('服务器返回数据异常!');
    }
  });
}

export function apiGet(url) {
  return new Promise((resolve, reject) => {
    const promise = api.get(url);
    return handleResponse(promise, resolve, reject);
  });
}

export function apiPost(url, data) {
  return new Promise((resolve, reject) => {
    const promise = api.post(url, { data });
    return handleResponse(promise, resolve, reject);
  });
}
export function apiPut(url, data) {
  return new Promise((resolve, reject) => {
    const promise = api.put(url, { data });
    return handleResponse(promise, resolve, reject);
  });
}

export function apiDelete(url) {
  return new Promise((resolve, reject) => {
    const promise = api.delete(url);
    return handleResponse(promise, resolve, reject);
  });
}

export function apiPatch(url, data) {
  return new Promise((resolve, reject) => {
    const promise = api.patch(url, {data});
    return handleResponse(promise, resolve, reject);
  });
}
