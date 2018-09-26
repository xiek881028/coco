/*!
 * index
 * xiekai <xk285985285@.qq.com>
 * create: 2018/09/08
 * since: 0.0.1
 */
'use strict';

module.exports.default = module.exports = {

	// 数组判断
	isArray: function (it) {
		return Object.prototype.toString.call(it) === '[object Array]';
	},

	// 对象判断
	isObject: function (it) {
		return Object.prototype.toString.call(it) === '[object Object]';
	},

	// 数组合并处理
	// mode 合并方式 diff：差集 sum：合集
	mathArr: function (arr1, arr2, mode = 'diff') {
		let set = new Set(arr2);
		let out = [];
		arr1.map(item => {
			if(mode == 'diff' && !set.has(item)){
				out.push(item);
			}
			if(mode == 'sum' && set.has(item)){
				out.push(item);
			}
		});
		return out;
	},
}
