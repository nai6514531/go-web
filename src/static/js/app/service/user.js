import { apiGet, apiPost, apiPut, apiDelete } from '../library/axios/api';

const UserService = {
	list: () => {
		return apiGet(`/api/user`);
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
	school: (id) => {
		return apiGet(`/api/user/${id}/school`);
	},
	schoolDevice:(id, school_id) => {
		return apiGet(`/api/user/${id}/school/${school_id}/device`);
	},
	permission: (id) => {
		return apiGet(`/api/user/${id}/permission`);
	},
	logout: () => {
		return apiGet(`/api/user/signout`);
	},
	menu: (id) => {
		return apiGet(`/api/user/${id}/menu`);
	},
	device: (id) => {
		return apiGet(`/api/user/${id}/device`);
	}
};

export default UserService;
