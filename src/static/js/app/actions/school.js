import SchoolService from '../service/school';

import {
	GET_SCHOOL_DETAIL,
} from '../constants/index';


export function getSchoolDetail() {
	return dispatch => {
		SchoolService.list().then((result) => {
			dispatch({
				type: GET_SCHOOL_DETAIL,
				result: { fetch: true, result },
			});
		}).catch((result) => {
			dispatch({
				type: GET_SCHOOL_DETAIL,
				result: { fetch: false, result },

			});
		});
	};
}

