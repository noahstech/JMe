var Util = (function () {
	var studentData = [
		{
			"id": 1,
			"name": "哈登",
			"age": 18,
			"sex": 1,
			"phone": "13800000000",
			"class": "A班"
		},
		{
			"id": 2,
			"name": "库里",
			"age": 17,
			"sex": 1,
			"phone": "13800000001",
			"class": "A班"
		},
		{
			"id": 2,
			"name": "威少",
			"age": 18,
			"sex": 1,
			"phone": "13800000002",
			"class": "A班"
		},
		{
			"id": 4,
			"name": "邓肯",
			"age": 28,
			"sex": 1,
			"phone": "13800000003",
			"class": "A班"
		},
		{
			"id": 5,
			"name": "考神",
			"age": 18,
			"sex": 1,
			"phone": "13800000004",
			"class": "A班"
		},

		{
			"id": 6,
			"name": "欧文",
			"age": 18,
			"sex": 1,
			"phone": "13800000005",
			"class": "B班"
		},
		{
			"id": 7,
			"name": "沃尔",
			"age": 17,
			"sex": 1,
			"phone": "13800000006",
			"class": "B班"
		},
		{
			"id": 8,
			"name": "詹姆斯",
			"age": 18,
			"sex": 0,
			"phone": "13800000007",
			"class": "B班"
		},
		{
			"id": 9,
			"name": "巴特勒",
			"age": 28,
			"sex": 1,
			"phone": "13800000008",
			"class": "B班"
		},
		{
			"id": 10,
			"name": "安东尼",
			"age": 18,
			"sex": 1,
			"phone": "13800000009",
			"class": "B班"
		}
	];

	var that;
	var obj = function () {
		this.ajaxCount = 0;
		that = this;
		that.popId = [];

	};

	obj.prototype = {
		getQueryString: function (name) {
			var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
			var r = window.location.search.substr(1).match(reg);
			if (r != null) return unescape(r[2]);
			return "";
		},

		info: function (msg, success) {
			$(".util_pop_info").remove();

			var innerDiv = document.createElement("div");
			innerDiv.className = "util_pop_info";
			if (success) {
				innerDiv.className += " success";
			}
			innerDiv.innerHTML = msg;

			document.body.appendChild(innerDiv);
			setTimeout(function () {
				$(".util_pop_info").remove();
			}, 3000);
		},

		query: function (name) {
			if (!name) return angular.copy(studentData);

			var result = [];
			studentData.forEach(function (student) {
				if (student.name.indexOf(name) >= 0) result.push(angular.copy(student));
			});
			return result;
		},

		add: function (newStudent) {
			newStudent.id = Math.random().toString().substring(2);
			studentData.push(newStudent);
		},

		del: function (id) {
			for (var i = 0; i < studentData.length; i++) {
				if (studentData[i].id == id) {
					studentData.splice(i, 1);
					break;
				}
			}
		},

		update: function (newStudent) {
			for (var i = 0; i < studentData.length; i++) {
				if (studentData[i].id == newStudent.id) {
					studentData[i] = newStudent;
					break;
				}
			}
		}
	};

	return new obj();
})();