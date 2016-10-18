import SchoolService from '../service/school';

import {
	GET_SCHOOLDETAIL,
} from '../constants/index';


export function getSchoolDetail() {
	return dispatch => {
		SchoolService.list().then((result) => {
			dispatch({
				type: GET_SCHOOLDETAIL,
				result: { fetch: true, result },
			});
		}).catch((result) => {
			dispatch({
				type: GET_SCHOOLDETAIL,
				result: { fetch: false, result },

			});
		});
	};
}

