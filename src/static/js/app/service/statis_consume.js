import api from '../library/request/api'

const Service = {
  list: () => {
    return api.get('/api/statis/consume');
  },
  dateList: (date, pager) => {
    return api.get('/api/statis/consume', {
      params: {
        date: date,
        page: pager.page || 1,
        perPage: pager.perPage || 10
      }
    })
  },
};

export default Service;
