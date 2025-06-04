<template>
	<view>
		<view class="wrapper">
			<!-- 视频区域 -->
			<view class="video-container">
				<video
					:httpCache="true"
					:codec="software"
					:advanced="advanced"
					:play-strategy="1"
					:src="processedVideoUrl"
					:show-center-play-btn="false"
					:show-mute-btn="true"
					:initial-time="seekTime"
					id="video"
					controls
					autoplay
					style="width: 100%"
					@error="handleVideoError"
					@timeupdate="onTimeUpdate"
				></video>
			</view>

			<view class="bottom-container">
				<!-- 日历区域 -->
				<view class="calendarContainer">
					<!-- 月份下拉选择栏 -->
					<view class="monthDropdown">
						<view class="selected" @click="toggleDropdown">
							{{ selectedMonth }}月
						</view>
						<view class="dropdownList" v-show="dropdownVisible">
							<view v-for="year in years" :key="year">
								<view
									v-for="m in 12"
									:key="year + '-' + m"
									class="dropdownItem"
									@click="selectMonth(year, m)"
									@mouseover="hover = true"
									@mouseout="hover = false"
								>
									{{ year % 100 }}年{{ m }}月
								</view>
							</view>
						</view>
					</view>
					<!-- 日期列表 -->
					<view class="dateList">
						<view
							v-for="item in sortedDateData"
							:key="item.value"
							class="dateItem"
							:class="{ active: recordDay === item.value }"
							@click="selectDate(item)"
						>
							{{ item.name }}
						</view>
					</view>
				</view>
				<!-- 时间轴区域 -->
				<view class="container">
					<!-- 滚动区域 -->
					<scroll-view
						class="scroll-container"
						scroll-y
						:scroll-top="scrollTop"
						scroll-with-animation
						ref="scrollView"
						@click="handleContainerClick"
					>
						<!-- :style="{ height: 2 + 'px' }" -->
						<view class="timeline-content">
							<!-- 中心虚线 -->
							<view class="center-line"></view>

							<!-- 绘制录像区间 -->
							<view class="segments-container">
								<view
									v-for="(seg, index) in segments"
									:key="index"
									class="segment"
									:style="getSegmentStyle(seg)"
								></view>
							</view>

							<!-- 绘制刻度线 -->
							<view class="ticks-container">
								<view
									v-for="m in ticks"
									:key="m"
									class="tick"
									:style="{ top: m * pxPerMinute + 'px' }"
								>
									<view
										v-if="m % 60 === 0"
										class="tick-line major"
									>
										<text class="tick-label">
											{{ formatTickLabel(m) }}
										</text>
									</view>
									<view v-else class="tick-line minor"></view>
								</view>
							</view>

							<!-- marker -->
							<view
								class="marker"
								:style="markerStyle"
								ref="marker"
								@touchstart.stop.prevent="onMarkerTouchStart"
								@touchmove.stop.prevent="onMarkerTouchMove"
								@touchend="onMarkerTouchEnd"
								@mousedown.stop="onMarkerMouseDown"
								@mousemove.stop="onMarkerMouseMove"
								@mouseup.stop="onMarkerMouseUp"
							>
								<view class="marker-line"></view>
								<view class="marker-bubble">
									{{ formatTime(handlebarTime) }}
								</view>
							</view>
						</view>
					</scroll-view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import {
	reactive,
	nextTick,
	computed,
	onMounted,
	onBeforeUnmount,
	ref,
} from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import moment from 'moment';
import { SplicBaseUrlToRemoteUrl } from '@/service/utils/string.js';
import {
	FindRecordDates,
	FindRecordList,
	FindRecordTimeLine,
} from '@/service/http/record';
import { FindUUID } from '@/service/utils/uuid.js';

const advanced = ref([]);

const props = reactive({
	channelId: '',
	deviceId: '',
});

const scrollTop = ref(0);

const recordMonth = ref(moment().format('YYYYMM'));
const startTime = ref(new Date().setHours(0, 0, 0, 0));
const endTime = ref(new Date().setHours(23, 59, 59, 999));

const videoUrls = ref([]);
const currentIndex = ref(0);
const seekTime = ref(0);
const videoPlayer = ref(null);
// 时间轴 当前时间显示
const currentTime = ref('08:00');

// 计算处理后的视频地址
const processedVideoUrl = computed(() => {
	return SplicBaseUrlToRemoteUrl(videoUrls.value[currentIndex.value]);
});

onLoad((options) => {
	if (options) {
		props.channelId = options.channelId;
		props.deviceId = options.deviceId;
	}
});

onMounted(async () => {
	getRecordDays();

	// 通过节点选择器获取 marker 的高度
	uni.createSelectorQuery()
		.in(marker.value)
		.select('.marker')
		.boundingClientRect((rect) => {
			if (rect) {
				markerHeight.value = rect.height;
			}
		})
		.exec();
});

// 监听播放进度，当当前视频播放完毕后切换到下一视频或提示结束
const onTimeUpdate = (e) => {
	const currentTime = Math.ceil(e.detail.currentTime);
	const duration = Math.floor(e.detail.duration);
	if (currentTime >= duration) {
		if (currentIndex.value < videoUrls.value.length - 1) {
			currentIndex.value++;
			seekTime.value = 0;
		} else {
			uni.showToast({
				title: '已经播放完所有视频',
				icon: 'none',
			});
		}
	}
};

// 解析时间字符串为时间戳
const parseStartTime = (str) => {
	return new Date(
		str.substr(0, 4), // 年
		parseInt(str.substr(4, 2)) - 1, // 月（注意：月份从0开始）
		str.substr(6, 2), // 日
		str.substr(8, 2), // 时
		str.substr(10, 2), // 分
		str.substr(12, 2) // 秒
	).getTime();
};

// 根据目标时间查找对应视频及偏移（单位：秒）
const findMatchingIndex = (targetTime) => {
	const targetDate = new Date(targetTime).getTime();
	for (let i = 0; i < videoUrls.value.length; i++) {
		const match = videoUrls.value[i].match(/\/(\d{14})-(\d+)\.mp4(?:\?|$)/);
		if (!match) continue;
		const [_, startStr, duration] = match;
		const startDate = parseStartTime(startStr);
		const endDate = startDate + parseInt(duration, 10);
		if (targetDate >= startDate && targetDate < endDate) {
			return {
				index: i,
				offset: Math.floor((targetDate - startDate) / 1000),
			};
		}
	}
	return {
		index: -1,
		offset: 0,
	};
};

// 外部接口：更新播放位置至目标时间（时间格式：可被 Date 解析的字符串）
const updatePlayback = (time) => {
	const result = findMatchingIndex(time);
	if (result.index === -1) {
		console.log('未找到匹配视频');
		return;
	}
	currentIndex.value = result.index;
	seekTime.value = result.offset;
};

// 日期列表相关数据
// 假设 dateData 格式为数组：[{ value: 'YYYYMMDD', name: '日号' }, ...]
const currentYear = moment().year();
const lastYear = currentYear - 1;
const years = ref([currentYear, lastYear]);

const currentMonth = moment().month() + 1;

const selectedYear = ref(currentYear);
const selectedMonth = ref(currentMonth);
const dropdownVisible = ref(false);

const dateData = ref([]);
const recordDay = ref(''); // 当前选中的日期值

// 切换下拉显示状态
const toggleDropdown = () => {
	dropdownVisible.value = !dropdownVisible.value;
};

// 点击选择月份时更新显示并调用获取记录日期的方法
const selectMonth = (year, month) => {
	selectedYear.value = year;
	selectedMonth.value = month;
	dropdownVisible.value = false;
	// 格式化月份（例如：202303）
	recordMonth.value = `${year}${month.toString().padStart(2, '0')}`;
	getRecordDays();
};

// 将日期列表按数值降序排序
const sortedDateData = computed(() => {
	return dateData.value
		.slice()
		.sort((a, b) => parseInt(b.value) - parseInt(a.value));
});

// 点击日期时更新记录，并调用时间轴及列表获取函数
const selectDate = (item) => {
	recordDay.value = item.value;
	const dayMoment = moment(item.value, 'YYYYMMDD', true);
	startTime.value = dayMoment.startOf('day').valueOf();
	endTime.value = dayMoment.endOf('day').valueOf();
	getRecordTimeline();
	getRecordList();
};

// 获取有录像的日期
const getRecordDays = async () => {
	const data = {
		channel_id: props.channelId,
		source: 'CLOUD',
		dates: recordMonth.value,
	};
	const res = await FindRecordDates(data);
	const result = [];
	for (const [key, days] of Object.entries(res)) {
		for (let i = 0; i < days.length; i++) {
			if (days[i] === '1') {
				const date = i + 1;
				const paddedDate = date.toString().padStart(2, '0');
				result.push({
					name: date,
					value: parseInt(`${key}${paddedDate}`),
				});
			}
		}
	}

	if (!result.length) {
		console.log('当前月份无录像');
		dateData.value = [];
		return;
	}
	dateData.value = result;
	recordDay.value = result[result.length - 1].value;

	startTime.value = moment(recordDay.value, 'YYYYMMDD', true)
		.startOf('day')
		.valueOf();
	endTime.value = moment(recordDay.value, 'YYYYMMDD', true)
		.endOf('day')
		.valueOf();
	getRecordTimeline();
	getRecordList();
};

// 获取录像时间轴
const getRecordTimeline = async () => {
	const data = {
		channel_id: props.channelId,
		source: 'CLOUD',
		start: startTime.value,
		end: endTime.value,
	};
	const res = await FindRecordTimeLine(data).catch((err) => {
		console.log('>>请求错误>>', err);
	});
	intervalArray.value = calculateSegments(res.items);
};

// 获取录像列表
const getRecordList = async () => {
	const data = {
		channel_id: props.channelId,
		source: 'CLOUD',
		start: startTime.value,
		end: endTime.value,
		ssrc: FindUUID(props.channelId),
	};

	const res = await FindRecordList(data).catch((err) => {
		console.log('>>请求报错>>', err);
	});
	if (res?.items) {
		videoUrls.value = res.items;
		const length = videoUrls.value.length;
		if (length > 0) {
			// 计算2/3位置，向下取整（索引从0开始，例如长度10则索引6，对应第7个元素）
			currentIndex.value = Math.floor((length * 2) / 3);
			// 确保不超过数组最大索引
			currentIndex.value = Math.min(currentIndex.value, length - 1);
		} else {
			currentIndex.value = 0; // 空数组时保持默认
		}
	} else {
		videoUrls.value = [];
		currentIndex.value = 0;
	}
	const match = videoUrls.value[currentIndex.value].match(
		/\/(\d{14})-(\d+)\.mp4(?:\?|$)/
	);
	const [_, startStr, duration] = match;
	const time = moment(startStr, 'YYYYMMDDHHmmss');
	handlebarTime.value = time.hours() * 60 + time.minutes();

	// 获取 scroll-container 的高度（即 scroll-view 容器的高度）
	const scrollView = uni
		.createSelectorQuery()
		.in(this)
		.select('.scroll-container');
	scrollView
		.boundingClientRect((rect) => {
			const containerHeight = rect.height;
			const markerPosition =
				((HOURS * 60 - handlebarTime.value) * PX_PER_HOUR) / 60;
			// 计算滚动位置，保持 marker 居中
			const targetScrollTop = Math.max(
				0,
				Math.min(
					markerPosition - containerHeight / 2,
					HOURS * PX_PER_HOUR - containerHeight
				)
			);
			scrollTop.value = targetScrollTop;
		})
		.exec();

	seekTime.value = 0;
};

const handleVideoError = (e) => {
	console.error('视频播放出错:', e);
	console.log(JSON.stringify(e));
	if (currentIndex.value < videoUrls.value.length - 1) {
		currentIndex.value++;
		seekTime.value = 0;
	}
};

// 计算时间轴区间
function calculateSegments(data) {
	const segments = [];
	const lastFlag = {
		start: 0,
		end: 0,
	};

	for (const item of data) {
		const start = item.start;
		const end = start + item.duration;
		if (lastFlag.end === 0) {
			lastFlag.start = start;
			lastFlag.end = end;
		} else if (within60Seconds(lastFlag.end, start)) {
			lastFlag.end = end;
		} else {
			segments.push(formatSegment(lastFlag.start, lastFlag.end));
			lastFlag.start = start;
			lastFlag.end = end;
		}
	}

	if (lastFlag.start > 0)
		segments.push(formatSegment(lastFlag.start, lastFlag.end));

	return segments;
}

function within60Seconds(timestamp1, timestamp2) {
	const difference = Math.abs(timestamp1 - timestamp2);
	return difference <= 10000;
}

function formatSegment(startTimestamp, endTimestamp) {
	// 注意：recordDay 应该是一个 "YYYYMMDD" 格式的字符串，代表当前日期
	const todayStart = moment(recordDay.value, 'YYYYMMDD', true).startOf('day');
	const todayEnd = moment(recordDay.value, 'YYYYMMDD', true).endOf('day');
	let startMoment = moment(startTimestamp);
	let endMoment = moment(endTimestamp);

	// 如果开始时间早于当天开始，则修正为当天开始时间
	if (startMoment.isBefore(todayStart)) {
		startMoment = todayStart.clone();
	}

	// 如果结束时间晚于当天结束，则修正为当天结束时间，即 23:59:59
	if (endMoment.isAfter(todayEnd)) {
		endMoment = todayEnd.clone();
	}

	return {
		beginTime: startMoment.format('HH:mm:ss'),
		endTime: endMoment.format('HH:mm:ss'),
	};
}
//---------------------------------
// 时间轴
//---------------------------------
// ---------------------------
// 配置及状态数据
// ---------------------------
const intervalArray = ref([
	// 示例数据（可根据需要添加录像区间）
	// { beginTime: "08:00:00", endTime: "08:30:00" },
	// { beginTime: "10:15:00", endTime: "11:00:00" },
]);

// 默认选中时间：08:00 => 480 分钟
const handlebarTime = ref(480);
const isDragging = ref(false);
const markerHeight = ref(20);

// 时间轴配置
const HOURS = 24;
const PX_PER_HOUR = 120;
const autoScrollThreshold = 30;
const autoScrollStep = 10;

const TOTAL_MINUTES = computed(() => HOURS * 60);
const pxPerMinute = computed(() => PX_PER_HOUR / 60);
const timelineHeight = computed(() => HOURS * PX_PER_HOUR);

// 生成刻度数据：0～1440 分钟，每隔 15 分钟一个刻度
const ticks = computed(() => {
	const arr = [];
	for (let m = 0; m <= TOTAL_MINUTES.value; m += 15) {
		arr.push(m);
	}
	return arr;
});

// 解析录像区间数据
const segments = computed(() => {
	return intervalArray.value.map((item) => ({
		start: parseTimeStr(item.beginTime),
		end: parseTimeStr(item.endTime),
	}));
});

// ---------------------------
// 工具函数
// ---------------------------
function parseTimeStr(timeStr) {
	timeStr = timeStr.trim();
	const parts = timeStr.split(':').map(Number);
	const hh = parts[0] || 0,
		mm = parts[1] || 0,
		ss = parts[2] || 0;
	return hh * 60 + mm + (ss ? ss / 60 : 0);
}

function formatTime(minutes) {
	return moment({
		hour: Math.floor(minutes / 60),
		minute: Math.floor(minutes % 60),
	}).format('HH:mm');
}

function formatTickLabel(m) {
	const timeValue = TOTAL_MINUTES.value - m;
	return timeValue === TOTAL_MINUTES.value ? '24:00' : formatTime(timeValue);
}

function getSegmentStyle(seg) {
	const segTop = (TOTAL_MINUTES.value - seg.end) * pxPerMinute.value;
	const segHeight = (seg.end - seg.start) * pxPerMinute.value;
	return {
		top: segTop + 0 + 'px',
		right: '0px',
		width: '10px',
		height: Math.max(segHeight + 10, 2) + 'px',
		position: 'absolute',
		backgroundColor: '#f8dc42',
		borderRadius: '2px',
	};
}

// ---------------------------
// marker 样式（响应式计算）
// ---------------------------
const markerStyle = computed(() => {
	const top =
		(TOTAL_MINUTES.value - handlebarTime.value) * pxPerMinute.value -
		markerHeight.value / 2 +
		11;
	return {
		top: top + 8 + 'px',
		position: 'absolute',
		left: '0px',
		display: 'flex',
		alignItems: 'center',
	};
});

// ---------------------------
// DOM 及事件操作
// ---------------------------
const scrollView = ref(null);
const marker = ref(null);

const updateMarker = debounce(() => {
	// 此处可添加回调，通知外部当前时间变化
	// 例如：uni.$emit('timeChange', formatTime(handlebarTime.value), handlebarTime.value);
	const date = moment(
		`${recordDay.value} ${formatTime(handlebarTime.value)}`,
		'YYYYMMDD HH:mm:ss'
	);
	const time = date.format('YYYY-MM-DD HH:mm:ss');
	updatePlayback(time);
}, 500);

function handleDragMove(clientY) {
	uni.createSelectorQuery()
		.in(this) // 绑定到当前组件
		.select('.scroll-container')
		.boundingClientRect((rect) => {
			if (!rect) return; // 确保获取到了 rect 数据

			// 获取 scroll-view 的滚动位置
			uni.createSelectorQuery()
				.in(this)
				.select('.scroll-container')
				.scrollOffset((res) => {
					const scrollTop = res.scrollTop || 0; // 获取滚动偏移量
					let newY = clientY - rect.top + scrollTop;
					newY = Math.max(0, Math.min(newY, timelineHeight.value));
					handlebarTime.value = Math.round(
						TOTAL_MINUTES.value - newY / pxPerMinute.value
					);
					handlebarTime.value = Math.max(
						0,
						Math.min(handlebarTime.value, TOTAL_MINUTES.value)
					);
					updateMarker();

					// 使用 `scrollTo` 方法实现自动滚动
					const scrollView = uni
						.createSelectorQuery()
						.in(this)
						.select('.scroll-container');
					if (clientY - rect.top < autoScrollThreshold) {
						scrollView.scrollTo({
							scrollTop: Math.max(0, scrollTop - autoScrollStep),
							duration: 100,
						});
					} else if (rect.bottom - clientY < autoScrollThreshold) {
						scrollView.scrollTo({
							scrollTop: Math.min(
								timelineHeight.value - rect.height,
								scrollTop + autoScrollStep
							),
							duration: 100,
						});
					}
				})
				.exec();
		})
		.exec();
}

function onMarkerTouchStart() {
	isDragging.value = true;
}
function onMarkerTouchMove(e) {
	if (isDragging.value) {
		const clientY = e.touches[0].clientY;
		handleDragMove(clientY);
	}
}
function onMarkerTouchEnd() {
	isDragging.value = false;
}
function onMarkerMouseDown(e) {
	isDragging.value = true;
}
function onMarkerMouseMove(e) {
	if (isDragging.value) {
		handleDragMove(e.clientY);
	}
}
function onMarkerMouseUp() {
	isDragging.value = false;
}

function handleContainerClick(e) {
	// 若点击目标为 marker 则不响应
	if (e.target && e.target.dataset && e.target.dataset.draggable === 'true')
		return;

	// 获取 scroll-view 的位置信息
	uni.createSelectorQuery()
		.in(this) // 绑定到当前组件
		.select('.scroll-container')
		.boundingClientRect((rect) => {
			if (!rect) return; // 确保获取到了 rect 数据
			const clientY = e.changedTouches
				? e.changedTouches[0].clientY
				: e.clientY;
			const relativeY = clientY - rect.top; // 计算相对可见区域的位置

			// **获取 scrollTop 来修正 Y 位置**
			uni.createSelectorQuery()
				.in(this)
				.select('.scroll-container')
				.scrollOffset((res) => {
					const scrollTop = res.scrollTop || 0; // 当前滚动位置
					const absoluteY = relativeY + scrollTop; // 计算相对整个时间轴的位置

					console.log(
						'点击位置:',
						clientY,
						'可见区域内:',
						relativeY,
						'时间轴绝对位置:',
						absoluteY
					);

					handlebarTime.value = Math.round(
						TOTAL_MINUTES.value - absoluteY / pxPerMinute.value
					);
					handlebarTime.value = Math.max(
						0,
						Math.min(handlebarTime.value, TOTAL_MINUTES.value)
					);

					updateMarker();
				})
				.exec();
		})
		.exec();
}

// 防抖函数封装（可复用）
function debounce(func, wait = 300) {
	let timeout;
	return function (...args) {
		clearTimeout(timeout);
		timeout = setTimeout(() => {
			func.apply(this, args);
		}, wait);
	};
}
</script>

<style>
/* 整体布局：上部视频，下部时间轴 */
.wrapper {
	display: flex;
	flex-direction: column;
	height: 100vh;
}

/* 视频区域：保持16:9比例 */
.video-container {
	background-color: black;
	aspect-ratio: 16 / 9;
	flex-shrink: 0;
}

/* 时间轴区域：填充剩余高度 */
.timeline-wrapper {
	flex: 1;
	overflow: hidden;
}

/* 底部容器：让时间轴和日历并排 */
.bottom-container {
	display: flex;
	/* 横向排布 */
	flex: 1;
	/* 占满剩余空间 */
	overflow: hidden;
	/* 如果需要滚动或截断，可根据需求设置 */
}

/* 时间轴外层容器 */
.container {
	position: relative;
	width: 120px;
	height: 100%;
	padding-bottom: 50px;
	/* 占满父容器 */
	overflow: hidden;
	border: 1px solid #e2e8f0;
	border-radius: 4px;
	background-color: #f7fafc;
	box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

/* 滚动区域 */
.scroll-container {
	overflow-y: auto;
	scroll-behavior: smooth;
	height: 100% !important;
}

/* 时间轴内容：总高度 2880px（24小时 * 120px/小时） */
.timeline-content {
	position: relative;
	height: 2880px;
}

/* 中心虚线 */
.center-line {
	position: absolute;
	top: 0;
	bottom: 0;
	right: 10px;
	transform: translateX(-50%);
	border-left: 1px dashed #cbd5e0;
}

/* 刻度线：tick 的高度固定为0 */
.tick {
	position: absolute;
	left: 5px;
	height: 0;
}

.tick-line {
	display: inline-block;
	vertical-align: middle;
}

.tick-line.major {
	border-top: 1px solid #8ea3b8;
	width: 30px;
	margin-right: 4px;
}

.tick-line.minor {
	border-top: 1px solid #8ea3b8;
	width: 15px;
}

.tick-label {
	position: absolute;
	left: 40px;
	top: 3px;
	white-space: nowrap;
	color: #45627f;
	font-size: 14px;
}

/* 录像段 */
.segment {
	position: absolute;
	background-color: #f8dc42;
	border-radius: 2px;
}

/* Marker：不受 marker 气泡文字大小影响 */
.marker {
	position: absolute;
	left: 0px;
	cursor: pointer;
	user-select: none;
	display: flex;
	align-items: center;
}

.marker-line {
	width: 120px;
	height: 2px;
	background-color: #056df4;
}

/* Marker 气泡：绝对定位于 marker 上方 */
.marker-bubble {
	position: absolute;
	left: 60px;
	transform: translateX(-50%);
	background-color: #056df4;
	color: white;
	border-radius: 9999px;
	padding: 8px 12px;
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	white-space: nowrap;
	width: 60px;
	/* 固定宽度 */
	text-align: center;
}

/* 日历 */
.calendarContainer {
	width: 60px;
	padding: 6px;
	background-color: #f7fafc;
}

.dateList {
	display: flex;
	flex-direction: column;
	gap: 4px;
	overflow-y: auto;
	height: 100%;
	align-items: center;
}

.dateItem {
	cursor: pointer;
	padding: 2px;
	width: 40px;
	height: 40px;
	margin: 4px 0;
	text-align: center;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
}

.dateItem.active {
	background-color: #056df4;
	color: white;
}

/* 选择日历 */
.monthDropdown {
	position: relative;
	display: inline-block;
	margin-bottom: 10rpx;
}
.dropdownItem {
	cursor: pointer;
	padding: 12px 2px;
	width: 80px;
}

.dropdownList {
	position: absolute;
	top: 100%;
	left: 50%;
	text-align: center;
	background: #fff;
	z-index: 1000;
	max-height: 300px;
	overflow-y: auto;
}

.selected {
	cursor: pointer;
	width: 60px;
	height: 40px;
	text-align: center;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 8px;
}

/* 全局加载中遮罩层样式 */
#global-loading {
	position: fixed;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	width: 150px;
	height: 150px;
	background: rgba(0, 0, 0, 0.5);
	color: #fff;
	display: flex;
	justify-content: center;
	align-items: center;
	font-size: 18px;
	z-index: 9999;
	border-radius: 12px;
}
</style>
