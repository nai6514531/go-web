import {
	GETING_PROVINCE_LIST,
	GET_PROVINCE_LIST,
	GETING_PROVINCE_DETAIL,
	GET_PROVINCE_DETAIL,
	GETING_PROVINCE_CITY_LIST,
	GET_PROVINCE_CITY_LIST,
	GETING_PROVINCE_SCHOOL_LIST,
	GET_PROVINCE_SCHOOL_LIST,

	GETING_CITY_LIST,
	GET_CITY_LIST,
	GETING_CITY_DETAIL,
	GET_CITY_DETAIL,

	GETING_DISTRICT_LIST,
	GET_DISTRICT_LIST,
	GETING_DISTRICT_DETAIL,
	GET_DISTRICT_DETAIL,
} from '../constants/index';

const initialState = {
	region: {},
};

export default function (state = initialState, action) {
	switch (action.type) {
		case GETING_PROVINCE_LIST:
			return {
				...state,
			};
		case GET_PROVINCE_LIST:
			return {
				...state,
				province: { list: action.result, }
			};
		case GETING_PROVINCE_DETAIL:
			return {
				...state,
			};
		case GET_PROVINCE_DETAIL:
			return {
				...state,
				province: { detail: action.result, }
			};
		
		case GETING_PROVINCE_CITY_LIST:
			return {
				...state,
			};
		case GET_PROVINCE_CITY_LIST:
			return {
				...state,
				province: { city: action.result, }
			};
		case GETING_PROVINCE_SCHOOL_LIST:
			return {
				...state,
			};
		case GET_PROVINCE_SCHOOL_LIST:
			return {
				...state,
				province: { school: action.result, }
			};
		
		case GETING_CITY_LIST:
			return {
				...state,
			};
		case GET_CITY_LIST:
			return {
				...state,
				city: { list: action.result, }
			};
		case GETING_CITY_DETAIL:
			return {
				...state,
			};
		case GET_CITY_DETAIL:
			return {
				...state,
				city: { detail: action.result, }
			};

		case GETING_DISTRICT_LIST:
			return {
				...state,
			};
		case GET_DISTRICT_LIST:
			return {
				...state,
				district: { list: action.result, }
			};
		case GETING_DISTRICT_DETAIL:
			return {
				...state,
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



