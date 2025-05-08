import {
	defineStore,
	storeToRefs,
} from 'pinia';

// model/global.js
export const useGlobalStore = defineStore('global', {
	state: () => ({
		isSettings: false, //是否配置了远端地址
		remoteUrl: '', //远端地址
		count: 0,
	}),
	actions: {
		setCount() {
			this.count++;
		},
		setSettings(remoteUrl) {
			this.isSettings = true;
			this.remoteUrl = remoteUrl;
		},
	},
	persist: {
		enabled: true, // 开启持久化存储
		strategies: [{
			key: 'globalStore',
			storage: {
				getItem: (key) => uni.getStorageSync(key),
				setItem: (key, value) => uni.setStorageSync(key, value),
			},
		}],
	},
});

export const useGlobal = () => {
	const globalStore = useGlobalStore();
	const stateRefs = storeToRefs(globalStore); // 让 state 变成响应式
	return {
		...stateRefs,
		setCount: globalStore.setCount,
		setSettings: globalStore.setSettings,
	}; // 只展开 state，手动添加 action
};