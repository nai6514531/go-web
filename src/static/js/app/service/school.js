import { apiGet } from '../library/axios/api';

const SchoolService = {
  detail: (id) => {
    return apiGet(`/api/school/${id}`);
  },
  list: ()=> {
    return apiGet(`/api/school`);
  }
};

export default SchoolService;
