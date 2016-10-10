import DeviceService from '../service/device';

import {
	GET_DEVICE_LIST,
	GET_DEVICE_DETAIL,
	POST_DEVICE_DETAIL,
	PUT_DEVICE_DETAIL,
	REMOVE_DEVICE,
	GET_REF_DEVICE
} from '../constants/index';


export function deviceList() {
	return dispatch => {
		DeviceService.list().then((result) => {
			dispatch({
				type: GET_DEVICE_LIST,
				result: { fetch: true, result },
			});
		}).catch((msg) => {
			dispatch({
				type: GET_DEVICE_LIST,
				result: { fetch: false, msg },
				
			});
		});
	};
}

export function deviceDetail(id) {
	return dispatch => {
		DeviceService.detail(id).then((result) => {
			dispatch({
				type: GET_DEVICE_DETAIL,
				result: { fetch: true, result },
			});
		}).catch((msg) => {
			dispatch({
				type: GET_DEVICE_DETAIL,
				result: { fetch: false, msg },

			});
		});
	};
}

export function deviceCreate(device) {
	return dispatch => {
		DeviceService.create(device).then((result) => {
			dispatch({
				type: POST_DEVICE_DETAIL,
				result: { fetch: true, result },
			});
		}).catch((msg) => {
			dispatch({
				type: POST_DEVICE_DETAIL,
				result: { fetch: false, msg },

			});
		});
	};
}

export function deviceEdit(id, device) {
	return dispatch => {
		DeviceService.edit(id, device).then((result) => {
			dispatch({
				type: PUT_DEVICE_DETAIL,
				result: { fetch: true, result },
			});
		}).catch((msg) => {
			dispatch({
				type: PUT_DEVICE_DETAIL,
				result: { fetch: false, msg },

			});
		});
	};
}

export function deviceRemove(id) {
	return dispatch => {
		DeviceService.edit(id).then((result) => {
			dispatch({
				type: REMOVE_DEVICE,
				result: { fetch: true, result },
			});
		}).catch((msg) => {
			dispatch({
				type: REMOVE_DEVICE,
				result: { fetch: false, msg },

			});
		});
	};
}

export function refDevice() {
	return dispatch => {
		DeviceService.reference().then((result) => {
			dispatch({
				type: GET_REF_DEVICE,
				result: { fetch: true, result },
			});
		}).catch((msg) => {
			dispatch({
				type: GET_REF_DEVICE,
				result: { fetch: false, msg },

			});
		});
	};
}



