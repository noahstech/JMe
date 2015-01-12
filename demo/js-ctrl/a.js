me.define("a", {
	ctrl: function () {
		// a初始化函数
	},

	showB: function () {
		me.show("tpl/b.html", {
			showType: 1,
			param: "传到b页面的参数"
		}).on("hide", function (hideParam) {
			console.log(hideParam);
		});
	}
});