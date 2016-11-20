import api from '../library/request/api'

const Service = {
  list: () => {
    return api.get('/api/statis/operate');
  },
  operateList: (date, pager) => {
    return api.get('/api/statis/operate', {
      params: {
        date: date,
        page: pager.page || 1,
        perPage: pager.perPage || 10
      }
    });
  },
};

export default Service;
