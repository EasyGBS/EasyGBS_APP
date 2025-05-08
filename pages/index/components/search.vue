<template>
	<view>
		<view class="flex justify-between items-center w-screen bg-white pt-3">
			<view class="w-64">
				<wd-search
					v-model="value"
					@search="search"
					@clear="clear"
					@change="change"
					maxlength="99"
					hide-cancel
					placeholder-left
					:placeholder="placeholder"
				/>
			</view>
			<view class="w-28">
				<!-- 替换成下拉菜单 -->
				<wd-drop-menu>
					<wd-drop-menu-item
						v-model="selectedOption"
						:options="options"
						@change="handleChange"
					/>
				</wd-drop-menu>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, watch, defineProps } from 'vue';
import { debounce } from 'lodash';

const props = defineProps({
	placeholder: {
		type: String,
		default: '搜索',
	},
	onSearch: {
		type: Function,
		required: true,
	},
	onStatus: {
		type: Function,
		required: true,
	},
});

// 搜索框的输入值
const value = ref('');
// 下拉菜单的选中值
const selectedOption = ref('全部');

// 下拉选项
const options = ref([
	{ label: '全部', value: '全部' },
	{ label: '在线', value: 'true' },
	{ label: '离线', value: 'false' },
]);

// 创建防抖搜索方法
const debouncedSearch = debounce(() => {
	props.onSearch(value.value);
}, 1000); // 1s 防抖

// 监听输入变化，自动触发防抖搜索
watch(value, () => {
	debouncedSearch();
});

// 清空时触发搜索
const clear = () => {
	value.value = '';
	props.onSearch('');
};

// 手动搜索（如按回车）
const search = () => {
	debouncedSearch.flush(); // 立即执行防抖方法
};

// 监听输入框 change 事件
const change = (e) => {
	value.value = e.value;
};

// 监听下拉菜单 change 事件
const handleChange = (newValue) => {
	if (newValue.value == '全部') {
		props.onStatus('');
	} else {
		props.onStatus(newValue.value == "true");
	}
};
</script>
