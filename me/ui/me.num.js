
/**
 * 带翻加减的数字输入框
 */
me.directive("mNum", function () {
	return {
		restrict: "EA",
		replace: true,
		require: "?ngModel",
		scope: {
			min: "@",
			max: "@"
		},
		template: '<ul class="jia_jian_input"><li >-</li><li><input /></li><li>+</li></ul>',
		link: function (scope, element, attrs, ngModel) {
			if (!ngModel) return;

			var input = element.find("input"),
				jian = element.find("li").eq(0),
				jia = element.find("li").eq(2);
			ngModel.$render = function () {
				var value = parseFloat(ngModel.$viewValue) || 0;
				value = Math.min(value, scope.max);
				value = Math.max(value, scope.min);
				
				input.val(value);
				setDisabled(value);
			};
			input.on('change keyup', function () {
				var value = parseFloat(input.val()) || 0;

				if (value > scope.max || value < scope.min) {
					value = Math.min(value, scope.max);
					value = Math.max(value, scope.min);
					input.val(value);
				}
				
				setDisabled(value);
				scope.$apply(function () {
					ngModel.$setViewValue(value);
				});
			});
			
			jian.on("click", function () {
				var value = parseFloat(ngModel.$viewValue) || 0;
				if (value <= scope.min) {
					return;
				}

				value--;
				input.val(value);
				scope.$apply(function () {
					ngModel.$setViewValue(value);
				});
				setDisabled(value);
			});

			jia.on("click", function () {
				var value = parseFloat(ngModel.$viewValue) || 0;

				if (value >= scope.max) {
					return;
				}

				value++;
				input.val(value);
				scope.$apply(function () {
					ngModel.$setViewValue(value);
				});
				setDisabled(value);
			});

			function setDisabled(value) {
				if (value <= scope.min) {
					jian.addClass("disabled");
				} else {
					jian.removeClass("disabled");
				}

				if (value >= scope.max) {
					jia.addClass("disabled");
				} else {
					jia.removeClass("disabled");
				}
			}
		}
	}
});