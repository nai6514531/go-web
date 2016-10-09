import api from '../library/axios/api';

const DeviceService = {
	list: (id) => {
		return api.get('api/device/:' + id).then((response) => {
			return response.data;
		}).then(function (response) {
			return response.data;
		}, function (response) {
			throw new Error(response.data);
		});;
	},
	detail: (id) => {
		return api.get('/api/device/:' + id).then((response) => {
			return response.data;
		});
	},
	create: (device) => {
		return api.post('/api/device', {
			data: device
		}).then(function (response) {
			return response.data;
		}, function (response) {
			throw new Error(response.data);
		});
	},
	edit: (id, device) => {
		return api.put('/api/device/:' + id, {
			data: device
		}).then(function (response) {
			return response.data;
		}, function (response) {
			throw new Error(response.data);
		});
	},
	remove: (id) => {
		return api.delete('/api/device/:' + id).then(function (response) {
			return response.data;
		}, function (response) {
			throw new Error(response.data);
		});
	}
};

export default DeviceService;
