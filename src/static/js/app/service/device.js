import { apiGet, apiPost, apiPut, apiDelete, apiPatch } from '../library/axios/api';

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
		return apiDelete(`/api/device/:${id}`);
	},
	reference: () => {
		return apiGet(`/api/reference-device`);
	},
	status: (id, device) => {
		return apiPatch(`/api/device/:${id}/status`, device);
	},
	pulseName: (id, device) => {
		return apiPatch(`/api/device/:${id}/pulse-name`, device);
	},
	serialNumber: (id, device) => {
		return apiPut(`/api/device/:${id}/serial-number`, device);
	},
};

export default DeviceService;
