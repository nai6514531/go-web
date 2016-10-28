import SchoolService from '../service/school';

import {
	GET_SCHOOL_DETAIL,
} from '../constants/index';


export function getSchoolDetail(schoolId) {
	return dispatch => {
		SchoolService.detail(schoolId).then((result) => {
			dispatch({
				type: GET_SCHOOL_DETAIL,
				result: { fetch: true, result },
			});
		},(result) => {
			dispatch({
				type: GET_SCHOOL_DETAIL,
				result: { fetch: false, result },

			});
		});
	};
}

