(function () {
	var that = me.define("myConfirm", {
		ctrl: function () {
			that.$scope.data = me.param();
		},

		confirm: function () {
			me.hide(true);
		}
	});
})();