import axios from 'axios';
import NProgress from "nprogress";

const api = axios.create({
	headers: {
    	'Content-Type': 'application/json'
  	},
	transformRequest: [(data) => {
		NProgress.start();
		if (!data) {
			return '';
		}
		return JSON.stringify(data.data);
	}],
	transformResponse: [(data) => {
		NProgress.done();
		if (!data) {
			return '';
		}
		return JSON.parse(data);
	}],
});

function handleResponse(promise, resolve, reject) {
	return promise.then((response) => {
		return response.data;
	}).then(( data ) => {
		if (!data) {
			reject(data);
			return;
		}
		let code = data.status;
		code = code.substring(code.length-2);
		code = parseInt(code);
		data.loading = false;
		if (code !== 0) {
			reject(data);
		} else {
			resolve(data);
		}
	});
}

export function apiGet(url) {
	return new Promise((resolve, reject) => {
		const promise = api.get(url);
		return handleResponse(promise, resolve, reject);
	});
}

export function apiPost(url, data) {
	return new Promise((resolve, reject) => {
		const promise = api.post(url, { data });
		return handleResponse(promise, resolve, reject);
	});
}
export function apiPut(url, data) {
	return new Promise((resolve, reject) => {
		const promise = api.put(url, { data });
		return handleResponse(promise, resolve, reject);
	});
}

export function apiDelete(url) {
	return new Promise((resolve, reject) => {
		const promise = api.delete(url);
		return handleResponse(promise, resolve, reject);
	});
}

export function apiPatch(url, data) {
	return new Promise((resolve, reject) => {
		const promise = api.patch(url, {data});
		return handleResponse(promise, resolve, reject);
	});
}
