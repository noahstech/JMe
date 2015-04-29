(function () {
	var that = me.define("list", {
		ctrl: function () {
			that.search();
		},

		add: function () {
			me.show("student", {
				showType: 1,
				style: "pop"
			}).on("hide", function (newStudent) {
				if (!newStudent) return;

				Util.add(newStudent);
				that.$scope.studentData.push(newStudent);
				Util.info("添加成功", true);
			});
		},

		edit: function (student, index) {
			me.show("student", {
				showType: 1,
				style: "pop",
				param: angular.copy(student)
			}).on("hide", function (newStudent) {
				if (!newStudent) return;

				Util.update(newStudent);
				that.$scope.studentData[index] = newStudent;
				Util.info("编辑成功", true);
			});
		},
		
		del: function (id, index) {
			me.show("myConfirm", {
				showType: 1,
				style: "pop",
				param: {
					title: "删除学生",
					text: "确定删除学生吗？"
				}
			}).on("hide", function (isConfirm) {
				if (!isConfirm) return;

				Util.del(id);
				that.$scope.studentData.splice(index, 1);
				Util.info("删除成功", true);
			});
		},

		search: function (params) {
			that.$scope.studentData = Util.query(params ? params.name : null);
		}
	});
})();