import DeviceService from '../service/device';

import {
	GET_DEVICE_LIST,
	GET_DEVICE_DETAIL,
	POST_DEVICE_DETAIL,
	PUT_DEVICE_DETAIL,
	REMOVE_DEVICE,
	PATCH_DEVICE_STATUS,
	DEVICE_PULSE_NAME,
	DEVICE_SERIAL_NUMBER,
	GET_REF_DEVICE
} from '../constants/index';


export function getDeviceList(pager) {
	return dispatch => {
		DeviceService.list(pager).then((result) => {
			dispatch({
				type: GET_DEVICE_LIST,
				result: { fetch: true, result },
			});
		}).catch((result) => {
			dispatch({
				type: GET_DEVICE_LIST,
				result: { fetch: false, result },
			});
		});
	};
}

export function getDeviceDetail(id) {
	return dispatch => {
		DeviceService.detail(id).then((result) => {
			dispatch({
				type: GET_DEVICE_DETAIL,
				result: { fetch: true, result },
			});
		}).catch((result) => {
			dispatch({
				type: GET_DEVICE_DETAIL,
				result: { fetch: false, result },
			});
		});
	};
}

export function postDeviceDetail(device) {
	return dispatch => {
		DeviceService.create(device).then((result) => {
			dispatch({
				type: POST_DEVICE_DETAIL,
				result: { fetch: true, result },
			});
		}).catch((result) => {
			dispatch({
				type: POST_DEVICE_DETAIL,
				result: { fetch: false, result },
			});
		});
	};
}

export function putDeviceDetail(id, device) {
	return dispatch => {
		DeviceService.edit(id, device).then((result) => {
			dispatch({
				type: PUT_DEVICE_DETAIL,
				result: { fetch: true, result },
			});
		}).catch((result) => {
			dispatch({
				type: PUT_DEVICE_DETAIL,
				result: { fetch: false, result },
			});
		});
	};
}

export function deleteDevice(id) {
	return dispatch => {
		DeviceService.edit(id).then((result) => {
			dispatch({
				type: REMOVE_DEVICE,
				result: { fetch: true, result },
			});
		}).catch((result) => {
			dispatch({
				type: REMOVE_DEVICE,
				result: { fetch: false, result },
			});
		});
	};
}

export function patchDeviceStatus(id, device) {
	return dispatch => {
		DeviceService.status(id, device).then((result) => {
			dispatch({
				type: PATCH_DEVICE_STATUS,
				result: { fetch: true, result },
			});
		}).catch((result) => {
			dispatch({
				type: PATCH_DEVICE_STATUS,
				result: { fetch: false, result },
			});
		});
	};
}

export function patchPulseName(id, device) {
	return dispatch => {
		DeviceService.pulseName(id, device).then((result) => {
			dispatch({
				type: DEVICE_PULSE_NAME,
				result: { fetch: true, result },
			});
		}).catch((result) => {
			dispatch({
				type: DEVICE_PULSE_NAME,
				result: { fetch: false, result },
			});
		});
	};
}

export function patchSerialNumber(id, device) {
	return dispatch => {
		DeviceService.serialNumber(id, device).then((result) => {
			dispatch({
				type: DEVICE_SERIAL_NUMBER,
				result: { fetch: true, result },
			});
		}).catch((result) => {
			dispatch({
				type: DEVICE_SERIAL_NUMBER,
				result: { fetch: false, result },
			});
		});
	};
}

export function getRefDevice() {
	return dispatch => {
		DeviceService.reference().then((result) => {
			dispatch({
				type: GET_REF_DEVICE,
				result: { fetch: true, result },
			});
		}).catch((result) => {
			dispatch({
				type: GET_REF_DEVICE,
				result: { fetch: false, result },
			});
		});
	};
}



