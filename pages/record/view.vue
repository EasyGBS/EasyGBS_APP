<template>
	<view>
		<view class="bg-white">
			<Navigation title="录像" />
		</view>
		<scroll-view
			:style="scrollViewStyle"
			scroll-y
			refresher-enabled="true"
			:refresher-threshold="200"
			:refresher-background="refresherBackground"
			:refresher-triggered="refresherTriggered"
			@refresherrefresh="onRefresh"
			@scrolltolower="onScrolltolower"
		>
			<!-- 骨架屏（仅在初次加载且非刷新状态时显示） -->
			<wd-skeleton
				v-if="loading && !refresherTriggered"
				animation="gradient"
				theme="paragraph"
				:rows="5"
			/>

			<!-- 数据列表 -->
			<view class="grid grid-cols-2 gap-2 p-3" v-else>
				<RecordItem
					v-for="item in recrodData"
					:key="item.bid"
					:item="item"
				/>
			</view>

			<!-- 加载更多指示 -->
			<view v-if="loadingMore" class="text-center py-3">加载中...</view>
		</scroll-view>
	</view>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import Navigation from '@/components/navigation/navigation.vue';
import { FindRecords } from '@/service/http/record.js';
import RecordItem from './components/record.vue';
import { GetNavBarHeight } from '@/service/utils/utils.js';

// 响应式数据
const recrodData = ref([]);
const loading = ref(false);
const loadingMore = ref(false);
const refresherTriggered = ref(false);
const titleHeight = ref(0);

// 分页控制
const pagination = ref({
	page: 1,
	size: 10,
});

// 动态计算 scroll-view 的高度
const scrollViewStyle = computed(() => {
	return `height: calc(100vh - ${titleHeight.value}px);`;
});

// 获取记录列表
const findRecordList = async (isRefresh = false) => {
	if (!isRefresh) {
		loading.value = true;
	}
	const res = await FindRecords(pagination.value);
	if (pagination.value.page === 1) {
		recrodData.value = res.items;
	} else {
		recrodData.value = [...recrodData.value, ...res.items];
	}
	if (!isRefresh) {
		loading.value = false;
	}
};

// 监听滚动到底部加载更多
const onScrolltolower = async () => {
	if (loadingMore.value || recrodData.value.length >= 100) return;
	loadingMore.value = true;
	pagination.value.page += 1;
	await findRecordList();
	loadingMore.value = false;
};

const onRefresh = async () => {
	refresherTriggered.value = true;
	pagination.value.page = 1;
	await findRecordList(true);
	await new Promise((resolve) => setTimeout(resolve, 1000));
	refresherTriggered.value = false;
};

// 获取导航栏高度
const getHeight = () => {
	const height = GetNavBarHeight();
	titleHeight.value = height + 40;
};

// 初始化
onMounted(() => {
	findRecordList();
	getHeight();
});
</script>
