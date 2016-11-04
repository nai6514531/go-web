import { apiGet } from '../library/axios/api';

const SchoolService = {
  detail: (id) => {
    return apiGet(`/api/school/${id}`);
  },
};

export default SchoolService;
