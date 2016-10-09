import {
  province,
  city,
  district,
} from '../service/region/RegionService';


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

export function provinceList() {
	return dispatch => {
		dispatch({
			type: GETING_PROVINCE_LIST,
		});
		province.list().then((result) => {
			dispatch({
				type: GET_PROVINCE_LIST,
				result,
			});
		});
	};
}

export function provinceDetail(id) {
	return dispatch => {
		dispatch({
			type: GETING_PROVINCE_DETAIL,
		});
		province.detail(id).then((result) => {
			dispatch({
				type: GET_PROVINCE_DETAIL,
				result,
			});
		}).catch(() => {
			dispatch({
				type: GET_PROVINCE_DETAIL,
			});
		});
	};
}

export function provinceCityList() {
	return dispatch => {
		dispatch({
			type: GETING_PROVINCE_CITY_LIST,
		});
		province.city().then((result) => {
			dispatch({
				type: GET_PROVINCE_CITY_LIST,
				result,
			});
		});
	};
}

export function provinceSchoolList() {
	return dispatch => {
		dispatch({
			type: GETING_PROVINCE_SCHOOL_LIST,
		});
		province.school().then((result) => {
			dispatch({
				type: GET_PROVINCE_SCHOOL_LIST,
				result,
			});
		});
	};
}

export function cityList(id) {
	return dispatch => {
		dispatch({
			type: GETING_CITY_LIST,
		});
		city.list(id).then((result) => {
			dispatch({
				type: GET_CITY_LIST,
				result,
			});
		});
	};
}

export function cityDetail(id) {
	return dispatch => {
		dispatch({
			type: GETING_CITY_DETAIL,
		});
		city.detail(id).then((result) => {
			dispatch({
				type: GET_CITY_DETAIL,
				result,
			});
		}).catch(() => {
			dispatch({
				type: GET_CITY_DETAIL,
			});
		});
	};
}

export function districtList(id) {
	return dispatch => {
		dispatch({
			type: GETING_DISTRICT_LIST,
		});
		district.list(id).then((result) => {
			dispatch({
				type: GET_DISTRICT_LIST,
				result,
			});
		});
	};
}

export function districtDetail(id) {
	return dispatch => {
		dispatch({
			type: GETING_DISTRICT_DETAIL,
		});
		district.detail(id).then((result) => {
			dispatch({
				type: GET_DISTRICT_DETAIL,
				result,
			});
		}).catch(() => {
			dispatch({
				type: GET_DISTRICT_DETAIL,
			});
		});
	};
}



