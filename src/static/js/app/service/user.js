import { apiGet, apiPost, apiPut, apiDelete } from '../library/axios/api';

const UserService = {
	list: () => {
		return apiGet(`/api/user`);
	},
	detail: (id) => {
		return apiGet(`/api/user/:${id}`);
	},
	create: (user) => {
		return apiPost(`/api/user`, user);
	},
	edit: (id, user) => {
		return apiPut(`/api/user/:${id}`, user);
	},
	remove: (id) => {
		return apiDelete(`/api/user/:${id}`);
	}
};

export default UserService;
