<template>
	<view class="input">
		<input
			:class="isFocused ? 'focused' : 'noraml'"
			:placeholder="placeholder"
			placeholder-style="color: #9199a4;"
			:type="realType"
			:value="modelValue"
			@input="onInput"
			@focus="isFocused = true"
			@blur="isFocused = false"
		></input>
		<!-- 仅在 password 类型时显示图标 -->
		<uni-icons
			v-if="type === 'password'"
			:type="showPassword ? 'eye' : 'eye-slash'"
			size="24"
			class="eye-icon"
			@click="toggleShowPassword"
		/>
	</view>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
	placeholder: String,
	type: {
		type: String,
		default: 'text',
	},
	modelValue: String, // 接收父组件的值
});

const emit = defineEmits(['update:modelValue']); // 派发事件

const isFocused = ref(false);
const showPassword = ref(false);

const realType = computed(() => {
	if (props.type === 'password') {
		return showPassword.value ? 'text' : 'password';
	}
	return props.type;
});

function toggleShowPassword() {
	showPassword.value = !showPassword.value;
}

function onInput(e) {
	emit('update:modelValue', e.detail.value); // 注意小程序 input 的值在 e.detail.value 中
}
</script>

<style scoped>
.input {
	width: 100%;
	position: relative;
}

.noraml {
	background-color: #f1f4f9;
	border: 6rpx solid transparent;
	border-radius: 18rpx;
	padding: 28rpx 32rpx;
}

.focused {
	background-color: #f1f4f9;
	border: 6rpx solid #38b64a;
	border-radius: 18rpx;
	padding: 28rpx 32rpx;
}

.eye-icon {
	position: absolute;
	right: 42rpx;
	top: 34rpx;
	color: #666;
	z-index: 10;
}
</style>
