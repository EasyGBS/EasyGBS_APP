<template>
	<view>
		<web-view :src="finalPlaybackUrl" @message="handleMessage"></web-view>
	</view>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue';
import { onLoad, onShareAppMessage } from '@dcloudio/uni-app';
import { GetRemoteUrl, GetToken } from '@/service/store/local';
import { DEFAULT_LIVE_PLAY_URL } from '@/constants/index';

// 计算最终的播放 URL
const finalPlaybackUrl = ref('');

onLoad((options) => {
	if (options) {
		finalPlaybackUrl.value = `${DEFAULT_LIVE_PLAY_URL}?live_url=${
			options.url
		}&channelId=${options.channelId}&deviceId=${
			options.deviceId
		}&token=${GetToken()}&baseUrl=${GetRemoteUrl()}`;
		console.log('>>>', finalPlaybackUrl.value, options);
	}
});

const handleMessage = (v) => {
	console.log('>>', v);
	// if (action === 'start') {
	// 	console.log(`开始控制方向: ${direction}`);
	// } else if (action === 'stop') {
	// 	console.log(`停止控制方向: ${direction}`);
	// }
};

onShareAppMessage(() => {
	return {
		title: 'EasyNVR 直播',
		path: '/pages/play/view',
		imageUrl: '',
	};
});
</script>

<style></style>
