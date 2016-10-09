import { apiGet, apiPost, apiPut, apiDelete } from '../library/axios/api';

const DeviceService = {
	list: () => {
		return apiGet(`/api/device`);
	},
	detail: (id) => {
		return apiGet(`/api/device/:${id}`);
	},
	create: (device) => {
		return apiPost(`/api/device`,device);
	},
	edit: (id, device) => {
		return apiPut(`/api/device/:${id}`,device);
	},
	remove: (id) => {
		return apiDelete(`/api/device/:${id}`,device);
	}
};

export default DeviceService;
