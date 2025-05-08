/**
 * 获取状态栏高度 兼容小程序 app
 */
export function GetNavBarHeight() {
	if (wx.getMenuButtonBoundingClientRect) { // 判断是否为小程序环境
		let res = wx.getMenuButtonBoundingClientRect();
		return res.top; // 返回高度值
	} else {
		// 如果是 APP，假设状态栏高度为 20px
		return 40; // 返回高度值
	}
}