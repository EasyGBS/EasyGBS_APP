<template>
	<view>
		<!-- 仅编译到微信小程序 -->
		<!-- #ifndef APP-PLUS -->
		<WxView />
		<!-- #endif -->

		<!-- 仅编译到 APP (plus) 端 -->
		<!-- #ifdef APP-PLUS -->
		<AppView />
		<!-- #endif -->
	</view>
</template>

<script setup>
import AppView from './components/app.vue';
import WxView from './components/wx.vue';
</script>
