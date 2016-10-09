import api from '../library/axios/api';

const UserService = {
	list: (id) => {
		return api.get('/api/user/:' + id).then((response) => {
			return response.data;
		}).then(function (response) {
			return response.data;
		}, function (response) {
			throw new Error(response.data);
		});;
	},
	detail: (id) => {
		return api.get('/api/user/:' + id).then((response) => {
			return response.data;
		});
	},
	create: (device) => {
		return api.post('/api/user', {
			data: device
		}).then(function (response) {
			return response.data;
		}, function (response) {
			throw new Error(response.data);
		});
	},
	edit: (id, device) => {
		return api.put('/api/user/:' + id, {
			data: device
		}).then(function (response) {
			return response.data;
		}, function (response) {
			throw new Error(response.data);
		});
	},
	remove: (id) => {
		return api.delete('/api/user/:' + id).then(function (response) {
			return response.data;
		}, function (response) {
			throw new Error(response.data);
		});
	}
};

export default UserService;
