//详细配置教程请参考：http://eslint.cn/docs/user-guide/configuring
module.exports = {
	plugins: ['html'],
	extends: 'plugin:vue/base',
	parserOptions: {
		ecmaVersion: 'latest',
		sourceType: 'module',
		ecmaFeatures: {
			jsx: true,
		},
		allowImportExportEverywhere: false,
	},
	'settings': {
		'html/html-extensions': ['.erb', '.handlebars', '.hbs', '.htm', '.html', '.mustache', '.nunjucks', '.php',
			'.tag', '.twig', '.wxml', '.we',
		],
	},
	rules: {
		/*
		  "off" 或 0 - 关闭规则
		  "warn" 或 1 - 开启规则，使用警告级别的错误：warn (不会导致程序退出)
		  "error" 或 2 - 开启规则，使用错误级别的错误：error (当被触发的时候，程序会退出)
		  */
		'no-const-assign': 2, //禁止修改const声明的变量
		'no-dupe-keys': 'error', //禁止对象字面量中出现重复的 key

		//不允许覆盖保留关键字
		'vue/no-reserved-keys': 'error',
		//在 中不允许mustaches
		'vue/no-textarea-mustache': 'error',
		//不允许在v-for或者范围内的属性出现未使用的变量定义
		'vue/no-unused-vars': 'warn',
		//标签需要v-bind:is属性
		'vue/require-component-is': 'error',
		// render 函数必须有一个返回值
		'vue/require-render-return': 'error',
		//保证 v-bind:key 和 v-for 指令成对出现
		'vue/require-v-for-key': 'error',
		// 检查默认的prop值是否有效
		'vue/require-valid-default-prop': 'error',
		// 保证computed属性中有return语句
		'vue/return-in-computed-property': 'error',
		// 强制校验 template 根节点
		'vue/valid-template-root': 'error',
		// 强制校验 v-bind 指令
		'vue/valid-v-bind': 'error',
		// 强制校验 v-cloak 指令
		'vue/valid-v-cloak': 'error',
		// 强制校验 v-else-if 指令
		'vue/valid-v-else-if': 'error',
		// 强制校验 v-else 指令
		'vue/valid-v-else': 'error',
		// 强制校验 v-for 指令
		'vue/valid-v-for': 'error',
		// 强制校验 v-html 指令
		'vue/valid-v-html': 'error',
		// 强制校验 v-if 指令
		'vue/valid-v-if': 'error',
		// 强制校验 v-model 指令
		'vue/valid-v-model': 'error',
		// 强制校验 v-on 指令
		'vue/valid-v-on': 'error',
		// 强制校验 v-once 指令
		'vue/valid-v-once': 'error',
		// 强制校验 v-pre 指令
		'vue/valid-v-pre': 'error',
		// 强制校验 v-show 指令
		'vue/valid-v-show': 'error',
		// 强制校验 v-text 指令
		'vue/valid-v-text': 'error',
		'vue/comment-directive': 0,
	},
};