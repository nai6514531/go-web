import {
	GET_DEVICE_LIST,
	GET_DEVICE_DETAIL,
	POST_DEVICE_DETAIL,
	PUT_DEVICE_DETAIL,
	REMOVE_DEVICE,
	PATCH_DEVICE_STATUS,
	DEVICE_PULSE_NAME,
	DEVICE_SERIAL_NUMBER,
	GET_REF_DEVICE,
	RESET_DEVICE,
} from '../constants/index';

const initialState = {
	device: {},
};

export default function (state = initialState, action) {
	switch (action.type) {
		case GET_DEVICE_LIST:
			return {
				...state,
				list: action.result,
			};
		case GET_DEVICE_DETAIL:
			return {
				...state,
				detail: action.result,
			};
		case POST_DEVICE_DETAIL:
			return {
				...state,
				resultPostDetail: action.result,
			};
		case PUT_DEVICE_DETAIL:
			return {
				...state,
				resultPutDetail: action.result,
			};
		case RESET_DEVICE:
			return {
				...state,
				resultReset: action.result,
			};
		case REMOVE_DEVICE:
			return {
				...state,
				resultRemove: action.result,
			};
		case PATCH_DEVICE_STATUS:
			return {
				...state,
				status: action.result,
			};
		case DEVICE_PULSE_NAME:
			return {
				...state,
				pulseName: action.result,
			};
		case DEVICE_SERIAL_NUMBER:
			return {
				...state,
				resultSerialNumber: action.result,
			};
		case GET_REF_DEVICE:
			return {
				...state,
				refDevice: action.result,
			};
		default:
			return state;
	}
}



