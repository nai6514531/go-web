import {
	list,
	detail,
	create,
	edit,
	remove,
} from '../service/device/DeviceService';

import {
	GETING_DEVICE_LIST,
	GET_DEVICE_LIST,
	GETING_DEVICE_DETAIL,
	GET_DEVICE_DETAIL,
	POSTING_DEVICE_DETAIL,
	POST_DEVICE_DETAIL,
	PUTING_DEVICE_DETAIL,
	PUT_DEVICE_DETAIL,
	REMOVING_DEVICE,
	REMOVE_DEVICE,
} from '../constants/index';


export function deviceList() {
	return dispatch => {
		dispatch({
			type: GETING_DEVICE_LIST,
		});
		list().then((result) => {
			dispatch({
				type: GET_DEVICE_LIST,
				result,
			});
		});
	};
}

export function deviceDetail(id) {
	return dispatch => {
		dispatch({
			type: GETING_DEVICE_DETAIL,
		});
		detail(id).then((result) => {
			dispatch({
				type: GET_DEVICE_DETAIL,
				result,
			});
		}).catch(() => {
			dispatch({
				type: GET_DEVICE_DETAIL,
			});
		});
	};
}

export function deviceCreate(device) {
	return dispatch => {
		dispatch({
			type: POSTING_DEVICE_DETAIL,
		});
		create(device).then((result) => {
			dispatch({
				type: POST_DEVICE_DETAIL,
				result,
			});
		});
	};
}

export function deviceEdit(id, device) {
	return dispatch => {
		dispatch({
			type: PUTING_DEVICE_DETAIL,
		});
		edit(id, device).then((result) => {
			dispatch({
				type: PUT_DEVICE_DETAIL,
				result,
			});
		});
	};
}

export function deviceRemove(id) {
	return dispatch => {
		dispatch({
			type: REMOVING_DEVICE,
		});
		remove(id).then((result) => {
			dispatch({
				type: REMOVE_DEVICE,
				result,
			});
		});
	};
}


