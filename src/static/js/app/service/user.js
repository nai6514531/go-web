import { apiGet, apiPost, apiPut, apiDelete } from '../library/axios/api';

const UserService = {
	list: (pager) => {
		const { page, perPage } = pager;
		return apiGet(`/api/user?page=${page}&perPage=${perPage}`);
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
	school: (id, pager) => {
		const { page, perPage } = pager;
		return apiGet(`/api/user/${id}/school?page=${page}&perPage=${perPage}`);
	},
	schoolDevice:(id, school_id, pager) => {
		const { page, perPage } = pager;
		return apiGet(`/api/user/${id}/school/${school_id}/device?page=${page}&perPage=${perPage}`);
	},
	permission: (id) => {
		return apiGet(`/api/user/${id}/permission`);
	},
	logout: () => {
		return apiPost(`/api/link/signout`);
	},
	menu: (id) => {
		return apiGet(`/api/user/${id}/menu`);
	},
	device: (id) => {
		return apiGet(`/api/user/${id}/device`);
	}
};

export default UserService;
