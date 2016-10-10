import {
	GET_PROVINCE_LIST,
	GET_PROVINCE_DETAIL,
	GET_PROVINCE_CITY_LIST,
	GET_PROVINCE_SCHOOL_LIST,

	GET_CITY_LIST,
	GET_CITY_DETAIL,
	GET_CITY_DISTRICT_LIST,

	GET_DISTRICT_DETAIL,
} from '../constants/index';

const initialState = {
	region: {},
};

export default function (state = initialState, action) {
	switch (action.type) {
		case GET_PROVINCE_LIST:
			return {
				...state,
				province: { list: action.result, }
			};
		case GET_PROVINCE_DETAIL:
			return {
				...state,
				province: { detail: action.result, }
			};
		case GET_PROVINCE_CITY_LIST:
			return {
				...state,
				province: { city: action.result, }
			};
		case GET_PROVINCE_SCHOOL_LIST:
			return {
				...state,
				province: { school: action.result, }
			};
		case GET_CITY_LIST:
			return {
				...state,
				city: { list: action.result, }
			};
		case GET_CITY_DETAIL:
			return {
				...state,
				city: { detail: action.result, }
			};
		case GET_CITY_DISTRICT_LIST:
			return {
				...state,
				city: { district: action.result, }
			};
		case GET_DISTRICT_DETAIL:
			return {
				...state,
				district: { detail: action.result, }
			};

		default:
			return state;
	}
}



