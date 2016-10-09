import { apiGet } from '../library/axios/api';

const RegionService = {
	province: {
		list: () => {
			return apiGet(`/api/province`);
		},
		detail: (id) => {
			return apiGet(`/api/province/:${id}`);
		},
		city: (id) => {
			return apiGet(`/api/province/:${id}/city`);
		},
		school: (id) => {
			return apiGet(`/api/province/:${id}/school`);
		},
	},
	city: {
		list: () => {
			return apiGet(`/api/city`);
		},
		detail: (id) => {
			return apiGet(`/api/city/:${id}`);
		},
		district: (id) => {
			return apiGet(`/api/city/:${id}/district`);
		}
	},
	district: {
		detail: (id) => {
			return apiGet(`/api/district/:${id}`);
		},
	}
};

export default RegionService;
