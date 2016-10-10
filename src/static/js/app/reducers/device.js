import {
	GET_DEVICE_LIST,
	GET_DEVICE_DETAIL,
	POST_DEVICE_DETAIL,
	PUT_DEVICE_DETAIL,
	REMOVE_DEVICE,

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
		case GET_REF_DEVICE:
			return {
				...state,
				ref_device: action.result,
			};
		default:
			return state;
	}
}



