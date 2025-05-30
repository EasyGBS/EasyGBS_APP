<template>
	<view class="">
		<scroll-view
			scroll-y
			style="height: 100vh"
			refresher-enabled="true"
			:refresher-threshold="200"
			:refresher-triggered="refresherTriggered"
			@refresherrefresh="onRefresh"
			@scrolltolower="onScrollToLower"
		>
			<!-- 骨架屏 -->
			<wd-skeleton
				v-if="loading && !refresherTriggered"
				animation="gradient"
				theme="paragraph"
				:rows="5"
			/>

			<!-- 渲染数据 -->
			<view class="grid grid-cols-1 gap-3 p-3" v-else>
				<ChannelCard
					v-for="(item, index) in channelData"
					:key="item.id"
					:item="item"
					:deviceId="pagination.device_id"
				/>
			</view>

			<!-- 加载更多指示 -->
			<view v-if="loadingMore" class="text-center py-3">加载中...</view>
			<view v-else class="text-center py-3 text-sm">暂无更多</view>
		</scroll-view>
	</view>
</template>

<script setup>
import { reactive, ref, watch, onBeforeUnmount } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { FindChannels } from '@/service/http/channel.js';
import ChannelCard from './components/channel.vue';

const channelData = ref([]);
const channelTotal = ref(0);
const loading = ref(false); // 初始加载状态
const loadingMore = ref(false); // 上拉加载状态
const hasMoreData = ref(true); // 是否还有更多数据
const refresherTriggered = ref(false); // 下拉刷新状态

// 页面加载时初始化
onLoad((options) => {
	if (options?.deviceId) {
		pagination.device_id = options.deviceId;
	}
});

// 分页参数
const pagination = reactive({
	page: 1,
	size: 10,
	device_id: '',
	pid: 'ROOT',
	status: '',
	name: '',
	bid: '',
});

// 获取列表数据
const findChannelList = async (isLoadMore = false, isRefresh = false) => {
	if (!isLoadMore && !isRefresh) loading.value = true;

	const res = await FindChannels(pagination).catch((err) => {
		console.error('通道列表加载失败:', err);
		return { items: [], total: 0 };
	});

	if (isLoadMore) {
		channelData.value = [...channelData.value, ...res.items];
	} else {
		channelData.value = res.items;
		channelTotal.value = res.total;
	}

	// 判断是否还有更多数据
	if (res.items.length < pagination.size) {
		hasMoreData.value = false;
	} else {
		hasMoreData.value = true;
	}

	// 非上拉加载，并且不是下拉刷新时，结束骨架屏加载
	if (!isLoadMore && !isRefresh) {
		loading.value = false;
	}
	loadingMore.value = false;
};

// 下拉刷新
const onRefresh = async () => {
	refresherTriggered.value = true;
	pagination.page = 1;
	hasMoreData.value = true;
	await findChannelList(false, true);
	setTimeout(() => {
		refresherTriggered.value = false;
	}, 1000);
};

// 上拉加载更多
const onScrollToLower = () => {
	if (!hasMoreData.value || loadingMore.value) return;
	loadingMore.value = true;
	pagination.page += 1;
	findChannelList(true);
};

// 监听 device_id 变化自动加载数据
watch(
	() => pagination.device_id,
	async (newDeviceId) => {
		if (newDeviceId) {
			pagination.page = 1;
			hasMoreData.value = true;
			await findChannelList();
		}
	},
	{ immediate: true }
);
</script>
