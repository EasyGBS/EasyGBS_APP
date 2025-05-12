<template>
	<view>
		<!-- 仅编译到微信小程序 -->
		<!-- #ifndef APP-PLUS -->
		<WxView :url="liveUrl" :channel-id="channelId" :device-id="deviceId" />
		<!-- #endif -->

		<!-- 仅编译到 APP (plus) 端 -->
		<!-- #ifdef APP-PLUS -->
		<AppView :url="liveUrl" :channel-id="channelId" :device-id="deviceId" />
		<!-- #endif -->
	</view>
</template>

<script setup>
import { ref } from 'vue';
import { onLoad, onShareAppMessage } from '@dcloudio/uni-app';
import { SplicBaseUrlToRemoteUrl } from '@/service/utils/string.js';
import AppView from './components/app.vue';
import WxView from './components/wx.vue';

const liveUrl = ref('');
const channelId = ref('');
const deviceId = ref('');

onLoad((options) => {
	liveUrl.value = SplicBaseUrlToRemoteUrl(decodeURIComponent(options.url || '')) || '';
	channelId.value = options.channelId || '';
	deviceId.value = options.deviceId || '';
});

onShareAppMessage(() => {
	return {
		title: 'EasyNVR 直播',
		path: '/pages/play/view',
		imageUrl: '',
	};
});
</script>
