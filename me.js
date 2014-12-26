// version 0.1
var me = $m = (function (config) {
	var that;
	var obj = function () {
		that = this;

		this.pageList = [];
		this.config = config || {
			main: "", // 默认打开的页面
			container: "body", // 根元素
			hideSelector: "", // 当showType = 1 打开页面的时候，需要隐藏的元素，返回到一级页面时，会重新显示
			tplPath: "tpl/" // 模板所在的路径，默认为tpl/
		};
		this.ctrlExtend = [];
	};

	obj.prototype = {
		ctrl: function ($rootScope, $scope, $compile, $location) {
			that.$scope = $scope;
			that.$compile = $compile;
			that.$location = $location;

			$rootScope.$on('$locationChangeSuccess', that._pageChange);

			that.$scope.show = that.show;
			that.$scope.hide = that.hide;

			that._init();
			that.onload && that.onload();
		},

		show: function (src, options) {
			options = options || {
				showType: 0, // 0：一级页面 1：非一级页面
				param: {}, // 传递的参数参数
				title: "", // 页面标题
				notNgEvent: false, // 是否不是ng事件
				onShowed: function () { }, // 页面show成功之后的事件
				onHided: function () { }, // 页面被隐藏时的事件
				style: "", // null: 填充（默认） 'pop'：弹出层
			};
			console.log("************");
			console.log(src);
			console.log(options.param);
			console.log("************");

			if (options.title) {
				document.title = options.title;
			} else {
				options.title = document.title;
			}

			var lastPage = that.getLastPage();
			var html = that._getPageHtml(src, options),
                container = $(that._getContainer());
			if (options.showType == 0) {
				container.html(html);
				that.config.hideSelector && $(that.config.hideSelector).show();
			} else {
				lastPage && (lastPage.scrollTop = $(document).scrollTop());

				var newPage = that.getLastPage();
				if (newPage.style == "pop") {
					container.append(html);
				} else {
					lastPage && ($("#" + lastPage.id).hide());
					container.append(html);
				}

				that.$location.hash(newPage.hash)
				that.config.hideSelector && $(that.config.hideSelector).hide();
			}

			options.notNgEvent && that.$scope.$apply();
			options.onShowed && options.onShowed();
		},

		hide: function () {
			history.go(-1);
		},

		param: function () {
			return that.pageList[that.pageList.length - 1].param;
		},

		extendCtrl: function(fnObj) {
			that.ctrlExtend.push(fnObj);
		},

		getLastPage: function (isRemove) {
			if (that.pageList.length > 0) {
				return isRemove ? that.pageList.pop() : that.pageList[that.pageList.length - 1];
			}
		},

		require: function (ctrlName, fn) {
			if (window[ctrlName]) throw new Error("me中已经注册了名为" + ctrlName + "的控制器");
			if (!fn || !fn.ctrl) throw new Error("me.require方法中的fn参数对象中需要提供ctrl方法");

			window[ctrlName] = (function () {
				var thatCtrl;
				var obj = function () {
					thatCtrl = this;
				}

				var pro = {};
				pro.ctrl = function ($scope, $http, $timeout) {
					thatCtrl.$scope = $scope;
					thatCtrl.$http = $http;
					thatCtrl.$timeout = $timeout;

					for (var fnName in pro) {
						if (fnName == "ctrl") continue;

						thatCtrl.$scope[fnName] = pro[fnName];
					}

					fn.ctrl.call(thatCtrl);
				};

				for (var fnName in fn) {
					if (fnName == "ctrl") continue;

					if (typeof fn[fnName] == "function") {
						pro[fnName] = (function (fnName) {
							return function () {
								return fn[fnName].apply(thatCtrl, arguments);
							};
						})(fnName);
					}
				}

				for (var i = 0; i < that.ctrlExtend.length; i++) {
					for (var j in that.ctrlExtend[i]){
						pro[j] = that.ctrlExtend[i][j];
					}
				}

				obj.prototype = pro;

				return new obj();
			})();
			
			return window[ctrlName];
		},

		_hidePage: function () {
			if (that.pageList.length == 0) {
				return;
			}

			// 删掉当前页面
			var curPageObj = that.getLastPage(true);
			that._cleanCtrl();
			curPageObj.onHided && curPageObj.onHided();
			$("#" + curPageObj.id).remove();

			// 显示上一个页面
			var lastPage = that.getLastPage();
			
			if(lastPage) {
				that.$location.hash(lastPage.hash);
				$("#" + lastPage.id).show();
				document.title = lastPage.title;

				that.$scope.$$postDigest(function () {
					window.scrollTo(0, lastPage.scrollTop);
				});
			}
			
			if (that.config.hideSelector && that.pageList.length == 1) {
				$(that.config.hideSelector).show();
			}
		},

		_cleanCtrl: function (isCleanAll) {
			if (!isCleanAll)
				that._cleanScope(angular.element($(that._getContainer()).find("> div:last > div")[0]));
			else {
				var pages = $(that._getContainer()).find("> div"),
                    angularEl;
				for (var i = 0; i < pages.length; i++) {
					angularEl = angular.element(pages.eq(i).find("> div")[0]);
					that._cleanScope(angularEl);
				}
			}
		},

		_cleanScope: function (angularEl) {
			if (angularEl.length > 0) {
				var vScope = angularEl.scope();
				vScope && vScope.$destroy();
			}
		},

		_pageChange: function (angularEvent, newUrl, oldUrl) {
			var lastPage = that.getLastPage();

			if (!lastPage) {
				return;
			}

			var newHash = that.$location.hash(),
                oldHash = lastPage.hash;

			if (newHash == oldHash) {
				return;
			}

			that._hidePage();
		},

		_init: function () {
			that.$location.hash("");

			var startPageName = that._getQueryString("p");
			if (startPageName) {
				that.show((that.config.tplPath || "tpl/") + startPageName + ".html", { showType: 0 });
			}
			else if (that.config.main) {
				that.show(that.config.main, { showType: 0 });
			}
		},

		_getPageHtml: function (src, options) {
			var pageId = "id" + Math.random().toString().substring(2);
			var page = '<div id="' + pageId + '" ng-include src="\'' + src + '?temp=' + Math.random() + '\'"></div>';
			page = that.$compile(page)(that.$scope);

			var pageObj = {
				id: pageId,
				hash: (options.showType == 0) ? "" : pageId,
				scrollTop: 0,
				param: options.param,
				title: that.pageList.length == 0 ? document.title : options.title,
				onHided: options.onHided,
				style: options.style,
				src: src
			};

			if (options.showType == 0) {
				that._cleanCtrl(true);
				that.pageList = [pageObj];
			} else {
				that.pageList.push(pageObj);
			}

			return page;
		},

		_getContainer: function () {
			return that.config.container || "body";
		},

		_getQueryString: function (name) {
			var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
			var r = window.location.search.substr(1).match(reg);
			if (r != null) return unescape(r[2]);
			return "";
		}
	};

	return new obj();
})(window.Config);