import axios from 'axios';

const api = axios.create({
  headers: {
    'Content-Type': 'application/json'
  },
  transformRequest: [(data) => {
    if (!data) {
      return '';
    }
    return JSON.stringify(data.data);
  }]
});

export function apiGet(url) {
	return api.get(url).then((response) => {
		return response.data;
	}, function (response) {
		throw new Error(response.data);
	});
}

export function apiPost(url, data) {
	return api.post(url, {
		data: data
	}).then(function (response) {
		return response.data;
	}, function (response) {
		throw new Error(response.data);
	});
}

export function apiPut(url, data) {
	return api.put(url, {
		data: data
	}).then(function (response) {
		return response.data;
	}, function (response) {
		throw new Error(response.data);
	});
}

export function apiDelete(url) {
	return api.delete(url).then(function (response) {
		return response.data;
	}, function (response) {
		throw new Error(response.data);
	});
}
