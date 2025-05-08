<template>
	<view class="rounded-lg bg-white p-2" @tap="handleClick">
		<view class="flex justify-between items-center">
			<text class="truncate pr-2 font-semibold">
				{{ item.name || item.id }}
			</text>
			<wd-icon
				v-if="item.status"
				color="#03c703"
				name="check-circle-filled"
				size="18px"
			></wd-icon>
			<wd-icon
				v-else
				color="#ff1010"
				name="close-circle-filled"
				size="18px"
			></wd-icon>
		</view>

		<view class="pb-2">
			<text class="text-gray-400 text-sm pr-4 truncate">
				{{ item.id }}
			</text>
		</view>

		<view class="info-container">
			<text class="text-gray-400 text-sm pr-4">
				{{ item.ip }}
			</text>
			<text class="text-gray-400 text-sm">
				{{ item.addr || '未知' }}
			</text>
			<text class="text-gray-400 text-sm">
				通道数： {{ item.channel_count }}
			</text>
			<text class="text-gray-400 text-sm">
				协议： {{ item.protocol }}
			</text>
			<text class="text-gray-400 text-sm">
				厂商： {{ item.ext.manufacturer }}
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
		url: `/pages/channel/view?deviceId=${props.item.id}`,
	});
};
</script>

<style lang="scss">
.nowrap-text {
	white-space: nowrap;
}

.info-container {
	display: flex;
	flex-direction: column;
	gap: 6rpx; /* 元素之间的间距 */
}
</style>
