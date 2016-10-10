import  UserService from '../service/user';

import {
	GET_USER_LIST,
	GET_USER_DETAIL,
	POST_USER_DETAIL,
	PUT_USER_DETAIL,
	REMOVE_USER,
} from '../constants/index';


export function userList() {
	return dispatch => {
		UserService.list().then((result) => {
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


