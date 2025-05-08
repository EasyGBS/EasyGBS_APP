import { POST } from "./http";

// 获取国标语音对讲 url
export async function FindVoiceWsUrl(channelId) {
  return await POST(`/channels/${channelId}/talk`);
}