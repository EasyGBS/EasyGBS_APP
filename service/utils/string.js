import {
	GetRemoteUrl
} from "../store/local";

//拼接base64 前缀
export function SplicBase64String(data) {
	return 'data:image/jpeg;base64,' + data;
}

// 替换 播放地址 域名
export function SplicBaseUrlToRemoteUrl(url) {
	if(!url) return ''
	const remoteUrl = GetRemoteUrl();
	const newUrl = url.replace(/^https?:\/\/[^/]+/, remoteUrl);
	return newUrl
}