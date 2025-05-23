import {
	GetRemoteUrl
} from "../store/local";

//拼接base64 前缀
export function SplicBase64String(data) {
	return 'data:image/jpeg;base64,' + data;
}

// 替换 播放地址 域名
export function SplicBaseUrlToRemoteUrl(url) {
	if (!url) return '';

	const remoteUrl = GetRemoteUrl(); // 比如 "https://example.com"

	// 1. 完整 URL，替换域名部分
	if (/^https?:\/\//i.test(url)) {
		// 将原 URL 的协议和域名替换为 remoteUrl
		return url.replace(/^https?:\/\/[^/]+/i, remoteUrl);
	}

	// 2. 绝对路径，以 / 开头
	if (url.startsWith('/')) {
		// e.g. "/api/xxx" -> "https://example.com/api/xxx"
		return remoteUrl + url;
	}

	// 3. 相对路径，不以 / 开头
	// e.g. "api/xxx" -> "https://example.com/api/xxx"
	return remoteUrl.replace(/\/+$/, '') + '/' + url;
}

/**
 * 去掉用户输入里可能带的 http:// 或 https:// 前缀，
 * 并去掉末尾多余的 /
 */
export function normalizeDomain(input = '') {
  let d = input.trim()
    // 去掉开头的 http:// 或 https://
    .replace(/^(https?:\/\/)/i, '')
    // 去掉末尾的 /
    .replace(/\/+$/, '')
  return d
}