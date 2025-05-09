<template>
	<view class="container">
		<!-- 视频播放区域，使用原生video -->
		<view
			class="video-container"
			style="aspect-ratio: 16/9; background-color: black; padding: 4px 0"
		>
			<video
				v-if="isShowPlayer"
				:advanced="advanced"
				:src="url"
				:enable-progress-gesture="false"
				:show-center-play-btn="false"
				:show-mute-btn="true"
				:show-progress="false"
				is-live
				id="myVideo"
				controls
				autoplay
				style="height: 100%; width: 100%"
				@error="handleVideoError"
				@loadedmetadata="onLoadedMetadata"
			></video>
		</view>

		<!-- 云台控制区域 -->
		<view class="content">
			<view class="steering">
				<view class="row">
					<view
						class="button top"
						@pointerdown="handlePointerDown('TOP')"
						@pointerup="handlePointerUp('TOP')"
						@pointercancel="handlePointerUp('TOP')"
					>
						<image
							src="https://www.easynvr.com/public/svg/up.svg"
							mode="widthFix"
						></image>
					</view>
				</view>
				<view class="row">
					<view
						class="button left"
						@pointerdown="handlePointerDown('LEFT')"
						@pointerup="handlePointerUp('LEFT')"
						@pointercancel="handlePointerUp('LEFT')"
					>
						<image
							src="https://www.easynvr.com/public/svg/left.svg"
							mode="widthFix"
						></image>
					</view>
					<view class="empty" @click="toggleMic">
						<!-- 	<image
							class="w-12 h-12"
							:src="micOn ? micOnUrl : micOffUrl"
							mode="widthFix"
						></image> -->
					</view>
					<view
						class="button right"
						@pointerdown="handlePointerDown('RIGHT')"
						@pointerup="handlePointerUp('RIGHT')"
						@pointercancel="handlePointerUp('RIGHT')"
					>
						<image
							src="https://www.easynvr.com/public/svg/right.svg"
							mode="widthFix"
						></image>
					</view>
				</view>
				<view class="row">
					<view
						class="button bottom"
						@pointerdown="handlePointerDown('BOTTOM')"
						@pointerup="handlePointerUp('BOTTOM')"
						@pointercancel="handlePointerUp('BOTTOM')"
					>
						<image
							src="https://www.easynvr.com/public/svg/down.svg"
							mode="widthFix"
						></image>
					</view>
				</view>
			</view>
			<view class="fill"></view>
		</view>
	</view>
</template>

<script setup>
import { ref } from 'vue';
import {
	ControlDeviceStart,
	ControlDeviceStop,
} from '@/service/http/device.js';
import { FindVoiceWsUrl } from '@/service/http/gb.js';
// import Talk from '@/service/utils/talk.js';
// 页面传参，uni‑app中 onLoad 回调参数为页面 query 参数
const advanced = ref([
	{
		'key': 'videotoolbox',
		'value': 0,
		'type': 'player',
	},
	{
		'key': 'timeout',
		'value': 1000,
		'type': 'player',
	},
]);

const micOnUrl = 'https://www.easynvr.com/public/svg/麦克风.svg';
const micOffUrl = 'https://www.easynvr.com/public/svg/麦克风-off.svg';

// 当前麦克风状态
const micOn = ref(false);

const isShowPlayer = ref(true);

const retryCount = ref(0);

const props = defineProps({
	url: { type: String, default: '' },
	channelId: { type: String, default: '' },
	deviceId: { type: String, default: '' },
});

// 开启麦克风
const toggleMic = () => {
	// if (!micOn.value) {
	// 	startTalk();
	// } else {
	// 	stopTalk();
	// }
};

// const startTalk = async () => {
// 	try {
// 		const { data: res } = await FindVoiceWsUrl(channelID);
// 		if (!res.talk_url) return;
// 		micOn.value = true;
// 		talk.current = new Talk(
// 			res.talk_url,
// 			{
// 				encType: 'g711a',
// 				packetType: 'rtp',
// 				sampleBitsWidth: 16,
// 				sampleRate: 8000,
// 				debugLevel: 'debug',
// 				packetTcpSendType: 'udp',
// 				engine: 'script',
// 				packetTcpSendType: res.transport,
// 			},
// 			onCallBack
// 		);
// 		talk.current.startTalk();
// 	} catch (err) {
// 		console.log('>>对讲报错>>', err);
// 	}
// };

// const stopTalk = () => {
// 	micOn.value = true;
// 	if (talk.current) {
// 		talk.current?.stopTalk();
// 	}
// };

const onCallBack = (msg) => {
	stopTalk();
};

// 云台控制相关方法
const handlePointerDown = (direction) => {
	startPTZControl(55, direction);
};

const handlePointerUp = (direction) => {
	stopPTZControl(55, direction);
};

const startPTZControl = (speed, direction) => {
	const data = {
		deviceId: props.deviceId,
		speed,
		direction,
		channel_id: props.channelId,
	};
	ControlDeviceStart(data);
};

const stopPTZControl = (speed, direction) => {
	const data = {
		deviceId: props.deviceId,
		speed,
		direction,
		channel_id: props.channelId,
	};
	ControlDeviceStop(data);
};

const handleVideoError = (e) => {
	console.error('视频播放出错:');
	if (retryCount.value < 5) {
		retryCount.value++;
		console.log(`重试第 ${retryCount.value} 次...`);
		isShowPlayer.value = false;
		setTimeout(() => {
			isShowPlayer.value = true;
		}, 1000);
	} else {
		console.error('已达最大重试次数，播放失败');
	}
};
</script>

<style scoped>
.container {
	max-width: 960px;
	margin: 0 auto;
	background-color: #f5f5f5;
}
.video-container {
	margin: 0 auto;
}
.infoContent {
	background-color: #fff;
	padding: 16px;
	border-radius: 0 0 12px 12px;
	width: 100%;
	margin: 16px auto;
	overflow: hidden;
	word-wrap: break-word;
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 16px;
}
.content {
	padding: 14px;
	display: flex;
	justify-content: center;
	align-items: center;
	margin-top: 5rem;
	position: relative;
}
.fill {
	width: 200px;
	height: 200px;
	background-color: #fff;
	box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
	position: absolute;
	z-index: 0;
	border-radius: 50%;
}
.steering {
	display: flex;
	flex-direction: column;
	align-items: center;
	width: 150px;
	position: relative;
	z-index: 10;
}
.row {
	display: flex;
	justify-content: center;
	width: 100%;
	height: 50px;
	position: relative;
}
.button {
	width: 60px;
	height: 60px;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	color: white;
	font-size: 24px;
	cursor: pointer;
	position: absolute;
	transition: transform 0.2s ease-in-out;
	-webkit-tap-highlight-color: transparent;
	outline: none;
}
.top {
	top: -30px;
}
.left {
	left: -30px;
	top: 50%;
	transform: translateY(-50%);
}
.right {
	right: -30px;
	top: 50%;
	transform: translateY(-50%);
}
.bottom {
	bottom: -30px;
}
.empty {
	width: 50px;
	height: 50px;
	background: #f0f0f0;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
}
.text-lg {
	font-size: 1.02rem;
	line-height: 1.5;
	font-weight: 600;
}
.text-sm {
	font-size: 0.8rem;
	line-height: 1.5;
}
</style>
