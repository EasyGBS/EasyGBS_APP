import CryptoJS from 'crypto-js';

export function Sha256(message) {
	const hash = CryptoJS.SHA256(message);
	// 将散列值转换为字符串表示
	const hashInString = hash.toString(CryptoJS.enc.Hex);
	return hashInString;
}