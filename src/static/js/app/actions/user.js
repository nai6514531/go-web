import {
	list,
	detail,
	create,
	edit,
	remove,
} from '../service/user/UserService';

import {
	GETING_USER_LIST,
	GET_USER_LIST,
	GETING_USER_DETAIL,
	GET_USER_DETAIL,
	POSTING_USER_DETAIL,
	POST_USER_DETAIL,
	PUTING_USER_DETAIL,
	PUT_USER_DETAIL,
	REMOVING_USER,
	REMOVE_USER,
} from '../constants/index';


export function userList() {
	return dispatch => {
		dispatch({
			type: GETING_USER_LIST,
		});
		list().then((result) => {
			dispatch({
				type: GET_USER_LIST,
				result,
			});
		});
	};
}

export function userDetail(id) {
	return dispatch => {
		dispatch({
			type: GETING_USER_DETAIL,
		});
		detail(id).then((result) => {
			dispatch({
				type: GET_USER_DETAIL,
				result,
			});
		}).catch(() => {
			dispatch({
				type: GET_USER_DETAIL,
			});
		});
	};
}

export function userCreate(user) {
	return dispatch => {
		dispatch({
			type: POSTING_USER_DETAIL,
		});
		create(user).then((result) => {
			dispatch({
				type: POST_USER_DETAIL,
				result,
			});
		});
	};
}

export function userEdit(id, user) {
	return dispatch => {
		dispatch({
			type: PUTING_USER_DETAIL,
		});
		edit(id, user).then((result) => {
			dispatch({
				type: PUT_USER_DETAIL,
				result,
			});
		});
	};
}

export function userRemove(id) {
	return dispatch => {
		dispatch({
			type: REMOVING_USER,
		});
		remove(id).then((result) => {
			dispatch({
				type: REMOVE_USER,
				result,
			});
		});
	};
}


