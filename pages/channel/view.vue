<template>
	<view class="p-3 grid grid-cols-1 gap-3">
		<!-- 骨架屏 -->
		<wd-skeleton v-if="loading" animation="gradient" theme="paragraph" />

		<!-- 渲染数据 -->
		<ChannelCard
			v-for="(item, index) in channelData"
			:key="item.id"
			:item="item"
			:deviceId="pagination.device_id"
		/>

		<!-- 数据为空时显示提示 -->
		<view
			v-if="!loading && channelData.length === 0"
			class="text-center text-gray-500"
		>
			暂无数据
		</view>
	</view>
</template>

<script setup>
import { reactive, watch, ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { FindChannels } from '@/service/http/channel.js';
import ChannelCard from './components/channel.vue';
import { onShareAppMessage } from '@dcloudio/uni-app'

onLoad((options) => {
	if (options?.deviceId) {
		pagination.device_id = options.deviceId;
	}
});

const channelData = ref([]);
const channelTotal = ref(0);
const loading = ref(false); // 添加 loading 状态

//获取通道列表
const pagination = reactive({
	page: 1,
	size: 10,
	device_id: '',
	pid: 'ROOT',
	status: '',
	name: '',
	bid: '',
});

const findChannelList = async () => {
	loading.value = true; // 开始加载
	const res = await FindChannels(pagination);
	channelData.value = res.items;
	channelTotal.value = res.total;
	loading.value = false; // 加载结束
};

// 监听 device_id 变化，自动触发查询
watch(
	() => pagination.device_id,
	async (newDeviceId) => {
		if (newDeviceId) {
			await findChannelList();
		}
	},
	{ immediate: true }
);

onShareAppMessage(() => {
	return {
		title: 'EasyNVR 通道',
		path: '/pages/channel/view',
		imageUrl: '',
	};
});
</script>

<style></style>
