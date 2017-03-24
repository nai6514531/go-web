import {apiGet, apiPost, apiPut, apiDelete, apiPatch} from '../library/axios/api';

const DeviceService = {
  list: (pager) => {
    let {page, perPage,serialNumber,userQuery,isEqual,isAssigned} = pager;
    serialNumber = serialNumber || '';
    userQuery = userQuery || '';
    isEqual = isEqual || 0;
    isAssigned = isAssigned || 0;
    let url = `/api/device?isAssigned=${isAssigned}&isEqual=${isEqual}&page=${page}&perPage=${perPage}&serialNumber=${serialNumber}&userQuery=${userQuery}`;
    return apiGet(url);
  },
  detail: (id) => {
    return apiGet(`/api/device/${id}`);
  },
  create: (device) => {
    return apiPost(`/api/device`, device);
  },
  edit: (id, device) => {
    return apiPut(`/api/device/${id}`, device);
  },
  batchEdit: (device) => {
    return apiPut(`/api/device-batch`, device);
  },
  reset: (id) => {
    return apiPost(`/api/device/${id}/reset`);
  },
  remove: (id) => {
    return apiDelete(`/api/device/${id}`);
  },
  reference: () => {
    return apiGet(`/api/reference-device`);
  },
  status: (id, device) => {
    return apiPost(`/api/device/${id}/status`, device);
  },
  statusBySN: (serialNumber, status) => {
    return apiPut(`/api/device-unlock?serial-number=${serialNumber}`, status);
  },
  pulseName: (id, device) => {
    return apiPost(`/api/device/${id}/pulse-name`, device);
  },
  serialNumber: (id, device) => {
    return apiPut(`/api/device/${id}/serial-number`, device);
  },
  deviceAssign: (data) => {
    return apiPut(`/api/device-assign`, data);
  },
  setDeviceStep: (data)=>{
    return apiPost(`/api/device-step`, data);
  }
};

export default DeviceService;
