import RegionService from '../service/region';

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

export function provinceList() {
	return dispatch => {
		RegionService.province.list().then((result) => {
			dispatch({
				type: GET_PROVINCE_LIST,
				result: { fetch: true, result },
			});
		}).catch((msg) => {
			dispatch({
				type: GET_PROVINCE_LIST,
				result: { fetch: false, msg },

			});
		});
	};
}

export function provinceDetail(id) {
	return dispatch => {
		RegionService.province.detail(id).then((result) => {
			dispatch({
				type: GET_PROVINCE_DETAIL,
				result: { fetch: true, result },
			});
		}).catch((msg) => {
			dispatch({
				type: GET_PROVINCE_DETAIL,
				result: { fetch: false, msg },

			});
		});
	};
}

export function provinceCityList(id) {
	return dispatch => {
		RegionService.province.city(id).then((result) => {
			dispatch({
				type: GET_PROVINCE_CITY_LIST,
				result: { fetch: true, result },
			});
		}).catch((msg) => {
			dispatch({
				type: GET_PROVINCE_CITY_LIST,
				result: { fetch: false, msg },

			});
		});
	};
}

export function provinceSchoolList(id) {
	return dispatch => {
		RegionService.province.school(id).then((result) => {
			dispatch({
				type: GET_PROVINCE_SCHOOL_LIST,
				result: { fetch: true, result },
			});
		}).catch((msg) => {
			dispatch({
				type: GET_PROVINCE_SCHOOL_LIST,
				result: { fetch: false, msg },

			});
		});
	};
}

export function cityList() {
	return dispatch => {
		RegionService.city.list(id).then((result) => {
			dispatch({
				type: GET_CITY_LIST,
				result: { fetch: true, result },
			});
		}).catch((msg) => {
			dispatch({
				type: GET_CITY_LIST,
				result: { fetch: false, msg },

			});
		});
	};
}

export function cityDetail(id) {
	return dispatch => {
		RegionService.city.detail(id).then((result) => {
			dispatch({
				type: GET_CITY_DETAIL,
				result: { fetch: true, result },
			});
		}).catch((msg) => {
			dispatch({
				type: GET_CITY_DETAIL,
				result: { fetch: false, msg },

			});
		});
	};
}

export function cityDistrictList(id) {
	return dispatch => {
		RegionService.city.district(id).then((result) => {
			dispatch({
				type: GET_CITY_DISTRICT_LIST,
				result: { fetch: true, result },
			});
		}).catch((msg) => {
			dispatch({
				type: GET_CITY_DISTRICT_LIST,
				result: { fetch: false, msg },

			});
		});
	};
}

export function cityDistrictDetail(id) {
	return dispatch => {
		RegionService.district.detail(id).then((result) => {
			dispatch({
				type: GET_DISTRICT_DETAIL,
				result: { fetch: true, result },
			});
		}).catch((msg) => {
			dispatch({
				type: GET_CITY_DISTRICT_LIST,
				result: { fetch: false, msg },

			});
		});
	};
}



