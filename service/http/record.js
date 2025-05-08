import {
	GET,
	GetFetch
} from './http.js';
import {
	SplicBaseUrlToRemoteUrl
} from '@/service/utils/string.js';


// 获取云存录像列表
export async function FindRecords() {
	return await GET('/records/cloud/channels')
}

// 获取有录像的日期
export async function FindRecordDates(data) {
	return await GET('/records/months', data);
}

// 获取录像时间轴
export async function FindRecordTimeLine(data) {
	return await GET('/records/timeline', data);
}

// 获取录像列表
export async function FindRecordList(data) {
	const res = await GET('/records', data);
	return await GetFetch(SplicBaseUrlToRemoteUrl(res.url));
}