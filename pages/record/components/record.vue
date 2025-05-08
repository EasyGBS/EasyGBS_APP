<template>
	<view class="rounded-lg bg-white overflow-hidden" @tap="handleClick">
		<view style="aspect-ratio: 16 / 9">
			<Snapshot :id="item.channel_id" :is-device="false" />
		</view>

		<view class="p-2 flex justify-between items-center">
			<text class="w-18 truncate">
				{{ item.name || item.channel_id }}
			</text>
			<text
				:class="item.is_recording ? 'text-green-600' : 'text-gray-400'"
				style="white-space: nowrap"
			>
				{{ item.is_recording ? '录像中' : '未录像' }}
			</text>
		</view>
	</view>
</template>

<script setup>
import { defineProps, reactive } from 'vue';
import Snapshot from '@/components/snapshot/snapshot.vue';

const props = defineProps({
	item: {
		type: Object,
	},
});

const handleClick = () => {
	uni.navigateTo({
		url: `/pages/record_paly/view?deviceId=${props.item.device_id}&channelId=${props.item.channel_id}`,
	});
};
</script>

<style></style>
