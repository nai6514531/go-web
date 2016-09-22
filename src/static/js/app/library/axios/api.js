import axios from 'axios';

const api = axios.create({
  headers: {
    'Content-Type': 'application/json'
  },
  transformRequest: [(data) => {
    if (!data) {
      return '';
    }
    return JSON.stringify(data.data);
  }]
});

export default api;
