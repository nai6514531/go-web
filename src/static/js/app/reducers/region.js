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
				province_list: action.result,
			};
		case GET_PROVINCE_DETAIL:
			return {
				...state,
				province_detail: action.result,
			};
		case GET_PROVINCE_CITY_LIST:
			return {
				...state,
				province_city: action.result,
			};
		case GET_PROVINCE_SCHOOL_LIST:
			return {
				...state,
				province_school: action.result,
			};
		case GET_CITY_LIST:
			return {
				...state,
				city_list: action.result,
			};
		case GET_CITY_DETAIL:
			return {
				...state,
				city_detail: action.result,
			};
		case GET_CITY_DISTRICT_LIST:
			return {
				...state,
				city_district: action.result,
			};
		case GET_DISTRICT_DETAIL:
			return {
				...state,
				district_detail: action.result,
			};

		default:
			return state;
	}
}



