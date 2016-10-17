import RegionService from '../service/region';

import {
	GET_PROVINCE_LIST,
	GET_PROVINCEDETAIL,
	GET_PROVINCE_CITY_LIST,
	GET_PROVINCE_SCHOOL_LIST,

	GET_CITY_LIST,
	GET_CITYDETAIL,
	GET_CITYDISTRICT_LIST,


	GETDISTRICTDETAIL,
} from '../constants/index';

export function getProvinceList() {
	return dispatch => {
		RegionService.province.list().then((result) => {
			dispatch({
				type: GET_PROVINCE_LIST,
				result: { fetch: true, result },
			});
		}).catch((result) => {
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
				type: GET_PROVINCEDETAIL,
				result: { fetch: true, result },
			});
		}).catch((result) => {
			dispatch({
				type: GET_PROVINCEDETAIL,
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
		}).catch((result) => {
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
		}).catch((result) => {
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
		}).catch((result) => {
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
				type: GET_CITYDETAIL,
				result: { fetch: true, result },
			});
		}).catch((result) => {
			dispatch({
				type: GET_CITYDETAIL,
				result: { fetch: false, result },

			});
		});
	};
}

export function getCityDistrictList(id) {
	return dispatch => {
		RegionService.city.district(id).then((result) => {
			dispatch({
				type: GET_CITYDISTRICT_LIST,
				result: { fetch: true, result },
			});
		}).catch((result) => {
			dispatch({
				type: GET_CITYDISTRICT_LIST,
				result: { fetch: false, result },

			});
		});
	};
}

export function getCityDistrictDetail(id) {
	return dispatch => {
		RegionService.district.detail(id).then((result) => {
			dispatch({
				type: GETDISTRICTDETAIL,
				result: { fetch: true, result },
			});
		}).catch((result) => {
			dispatch({
				type: GET_CITYDISTRICT_LIST,
				result: { fetch: false, result },

			});
		});
	};
}



