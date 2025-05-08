<template>
  <view>
    <view class="bg-white">
      <Navigation title="录像" />
    </view>
    <scroll-view
      :style="scrollViewStyle"
      scroll-y
      :refresher-enabled="true"
      :refresher-threshold="200"
      :refresher-triggered="refresherTriggered"
      @refresherrefresh="onRefresh"
    >
      <!-- 骨架屏：初次加载时显示 -->
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
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import Navigation from '@/components/navigation/navigation.vue'
import { FindRecords } from '@/service/http/record.js'
import RecordItem from './components/record.vue'
import { GetNavBarHeight } from '@/service/utils/utils.js'
import { onShareAppMessage } from '@dcloudio/uni-app'

// 状态
const recrodData       = ref([])
const loading          = ref(false)
const refresherTriggered = ref(false)
const titleHeight      = ref(0)

// 计算 scroll-view 高度
const scrollViewStyle = computed(() => `height: calc(100vh - ${titleHeight.value}px);`)

// 获取全部记录（无分页）
const findRecordList = async () => {
  loading.value = true
  const res = await FindRecords()
  recrodData.value = res.items
  loading.value = false
}

// 下拉刷新处理
const onRefresh = async () => {
  refresherTriggered.value = true
  await findRecordList()
  // 给下拉刷新动画一点时间
  await new Promise(r => setTimeout(r, 500))
  refresherTriggered.value = false
}

// 获取导航栏高度
const getHeight = () => {
  titleHeight.value = GetNavBarHeight() + 40
}

// 初始化
onMounted(() => {
  getHeight()
  findRecordList()
})

// 分享配置
onShareAppMessage(() => ({
  title: 'EasyNVR 录像',
  path: '/pages/record/view',
  imageUrl: ''
}))
</script>
