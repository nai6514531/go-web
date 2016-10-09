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

const initialState = {
	device: {},
};

export default function (state = initialState, action) {
	switch (action.type) {
		case GETING_DEVICE_LIST:
			return {
				...state,
			};
		case GET_DEVICE_LIST:
			return {
				...state,
				list: action.result,
			};
		case GETING_DEVICE_DETAIL:
			return {
				...state,
			};
		case GET_DEVICE_DETAIL:
			return {
				...state,
				detail: action.result,
			};
		case POSTING_DEVICE_DETAIL:
			return {
				...state,
			};
		case POST_DEVICE_DETAIL:
			return {
				...state,
				detail: action.result,
			};
		case PUTING_DEVICE_DETAIL:
			return {
				...state,
			};
		case PUT_DEVICE_DETAIL:
			return {
				...state,
				detail: action.result,
			};
		case REMOVING_DEVICE:
			return {
				...state,
			};
		case REMOVE_DEVICE:
			return {
				...state,
				result: action.result,
			};
		default:
			return state;
	}
}



