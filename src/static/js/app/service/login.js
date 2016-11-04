import { apiPost } from '../library/axios/api'

const Service = {
  login: (data) => {
    return apiPost('/api/signin', data);
  },
};

export default Service;
