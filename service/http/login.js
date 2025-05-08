import {
	POST,
} from './http.js'
import {
	Sha256,
} from '@/service/utils/crypto.js'

export async function Login(data) {
	return await POST('/login', {
		...data,
		password: Sha256(data.password),
	})
}