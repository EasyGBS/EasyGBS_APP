import {
	GET,
	POST
} from './http.js'

// 获取设备列表
export async function FindDeviceList(params) {
	return await GET('/devices', params)
}

// 云台控制
export async function ControlDeviceStart(data) {
	return await POST(`/devices/${data.deviceId}/ptz/start`, data)
}

export async function ControlDeviceStop(data) {
	return await POST(`/devices/${data.deviceId}/ptz/stop`, data)
}