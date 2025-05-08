import {
	GET
} from './http.js';

// 获取版本
export async function FindVersion() {
	return await GET('/app/version')
}