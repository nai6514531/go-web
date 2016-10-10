import {
	GET_USER_LIST,
	GET_USER_DETAIL,
	POST_USER_DETAIL,
	PUT_USER_DETAIL,
	REMOVE_USER,
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
		default:
			return state;
	}
}



