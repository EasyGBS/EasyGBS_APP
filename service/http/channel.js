import {
	GET,
	POST,
} from './http.js'

// 获取通道列表
export async function FindChannels(data) {
	return await GET(`/channels`, data);
}

// 获取快照
export async function GetChannelSnapshot(id) {
	return await GET(`/channels/${id}/snapshot`, {
		h: 70,
		time_s: 0,
	});
}

// 直播
export async function Live(id) {
	return await POST(`/channels/${id}/play`);
}