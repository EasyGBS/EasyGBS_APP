<template>
	<view class="rounded-lg bg-white overflow-hidden" @tap="handleClick">
		<view style="aspect-ratio: 16 / 9; position: relative">
			<Snapshot :id="item.id" :is-device="false" />
			<!-- loading 效果层 -->
			<view
				v-if="loading"
				class="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-70"
			>
				<text class="text-base text-black">Loading...</text>
			</view>
		</view>

		<view class="p-3 flex justify-between items-center">
			<text class="font-semibold w-18 truncate">
				{{ item.device_name || item.name || item.id }}
			</text>
			<text v-if="item.status" class="text-green-600 font-semibold">
				在线
			</text>
			<text v-else class="text-red-600 font-semibold">离线</text>
		</view>
	</view>
</template>

<script setup>
import { defineProps, ref } from 'vue';
import Snapshot from '@/components/snapshot/snapshot.vue';
import { Live } from '@/service/http/channel.js';

const props = defineProps({
	item: {
		type: Object,
	},
	deviceId: {
		type: String,
		default: '',
	},
});

// loading 状态标志
const loading = ref(false);

const handleClick = async () => {
	// 防止重复点击
	if (loading.value) return;
	loading.value = true;
	try {
		const url = await findUrl();
		const navUrl = `/pages/play/view?url=${url}&channelId=${props.item.id}&deviceId=${props.deviceId}`;
		uni.navigateTo({
			url: navUrl,
		});
	} catch (error) {
		console.error('请求 Live 失败：', error);
		// 可在此处添加错误提示逻辑
	} finally {
		loading.value = false;
	}
};

const findUrl = async () => {
	const res = await Live(props.item.id);
	return res.address.http_flv;
};
</script>
