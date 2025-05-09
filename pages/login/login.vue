<template>
	<view>
		<view class="flex justify-center items-center pt-24">
			<view class="flex flex-col items-center">
				<view>
					<image
						class="w-14 h-14 rounded-lg"
						src="/static/image/logo.png"
					></image>
				</view>
				<view class="text-xl pt-2">EasyGBS</view>
			</view>
		</view>

		<view class="px-4 mt-10">
			<view>
				<FocusInput
					v-model="formData.domain"
					placeholder="请输入 IP/域名 地址"
				/>
			</view>
			<view class="pt-5 pb-3">
				<FocusInput v-model="formData.username" placeholder="账号" />
			</view>
			<view>
				<FocusInput
					v-model="formData.password"
					placeholder="密码"
					type="password"
				/>
			</view>

			<view class="flex justify-between items-center pt-3 px-1">
				<view style="color: #9199a4" class="text-sm">
					HTTPS 安全访问
				</view>
				<wd-switch
					:active-color="COLOR.PRIMARY"
					v-model="isHttps"
					size="20px"
					:disabled="isMp"
				/>
			</view>

			<view class="mt-10">
				<button
					class="text-white bg-primary border-none"
					:disabled="loading"
					:loading="loading"
					@click="login()"
				>
					登 录
				</button>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import FocusInput from '@/components/ui/input_focuse.vue';
import { onShareAppMessage } from '@dcloudio/uni-app';
import { COLOR } from '@/constants/index.js';
import { Login } from '@/service/http/login.js';
import { normalizeDomain } from '@/service/utils/string.js';
import {
	GetToken,
	SetToken,
	SetUserInfo,
	SetLoginInfo,
	GetLoginInfo,
} from '../../service/store/local';

const formData = reactive({
	domain: 'demo.easynvr.com:10000',
	username: 'easynvr',
	password: 'easynvr',
});

const isHttps = ref(true);

onMounted(() => {
	if (GetToken()) {
		uni.switchTab({ url: '/pages/index/view' });
	}

	const data = GetLoginInfo();
	if (data.url) {
		const protocolEndIndex = data.url.indexOf('://');
		if (protocolEndIndex !== -1) {
			// 根据协议设置 isHttps
			isHttps.value = data.url.substring(0, protocolEndIndex) === 'https';
			// 协议后面全部作为 domain
			formData.domain = data.url.substring(protocolEndIndex + 3);
			formData.username = data.username;
			formData.password = data.password;
		}
	}
});

let isMp = false;
// #ifdef MP
isMp = true;
isHttps.value = true;
// #endif

const loading = ref(false);

function getFullUrl() {
	const raw = formData.domain;
	const domain = normalizeDomain(raw);
	if (!domain) return '';
	const proto = isHttps.value ? 'https://' : 'http://';
	return `${proto}${domain}`;
}

const login = async () => {
	const url = getFullUrl();
	if (!url) {
		uni.showToast({ title: '请输入您的服务公网地址', icon: 'none' });
		return;
	}
	if (!formData.username) {
		uni.showToast({ title: '请输入您的账号', icon: 'none' });
		return;
	}
	if (!formData.password) {
		uni.showToast({ title: '请输入您的密码', icon: 'none' });
		return;
	}

	loading.value = true;
	SetLoginInfo({
		url,
		username: formData.username,
		password: formData.password,
	});
	try {
		const res = await Login({
			url,
			username: formData.username,
			password: formData.password,
		});
		SetToken(res.token);
		SetUserInfo(res);
		uni.switchTab({ url: '/pages/index/view' });
	} catch (err) {
		let msg =
			err.msg || err.errMsg || '登录失败，请检查您的服务地址是否正确';
		uni.showToast({ title: msg, icon: 'none' });
	} finally {
		loading.value = false;
	}
};

onShareAppMessage(() => ({
	title: 'EasyNVR 登录',
	path: '/pages/login/login',
	imageUrl: '',
}));
</script>

<style>
page {
	background-color: #fff;
}
</style>
