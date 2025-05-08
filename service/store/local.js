// utils/storage.js

/**
 * @description 获取本地存储数据（同步）
 * @param {string} key 存储的键名
 * @returns {T | null} 泛型数据
 */
export const getLocalStorage = (key) => {
	const data = uni.getStorageSync(key);
	try {
		return JSON.parse(data);
	} catch (error) {
		return data;
	}
};

/**
 * @description 设置本地存储数据（同步）
 * @param {string} key 存储的键名
 * @param {any} value 需要存储的数据
 */
export const setLocalStorage = (key, value) => {
	try {
		const data = typeof value === 'object' ? JSON.stringify(value) : value;
		uni.setStorageSync(key, data);
	} catch (error) {
		console.error('设置本地存储失败:', error);
	}
};

/**
 * @description 获取会话存储数据（同步）
 * @param {string} key 存储的键名
 * @returns {T | null} 泛型数据
 */
export const getSessionStorage = (key) => {
	const data = uni.getStorageSync(`session_${key}`);
	try {
		return JSON.parse(data);
	} catch (error) {
		return data;
	}
};

/**
 * @description 设置会话存储数据（同步）
 * @param {string} key 存储的键名
 * @param {any} value 需要存储的数据
 */
export const setSessionStorage = (key, value) => {
	try {
		const data = typeof value === 'object' ? JSON.stringify(value) : value;
		uni.setStorageSync(`session_${key}`, data);
	} catch (error) {
		console.error('设置会话存储失败:', error);
	}
};

/**
 * @description 移除本地存储
 * @param {string} key 存储的键名
 */
export const removeLocalStorage = (key) => {
	try {
		uni.removeStorageSync(key);
	} catch (error) {
		console.error('删除本地存储失败:', error);
	}
};

/**
 * @description 移除会话存储
 * @param {string} key 存储的键名
 */
export const removeSessionStorage = (key) => {
	try {
		uni.removeStorageSync(`session_${key}`);
	} catch (error) {
		console.error('删除会话存储失败:', error);
	}
};

/**
 * @description 清除所有存储
 */
export const clearStorage = () => {
	try {
		uni.clearStorageSync();
	} catch (error) {
		console.error('清除存储失败:', error);
	}
};

/**
 * @description 获取 Token
 * @returns {string | null} Token 字符串
 */
export const GetToken = () => {
	return getLocalStorage('token');
};

/**
 * @description 设置 Token
 * @param {string} token Token 字符串
 */
export const SetToken = (token) => {
	setLocalStorage('token', token);
};

/**
 * @description 清除 Token
 */
export const ClearToken = () => {
	removeLocalStorage('token');
};

/**
 * @description 获取用户信息
 * @returns {UserInfo | null} 用户信息
 */
export const GetUserInfo = () => {
	return getLocalStorage('userInfo');
};

/**
 * @description 设置用户信息
 * @param {UserInfo} userInfo 用户信息
 */
export const SetUserInfo = (userInfo) => {
	setLocalStorage('userInfo', userInfo);
}

/**
 * @description 清除用户信息
 */
export const ClearUserInfo = () => {
	removeLocalStorage('userInfo');
}

/**
 * @description 远程 url 地址
 * @returns {string} 远程 url 地址
 */
export const GetRemoteUrl = () => {
	return GetLoginInfo().url;
}



/**
 * @description 设置登录信息
 * @param {string} data 登录信息
 */
export const SetLoginInfo = (data) => {
	setLocalStorage('loginInfo', data);
}


/**
 * @description 获取登录信息
 * @returns {string} 登录信息
 */
export const GetLoginInfo = () => {
	return getLocalStorage('loginInfo');
}