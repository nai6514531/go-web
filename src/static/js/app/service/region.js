import api from '../library/axios/api';

const RegionService = {
	province: {
		list: () => {
			return api.get('/api/province').then((response) => {
				return response.data;
			}).then(function (response) {
				return response.data;
			}, function (response) {
				throw new Error(response.data);
			});;
		},
		detail: (id) => {
			return api.get('/api/province/:' + id ).then((response) => {
				return response.data;
			});
		},
		city: (id) => {
			return api.get('/api/province/:' + id + '/city').then((response) => {
				return response.data;
			});
		},
		school: (id) => {
			return api.get('/api/province/:' + id + '/school').then((response) => {
				return response.data;
			});
		},
	},
	city: {
		list: () => {
			return api.get('/api/city').then((response) => {
				return response.data;
			}).then(function (response) {
				return response.data;
			}, function (response) {
				throw new Error(response.data);
			});;
		},
		detail: (id) => {
			return api.get('/api/city/:' + id).then((response) => {
				return response.data;
			});
		},
	},
	district: {
		list: (id) => {
			return api.get('/api/city/:' + id + '/district').then((response) => {
				return response.data;
			}).then(function (response) {
				return response.data;
			}, function (response) {
				throw new Error(response.data);
			});;
		},
		detail: (id) => {
			return api.get('/api/district/:' + id).then((response) => {
				return response.data;
			});
		},
	}
};

export default RegionService;
