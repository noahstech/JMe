(function () {
	var that = me.define("student", {
		ctrl: function () {
			that.$scope.student = me.param() || {
				sex: 1
			};
		},

		confirm: function (student) {
			if (!student.name) {
				Util.info("请填写姓名");
				return;
			}
			if (!/^\d+$/.test(student.age)) {
				Util.info("请填写学生年龄");
				return;
			}
			if (!student.class) {
				Util.info("请填写班级");
				return;
			}

			me.hide(student);
		}
	});
})();