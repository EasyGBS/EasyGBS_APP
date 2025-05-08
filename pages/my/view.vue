<template>
	<view>
		<view class="bg-white">
			<Navigation title="我的" />
		</view>
		<view class="p-3">
			<!-- 顶部用户头像信息 -->
			<view class="p-3 bg-white rounded-lg mb-3">
				<view class="font-semibold text-xl">
					{{ userInfo.username }}
				</view>
				<view class="text-sm text-gray-400 flex items-center my-1">
					<span class="pr-1">用户等级</span>
					<wd-tag color="#0083ff" bg-color="#d0e8ff">
						{{ userInfo.name }}
					</wd-tag>
				</view>
				<view class="text-sm text-gray-400 flex items-center">
					<span class="pr-1">远程地址</span>
					<wd-tag color="#0083ff" bg-color="#d0e8ff">
						{{ GetRemoteUrl() }}
					</wd-tag>
				</view>
			</view>

			<!-- 功能列表区 -->
			<view class="">
				<!-- 	<view
					class="my-3 p-3 rounded-lg flex justify-between items-center bg-white"
					@click="handeLogout"
				>
					<span class="font-semibold">退出登录</span>
					<wd-icon name="logout" size="22px"></wd-icon>
				</view> -->

				<view
					class="p-3 rounded-lg flex justify-between items-center"
					style="background-color: #f5222d; color: #fff"
					@click="handeLogout"
				>
					<span class="font-semibold">退出登录</span>
					<wd-icon name="logout" size="22px"></wd-icon>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { onShareAppMessage } from '@dcloudio/uni-app'
import Navigation from '@/components/navigation/navigation.vue';
import {
	ClearToken,
	ClearUserInfo,
	GetUserInfo,
	GetRemoteUrl,
} from '@/service/store/local.js';

const userInfo = reactive({
	name: '',
	username: '',
});

onMounted(() => {
	const data = GetUserInfo();
	if(data){
		userInfo.name = data.user.name;
		userInfo.username = data.user.username;
	}
});

const handeLogout = () => {
	uni.showModal({
		title: '提示',
		content: '确定要退出登录吗？',
		success: (res) => {
			if (res.confirm) {
				ClearToken();
				ClearUserInfo();
				setTimeout(() => {
					uni.reLaunch({
						url: '/pages/login/login',
					});
				}, 1000);
			}
		},
	});
};

onShareAppMessage(() => {
  return {
    title: 'EasyNVR 我的',
    path: '/pages/my/view',
    imageUrl: ''
  };
});
</script>

<style lang="scss"></style>
