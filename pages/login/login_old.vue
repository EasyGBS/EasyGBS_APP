<!-- 蓝色登录页面2 -->
<template>
	<view style="height: 100vh; background: #fff">
		<view class="img-a">
			<view class="t-b">
				您好，
				<br />
				欢迎使用，EasyNVR
			</view>
		</view>
		<view class="login-view" style="">
			<view class="t-login">
				<form class="cl">
					<view class="t-a">
						<text class="txt">服务地址</text>
						<view class="url-input">
							<!-- 点击选择协议 -->
							<wd-popover
								mode="menu"
								:content="filteredProtocolOptions"
								@menuclick="selectProtocol"
							>
								<view class="flex items-center popove-style">
									<wd-icon
										custom-class="icon-arrow"
										name="fill-arrow-down"
									></wd-icon>
									<text class="pl-1">
										{{ selectedProtocol }}
									</text>
								</view>
							</wd-popover>
							<input
								class="text-center"
								style="width: 100%"
								v-model="formData.domain"
								placeholder="域名 或 IP，如 example.com"
							/>
							<view
								style="
									text-align: center;
									height: 90rpx;
									width: 32rpx;
								"
							>
								:
							</view>
							<input
								style="width: 80px"
								v-model="formData.port"
							/>
						</view>
					</view>
					<view class="t-a">
						<text class="txt">账号</text>
						<input
							name="username"
							placeholder="默认账号 easynvr"
							v-model="formData.username"
						/>
					</view>
					<view class="t-a">
						<text class="txt">密码</text>
						<input
							type="password"
							name="code"
							placeholder="默认密码 easynvr"
							v-model="formData.password"
						/>
					</view>
					<button
						type="primary"
						@click="login()"
						:disabled="loading"
						:loading="loading"
					>
						登 录
					</button>
				</form>
			</view>
		</view>
	</view>
</template>
<script setup>
import { onMounted, reactive, ref, computed } from 'vue';
import { onShareAppMessage } from '@dcloudio/uni-app'
import { Login } from '@/service/http/login.js';
import {
	GetToken,
	SetToken,
	SetUserInfo,
	SetLoginInfo,
	GetLoginInfo,
} from '../../service/store/local';

const loading = ref(false);

const formData = reactive({
	domain: 'demo.easynvr.com', // 域名
	port: '10000', // 端口号
	username: 'easynvr',
	password: 'easynvr',
});

onMounted(() => {
	// 如果有token 直接跳转
	if (GetToken()) {
		uni.switchTab({
			url: '/pages/index/view',
		});
	}

	// const data = GetLoginInfo();
	// if (data.url) {
	// 	const protocolEndIndex = data.url.indexOf('://');
	// 	if (protocolEndIndex !== -1) {
	// 		// 提取协议部分（包含 ://）
	// 		selectedProtocol.value = data.url.substring(
	// 			0,
	// 			protocolEndIndex + 3
	// 		); // 结果示例：https://

	// 		// 提取剩余部分（example.com:8080/path）
	// 		const remaining = data.url.substring(protocolEndIndex + 3);

	// 		// 分割域名和端口
	// 		const hostParts = remaining.split(/[/?#]/)[0].split(':'); // 示例：["example.com", "8080"]
	// 		formData.domain = hostParts[0]; // example.com
	// 		formData.port = hostParts[1] || ''; // 8080
	// 	}
	// }
	// formData.username = data.username;
	// formData.password = data.password;
});

// 协议选择
const protocolOptions = [{ content: 'http://' }, { content: 'https://' }];
const selectedProtocol = ref('https://'); // 默认选择 https://

const isMiniProgram =
	process.env.UNI_PLATFORM && process.env.UNI_PLATFORM.startsWith('mp-');

// 利用 computed 生成过滤后的选项
const filteredProtocolOptions = computed(() => {
	return isMiniProgram
		? protocolOptions.filter((item) => item.content !== 'http://')
		: protocolOptions;
});

// 选择协议
const selectProtocol = ({ item, index }) => {
	selectedProtocol.value = item.content;
};

// 组装完整的 URL
const getFullUrl = () => {
	const protocol = selectedProtocol.value;
	const domain = formData.domain.trim();
	const port = formData.port.trim();
	if (!domain) return '';

	// 处理端口（如果填了则加上）
	return port ? `${protocol}${domain}:${port}` : `${protocol}${domain}`;
};

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
		uni.switchTab({
			url: '/pages/index/view',
		});
	} catch (err) {
		let msg = err.msg;
		if (!msg) {
			msg = err.errMsg || '登录失败，请检查您的服务地址是否正确';
		}

		uni.showToast({ title: msg, icon: 'none' });
	} finally {
		loading.value = false; // 关闭loading
	}
};

onShareAppMessage(() => {
  return {
    title: 'EasyNVR 登录',
    path: '/pages/login/login',
    imageUrl: ''
  };
});
</script>

<style>
page {
	padding: 0;
}

.url-input {
	display: flex;
	align-items: center;
	width: 100%;
}

.popove-style {
	height: 90rpx;
	line-height: 90rpx;
	margin-bottom: 50rpx;
	border-bottom: 1px solid #e9e9e9;
	font-size: 28rpx;
	margin-right: 8px;
}

.picker {
	width: 100px;
}

.txt {
	font-size: 32rpx;
	font-weight: bold;
	color: #333333;
}
.img-a {
	width: 100%;
	height: 450rpx;
	background-image: url(https://easynvr.com/image/head.png);
	background-size: 100%;
}
.reg {
	font-size: 28rpx;
	color: #fff;
	height: 90rpx;
	line-height: 90rpx;
	border-radius: 50rpx;
	font-weight: bold;
	background: #f5f6fa;
	color: #000000;
	text-align: center;
	margin-top: 30rpx;
}

.login-view {
	width: 100%;
	position: relative;
	margin-top: -120rpx;
	background-color: #ffffff;
	border-radius: 8% 8% 0% 0;
}

.t-login {
	width: 600rpx;
	margin: 0 auto;
	font-size: 28rpx;
	padding-top: 80rpx;
}

.t-login button {
	font-size: 28rpx;
	background: #2796f2;
	color: #fff;
	height: 90rpx;
	line-height: 90rpx;
	border-radius: 50rpx;
	font-weight: bold;
}

.t-login input {
	height: 90rpx;
	line-height: 90rpx;
	margin-bottom: 50rpx;
	border-bottom: 1px solid #e9e9e9;
	font-size: 28rpx;
}

.t-login .t-a {
	position: relative;
}

.t-b {
	text-align: left;
	font-size: 42rpx;
	color: #ffffff;
	padding: 130rpx 0 0 70rpx;
	font-weight: bold;
	line-height: 70rpx;
}

.t-login .t-c {
	position: absolute;
	right: 22rpx;
	top: 22rpx;
	background: #5677fc;
	color: #fff;
	font-size: 24rpx;
	border-radius: 50rpx;
	height: 50rpx;
	line-height: 50rpx;
	padding: 0 25rpx;
}

.t-login .t-d {
	text-align: center;
	color: #999;
	margin: 80rpx 0;
}

.t-login .t-e {
	text-align: center;
	width: 250rpx;
	margin: 80rpx auto 0;
}

.t-login .t-g {
	float: left;
	width: 50%;
}

.t-login .t-e image {
	width: 50rpx;
	height: 50rpx;
}

.t-login .t-f {
	text-align: center;
	margin: 150rpx 0 0 0;
	color: #666;
}

.t-login .t-f text {
	margin-left: 20rpx;
	color: #aaaaaa;
	font-size: 27rpx;
}

.t-login .uni-input-placeholder {
	color: #aeaeae;
}

.cl {
	zoom: 1;
}

.cl:after {
	clear: both;
	display: block;
	visibility: hidden;
	height: 0;
	content: '\20';
}
</style>
