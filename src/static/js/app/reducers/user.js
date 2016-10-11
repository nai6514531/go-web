import {
	GET_USER_LIST,
	GET_USER_DETAIL,
	POST_USER_DETAIL,
	PUT_USER_DETAIL,
	REMOVE_USER,
	GET_USER_SCHOOL,
	GET_USER_SCHOOL_DEVICE,
	GET_USER_PERMISSION,
	USER_LOGOUT,
	GET_USER_MENU,
	GET_USER_DEVICE,
} from '../constants/index';

const initialState = {
	user: {},
};

export default function (state = initialState, action) {
	switch (action.type) {
		case GET_USER_LIST:
			return {
				...state,
				list: action.result,
			};
		case GET_USER_DETAIL:
			return {
				...state,
				detail: action.result,
			};
		case POST_USER_DETAIL:
			return {
				...state,
				detail: action.result,
			};
		case PUT_USER_DETAIL:
			return {
				...state,
				detail: action.result,
			};
		case REMOVE_USER:
			return {
				...state,
				result: action.result,
			};
		case GET_USER_SCHOOL:
			return {
				...state,
				school: action.result,
			};
		case GET_USER_SCHOOL_DEVICE:
			return {
				...state,
				school_device: action.result,
			};
		case GET_USER_PERMISSION:
			return {
				...state,
				permission: action.result,
			};
		case USER_LOGOUT:
			return {
				...state,
				result: action.result,
			};
		case GET_USER_MENU:
			return {
				...state,
				menu: action.result,
			};
		case GET_USER_DEVICE:
			return {
				...state,
				device: action.result,
			};
		default:
			return state;
	}
}



