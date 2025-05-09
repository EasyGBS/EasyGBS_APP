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
      :refresher-triggered="refresherTriggered"
      @refresherrefresh="onRefresh"
    >
      <!-- 骨架屏（仅在初次加载且非刷新状态时显示） -->
      <wd-skeleton
        v-if="loading && !refresherTriggered"
        animation="gradient"
        theme="paragraph"
        :rows="5"
      />

      <!-- 数据列表 -->
      <view v-else class="grid grid-cols-2 gap-2 p-3">
        <RecordItem
          v-for="item in recrodData"
          :key="item.bid"
          :item="item"
        />
      </view>

      <!-- 无更多提示 -->
      <view class="text-center py-3 text-sm">暂无更多</view>
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
const refresherTriggered = ref(false);
const titleHeight = ref(0);

// 动态计算 scroll-view 的高度
const scrollViewStyle = computed(() => {
  return `height: calc(100vh - ${titleHeight.value}px)`;
});

// 获取记录列表（一次性全部加载）
const findRecordList = async () => {
  loading.value = true;
  const res = await FindRecords();
  recrodData.value = res.items;
  loading.value = false;
};

// 下拉刷新逻辑
const onRefresh = async () => {
  refresherTriggered.value = true;
  await findRecordList();
  // 给刷新动画留出时间
  await new Promise(resolve => setTimeout(resolve, 500));
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
