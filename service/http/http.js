// utils/request.js
import {
	GetToken,
	ClearToken,
	GetRemoteUrl
} from '../store/local';

const codeMessage = {
	200: '服务器成功返回请求的数据。',
	201: '新建或修改数据成功。',
	400: '请求错误，请检查输入。',
	401: '未授权，请重新登录。',
	403: '拒绝访问。',
	404: '请求地址不存在。',
	500: '服务器发生错误，请稍后重试。',
};

const neglectUrl = ['/configs/info/web', '/stats']; // 需要忽略错误处理的 URL

// 统一请求封装
const request = (url, method = 'GET', data = {}, options = {}) => {
	console.log('>>请求地址>>', url);
	return new Promise((resolve, reject) => {
		uni.request({
			url: GetRemoteUrl() + url,
			method,
			data,
			header: {
				'Content-Type': 'application/json',
				'ngrok-skip-browser-warning': 'easynvr',
				Authorization: `Bearer ${GetToken() || ''}`, // 添加 Token 认证
				...options.headers,
			},
			timeout: 10000,
			success: (res) => {
				const {
					statusCode,
					data
				} = res;

				if (statusCode >= 200 && statusCode < 300) {
					resolve(data);
				} else {
					handleError(statusCode, data, url);
					reject(data);
				}
			},
			fail: (err) => {
				console.error('请求失败:', err);
				reject(err);
			},
		});
	});
};

// 处理 HTTP 错误
const handleError = (status, data, url) => {
	if (neglectUrl.includes(url)) return;
	const errorText = data?.msg || codeMessage[status] || '请求失败';
	switch (status) {
		case 401:
			uni.showToast({
				title: '登录已过期，请重新登录',
				icon: 'none'
			});
			ClearToken(); // 清理登录信息
			uni.reLaunch({
				url: '/pages/login/login'
			});
			break;
		case 404:
			uni.showToast({
				title: '请求资源不存在',
				icon: 'none'
			});
			break;
		case 400:
			uni.showToast({
				title: errorText,
				icon: 'none'
			});
			break;
		default:
			uni.showToast({
				title: errorText,
				icon: 'none'
			});
			break;
	}
};

// 具体请求方法封装
export const GET = (url, params = {}, options = {}) => request(url, 'GET', params, options);
export const POST = (url, data = {}, options = {}) => request(url, 'POST', data, options);
export const PUT = (url, data = {}, options = {}) => request(url, 'PUT', data, options);
export const DELETE = (url, data = {}, options = {}) => request(url, 'DELETE', data, options);

export const ErrorHandle = (err) => {
	if (err.msg) {
		uni.showToast({
			title: err.msg,
			icon: 'none'
		});
	}
}


// 封装
// 封装 GET 请求
export async function GetFetch(url) {
	try {
		const token = GetToken(); // 获取 token
		return new Promise((resolve, reject) => {
			uni.request({
				url: url, // 请求的 URL
				method: 'GET',
				header: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}` // 添加 Bearer Token
				},
				success: (res) => {
					resolve(res.data);
				},
				fail: (err) => {
					reject(new Error('Request failed: ' + err.errMsg));
				}
			});
		});
	} catch (error) {
		console.error('Error:', error);
		throw error; // 抛出错误，调用方可以捕获
	}
}