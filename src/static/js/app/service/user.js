import { apiGet, apiPost, apiPut, apiDelete } from '../library/axios/api';

const UserService = {
  list: (pager,searchValue) => {
    const { page, perPage } = pager;
    return apiGet(`/api/user?page=${page}&perPage=${perPage}&searchStr=${searchValue || ''}`);
  },
  detailTotal: (id) => {
    return apiGet(`/api/user/${id}/device-total`);
  },
  detail: (id) => {
    return apiGet(`/api/user/${id}`);
  },
  create: (user) => {
    return apiPost(`/api/user`, user);
  },
  edit: (id, user) => {
    return apiPut(`/api/user/${id}`, user);
  },
  remove: (id) => {
    return apiDelete(`/api/user/${id}`);
  },
  school: (id, schoolId) => {
    return apiGet(`/api/user/${id}/school?hasDeviceTotal=0&schoolId=${schoolId}`);
  },
  schoolTotal: (id, schoolId, pager) => {
    const { page, perPage } = pager;
    return apiGet(`/api/user/${id}/school?hasDeviceTotal=1&schoolId=${schoolId}&page=${page}&perPage=${perPage}`);
  },
  schoolDevice:(id, school_id, pager) => {
    const { page, perPage } = pager;
    return apiGet(`/api/user/${id}/school/${school_id}/device?page=${page}&perPage=${perPage}`);
  },
  permission: (id) => {
    return apiGet(`/api/user/${id}/permission`);
  },
  logout: () => {
    return apiGet(`/api/link/signout`);
  },
  menu: (id) => {
    return apiGet(`/api/user/${id}/menu`);
  },
  device: (id) => {
    return apiGet(`/api/user/${id}/device`);
  }
};

export default UserService;
