import DeviceService from '../service/device';

import {
	GETDEVICE_LIST,
	GETDEVICEDETAIL,
	POSTDEVICEDETAIL,
	PUTDEVICEDETAIL,
	REMOVEDEVICE,
	PATCHDEVICE_STATUS,
	DEVICE_PULSE_NAME,
	DEVICE_SERIAL_NUMBER,
	GET_REFDEVICE
} from '../constants/index';


export function getDeviceList() {
	return dispatch => {
		DeviceService.list().then((result) => {
			dispatch({
				type: GETDEVICE_LIST,
				result: { fetch: true, result },
			});
		}).catch((result) => {
			dispatch({
				type: GETDEVICE_LIST,
				result: { fetch: false, result },
			});
		});
	};
}

export function getDeviceDetail(id) {
	return dispatch => {
		DeviceService.detail(id).then((result) => {
			dispatch({
				type: GETDEVICEDETAIL,
				result: { fetch: true, result },
			});
		}).catch((result) => {
			dispatch({
				type: GETDEVICEDETAIL,
				result: { fetch: false, result },
			});
		});
	};
}

export function postDeviceDetail(device) {
	return dispatch => {
		DeviceService.create(device).then((result) => {
			dispatch({
				type: POSTDEVICEDETAIL,
				result: { fetch: true, result },
			});
		}).catch((result) => {
			dispatch({
				type: POSTDEVICEDETAIL,
				result: { fetch: false, result },
			});
		});
	};
}

export function putDeviceDetail(id, device) {
	return dispatch => {
		DeviceService.edit(id, device).then((result) => {
			dispatch({
				type: PUTDEVICEDETAIL,
				result: { fetch: true, result },
			});
		}).catch((result) => {
			dispatch({
				type: PUTDEVICEDETAIL,
				result: { fetch: false, result },
			});
		});
	};
}

export function deleteDevice(id) {
	return dispatch => {
		DeviceService.edit(id).then((result) => {
			dispatch({
				type: REMOVEDEVICE,
				result: { fetch: true, result },
			});
		}).catch((result) => {
			dispatch({
				type: REMOVEDEVICE,
				result: { fetch: false, result },
			});
		});
	};
}

export function patchDeviceStatus(id, device) {
	return dispatch => {
		DeviceService.status(id, device).then((result) => {
			dispatch({
				type: PATCHDEVICE_STATUS,
				result: { fetch: true, result },
			});
		}).catch((result) => {
			dispatch({
				type: PATCHDEVICE_STATUS,
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
				type: GET_REFDEVICE,
				result: { fetch: true, result },
			});
		}).catch((result) => {
			dispatch({
				type: GET_REFDEVICE,
				result: { fetch: false, result },
			});
		});
	};
}



