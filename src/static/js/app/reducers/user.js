import {
	GETING_USER_LIST,
	GET_USER_LIST,
	GETING_USER_DETAIL,
	GET_USER_DETAIL,
	POSTING_USER_DETAIL,
	POST_USER_DETAIL,
	PUTING_USER_DETAIL,
	PUT_USER_DETAIL,
	REMOVING_USER,
	REMOVE_USER,
} from '../constants/index';

const initialState = {
	user: {},
};

export default function (state = initialState, action) {
	switch (action.type) {
		case GETING_USER_LIST:
			return {
				...state,
			};
		case GET_USER_LIST:
			return {
				...state,
				list: action.result,
			};
		case GETING_USER_DETAIL:
			return {
				...state,
			};
		case GET_USER_DETAIL:
			return {
				...state,
				detail: action.result,
			};
		case POSTING_USER_DETAIL:
			return {
				...state,
			};
		case POST_USER_DETAIL:
			return {
				...state,
				detail: action.result,
			};
		case PUTING_USER_DETAIL:
			return {
				...state,
			};
		case PUT_USER_DETAIL:
			return {
				...state,
				detail: action.result,
			};
		case REMOVING_USER:
			return {
				...state,
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



