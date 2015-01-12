me.define("b", {
	ctrl: function () {
		// 获取从a传来的参数
		console.log(me.param());
	},

	back: function () {
		// 关闭页面b时，返回参数给a
		me.hide("返回的参数");
	}
});