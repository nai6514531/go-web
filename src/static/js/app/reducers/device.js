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
				detail: action.result,
			};
		case PUT_DEVICE_DETAIL:
			return {
				...state,
				detail: action.result,
			};
		case REMOVE_DEVICE:
			return {
				...state,
				result: action.result,
			};
		case PATCH_DEVICE_STATUS:
			return {
				...state,
				status: action.result,
			};
		case DEVICE_PULSE_NAME:
			return {
				...state,
				pulse_name: action.result,
			};
		case DEVICE_SERIAL_NUMBER:
			return {
				...state,
				result: action.result,
			};
		case GET_REF_DEVICE:
			return {
				...state,
				ref_device: action.result,
			};
		default:
			return state;
	}
}



