import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'LNTON_UUID';

// 获取 UUID（可清除）
function findUUID(isClear = false) {
  const uuidData = uni.getStorageSync(STORAGE_KEY);

  if (isClear) {
    uni.removeStorageSync(STORAGE_KEY);
    if (uuidData) {
      return uuidData.replace(/-/g, '').substring(0, 20);
    }
  }

  if (uuidData) {
    return uuidData.replace(/-/g, '').substring(0, 20);
  }

  const newUUID = uuidv4().replace(/-/g, '').substring(0, 20);
  uni.setStorageSync(STORAGE_KEY, newUUID);
  return newUUID;
}

// 结合 channel_id 的 UUID 生成函数
export function FindUUID(channel_id, isClear = false) {
  const trimmedChannelId = channel_id.length > 20 ? channel_id.substring(0, 20) : channel_id;
  const uuid = trimmedChannelId + '_' + findUUID(isClear);
  return uuid;
}
