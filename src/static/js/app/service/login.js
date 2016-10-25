import { apiPost } from '../library/axios/api'

const Service = {
	login: (data) => {
		return apiPost('/api/signin', {
			account: data.account,
			password: data.password,
			verificode: data.verificode,
			captcha: data.captcha,
		})
	},
};

export default Service;
