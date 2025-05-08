<template>
	<input
		:class="isFocused ? 'focused' : 'noraml'"
		:placeholder="placeholder"
		placeholder-style="color: #9199a4; "
		:type="type"
		:value="modelValue"
		@input="onInput"
		@focus="isFocused = true"
		@blur="isFocused = false"
	/>
</template>

<script setup>
import { ref } from 'vue';

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

function onInput(e) {
	emit('update:modelValue', e.detail.value); // 注意小程序 input 的值在 e.detail.value 中
}
</script>

<style scoped>
.input {
	width: 100%;
	box-sizing: border-box;
}

.noraml {
	background-color: #f1f4f9;
	border: 6rpx solid transparent;
	border-radius: 18rpx;
	padding: 28rpx 32rpx;
}

.focused {
	background-color: #f1f4f9;
	border: 6rpx solid #1aac19;
	border-radius: 18rpx;
	padding: 28rpx 32rpx;
}
</style>
