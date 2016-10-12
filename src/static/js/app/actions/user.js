import  UserService from '../service/user';

import {
	GET_USER_LIST,
	GET_USER_DETAIL,
	POST_USER_DETAIL,
	PUT_USER_DETAIL,
	REMOVE_USER,
	GET_USER_SCHOOL,
	GET_USER_SCHOOL_DEVICE,
	GET_USER_PERMISSION,
	USER_LOGOUT,
	GET_USER_MENU,
	GET_USER_DEVICE,
} from '../constants/index';


export function userList(pager) {
	return dispatch => {
		UserService.list(pager).then((result) => {
			dispatch({
				type: GET_USER_LIST,
				result: { fetch: true, result },
			});
		}).catch((msg) => {
			dispatch({
				type: GET_USER_LIST,
				result: { fetch: false, msg },

			});
		});
	};
}

export function userDetail(id) {
	return dispatch => {
		UserService.detail(id).then((result) => {
			dispatch({
				type: GET_USER_DETAIL,
				result: { fetch: true, result },
			});
		}).catch((msg) => {
			dispatch({
				type: GET_USER_DETAIL,
				result: { fetch: false, msg },

			});
		});
	};
}

export function userCreate(user) {
	return dispatch => {
		UserService.create(user).then((result) => {
			dispatch({
				type: POST_USER_DETAIL,
				result: { fetch: true, result },
			});
		}).catch((msg) => {
			dispatch({
				type: POST_USER_DETAIL,
				result: { fetch: false, msg },

			});
		});
	};
}

export function userEdit(id, user) {
	return dispatch => {
		UserService.edit(id, user).then((result) => {
			dispatch({
				type: PUT_USER_DETAIL,
				result: { fetch: true, result },
			});
		}).catch((msg) => {
			dispatch({
				type: PUT_USER_DETAIL,
				result: { fetch: false, msg },

			});
		});
	};
}

export function userRemove(id) {
	return dispatch => {
		UserService.remove(id).then((result) => {
			dispatch({
				type: REMOVE_USER,
				result: { fetch: true, result },
			});
		}).catch((msg) => {
			dispatch({
				type: REMOVE_USER,
				result: { fetch: false, msg },

			});
		});
	};
}

export function userSchool(id) {
	return dispatch => {
		UserService.school(id).then((result) => {
			dispatch({
				type: GET_USER_SCHOOL,
				result: { fetch: true, result },
			});
		}).catch((msg) => {
			dispatch({
				type: GET_USER_SCHOOL,
				result: { fetch: false, msg },

			});
		});
	};
}

export function schoolDevice(id, school_id) {
	return dispatch => {
		UserService.schoolDevice(id, school_id).then((result) => {
			dispatch({
				type: GET_USER_SCHOOL_DEVICE,
				result: { fetch: true, result },
			});
		}).catch((msg) => {
			dispatch({
				type: GET_USER_SCHOOL_DEVICE,
				result: { fetch: false, msg },

			});
		});
	};
}

export function userPermission(id) {
	return dispatch => {
		UserService.permission(id).then((result) => {
			dispatch({
				type: GET_USER_PERMISSION,
				result: { fetch: true, result },
			});
		}).catch((msg) => {
			dispatch({
				type: GET_USER_PERMISSION,
				result: { fetch: false, msg },

			});
		});
	};
}


export function userLogout() {
	return dispatch => {
		UserService.logout().then((result) => {
			dispatch({
				type: USER_LOGOUT,
				result: { fetch: true, result },
			});
		}).catch((msg) => {
			dispatch({
				type: USER_LOGOUT,
				result: { fetch: false, msg },

			});
		});
	};
}


export function userMenu(id) {
	return dispatch => {
		UserService.menu(id).then((result) => {
			dispatch({
				type: GET_USER_MENU,
				result: { fetch: true, result },
			});
		}).catch((msg) => {
			dispatch({
				type: GET_USER_MENU,
				result: { fetch: false, msg },

			});
		});
	};
}

export function userDevice(id) {
	return dispatch => {
		UserService.device(id).then((result) => {
			dispatch({
				type: GET_USER_DEVICE,
				result: { fetch: true, result },
			});
		}).catch((msg) => {
			dispatch({
				type: GET_USER_DEVICE,
				result: { fetch: false, msg },

			});
		});
	};
}



