<template>
	<view>
		<view class="bg-white">
			<Navigation title="直播" />
			<Search
				:onSearch="handleSearch"
				:placeholder="'请输入设备 名称 或 ID'"
				:onStatus="handleStatus"
			/>
		</view>

		<scroll-view
			:style="scrollViewStyle"
			scroll-y
			refresher-enabled="true"
			:refresher-threshold="200"
			:refresher-triggered="refresherTriggered"
			@refresherrefresh="onRefresh"
			@scrolltolower="onScrolltolower"
		>
			<!-- 骨架屏加载效果，只在初次加载时显示 -->
			<wd-skeleton
				v-if="loading && !refresherTriggered"
				animation="gradient"
				theme="paragraph"
			/>

			<!-- 设备列表 -->
			<view v-else class="grid grid-cols-2 gap-2 p-3 items-stretch">
				<DeviceCard
					v-for="(item, index) in deviceData"
					:key="item.id"
					:item="item"
				/>
			</view>

			<!-- 加载更多指示 -->
			<view v-if="loadingMore" class="text-center py-3">加载中...</view>
			<view v-else class="text-center py-3 text-sm">暂无更多</view>
		</scroll-view>
	</view>
</template>

<script setup>
import { onMounted, ref, reactive, computed } from 'vue';
import Navigation from '@/components/navigation/navigation.vue';
import Search from './components/search.vue';
import DeviceCard from './components/device.vue';
import { FindDeviceList } from '@/service/http/device.js';
import { GetNavBarHeight } from '@/service/utils/utils.js';

const deviceData = ref([]);
const deviceTotal = ref(0);
const loading = ref(false); // 初次加载骨架屏状态
const loadingMore = ref(false); // 加载更多状态
const hasMoreData = ref(true); // 是否还有更多数据

// 分页参数
const pagination = reactive({
	page: 1,
	size: 10,
	id: '',
	status: '',
	name: '',
	is_platform: '',
	protocol: '',
});

const titleHeight = ref(0); // 导航栏高度
const refresherTriggered = ref(false); // 控制下拉刷新状态

// 计算 scroll-view 的高度
const scrollViewStyle = computed(() => {
	return `height: calc(100vh - ${titleHeight.value}px);`;
});

onMounted(() => {
	getHeight();
	findDeviceList();
});

// **获取设备列表**
// isLoadMore: 是否为上拉加载更多；
// isRefresh: 是否为下拉刷新（不展示骨架屏）
const findDeviceList = async (isLoadMore = false, isRefresh = false) => {
	// 非上拉加载，并且不是下拉刷新时，显示骨架屏
	if (!isLoadMore && !isRefresh) {
		loading.value = true;
	}

	const res = await FindDeviceList(pagination).catch((err) => {
		console.log('>>请求错误>>>', err);
	});

	if (isLoadMore) {
		// 追加数据
		deviceData.value = [...deviceData.value, ...res.items];
	} else {
		// 初始化数据
		deviceData.value = res.items;
		deviceTotal.value = res.total;
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

// **处理搜索**
const handleSearch = (searchValue) => {
	pagination.name = searchValue;
	pagination.page = 1;
	hasMoreData.value = true; // 搜索后重置是否有更多数据
	findDeviceList();
};

// **处理筛选**
const handleStatus = (value) => {
	pagination.status = value;
	pagination.page = 1;
	hasMoreData.value = true; // 筛选后重置是否有更多数据
	findDeviceList();
};

// **上拉加载更多**
const onScrolltolower = () => {
	if (!hasMoreData.value || loadingMore.value) return; // 没有更多数据或正在加载时，直接返回

	loadingMore.value = true;
	pagination.page += 1;
	findDeviceList(true); // 加载更多数据
};

// **下拉刷新列表**
const onRefresh = async () => {
	// 开启下拉刷新状态，避免显示骨架屏
	refresherTriggered.value = true;
	pagination.page = 1;
	hasMoreData.value = true;
	await findDeviceList(false, true);
	// 延迟 1 秒后结束下拉刷新状态
	await new Promise((resolve) => setTimeout(resolve, 1000));
	refresherTriggered.value = false;
};

// **获取导航栏高度**
const getHeight = () => {
	const height = GetNavBarHeight();
	titleHeight.value = height + 100;
};
</script>
