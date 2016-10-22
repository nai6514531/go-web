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

export function getProvinceList() {
	return dispatch => {
		RegionService.province.list().then((result) => {
			dispatch({
				type: GET_PROVINCE_LIST,
				result: { fetch: true, result },
			});
		},(result) => {
			dispatch({
				type: GET_PROVINCE_LIST,
				result: { fetch: false, result },

			});
		});
	};
}

export function getProvinceDetail(id) {
	return dispatch => {
		RegionService.province.detail(id).then((result) => {
			dispatch({
				type: GET_PROVINCE_DETAIL,
				result: { fetch: true, result },
			});
		},(result) => {
			dispatch({
				type: GET_PROVINCE_DETAIL,
				result: { fetch: false, result },

			});
		});
	};
}

export function getProvinceCityList(id) {
	return dispatch => {
		RegionService.province.city(id).then((result) => {
			dispatch({
				type: GET_PROVINCE_CITY_LIST,
				result: { fetch: true, result },
			});
		},(result) => {
			dispatch({
				type: GET_PROVINCE_CITY_LIST,
				result: { fetch: false, result },

			});
		});
	};
}

export function getProvinceSchoolList(id) {
	return dispatch => {
		RegionService.province.school(id).then((result) => {
			dispatch({
				type: GET_PROVINCE_SCHOOL_LIST,
				result: { fetch: true, result },
			});
		},(result) => {
			dispatch({
				type: GET_PROVINCE_SCHOOL_LIST,
				result: { fetch: false, result },

			});
		});
	};
}

export function getCityList() {
	return dispatch => {
		RegionService.city.list().then((result) => {
			dispatch({
				type: GET_CITY_LIST,
				result: { fetch: true, result },
			});
		},(result) => {
			dispatch({
				type: GET_CITY_LIST,
				result: { fetch: false, result },

			});
		});
	};
}

export function getCityDetail(id) {
	return dispatch => {
		RegionService.city.detail(id).then((result) => {
			dispatch({
				type: GET_CITY_DETAIL,
				result: { fetch: true, result },
			});
		},(result) => {
			dispatch({
				type: GET_CITY_DETAIL,
				result: { fetch: false, result },

			});
		});
	};
}

export function getCityDistrictList(id) {
	return dispatch => {
		RegionService.city.district(id).then((result) => {
			dispatch({
				type: GET_CITY_DISTRICT_LIST,
				result: { fetch: true, result },
			});
		},(result) => {
			dispatch({
				type: GET_CITY_DISTRICT_LIST,
				result: { fetch: false, result },

			});
		});
	};
}

export function getCityDistrictDetail(id) {
	return dispatch => {
		RegionService.district.detail(id).then((result) => {
			dispatch({
				type: GET_DISTRICT_DETAIL,
				result: { fetch: true, result },
			});
		},(result) => {
			dispatch({
				type: GET_CITY_DISTRICT_LIST,
				result: { fetch: false, result },

			});
		});
	};
}



