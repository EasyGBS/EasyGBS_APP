import {
	createPinia,
} from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import App from './App';

// #ifdef VUE3
const pinia = createPinia()
import {
	createSSRApp,
} from 'vue'
export function createApp() {
	const app = createSSRApp(App)
	app.use(pinia.use(piniaPluginPersistedstate));
	return {
		app,
	}
}
// #endif