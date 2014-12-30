;(function () {
	var isIOS = !!navigator.userAgent.match(/(i[^;]+\;(U;)? CPU.+Mac OS X)/);

	var utils = (function () {
		var o = {};

		o.setTitle = function (title) {
			document.title = title;
			if (!isIOS) return;

			var $iframe = $('<iframe src="/favicon.ico" style="display:none;"></iframe>').on('load', function () {
				setTimeout(function () {
					$iframe.off('load').remove();
				}, 0)
			}).appendTo($('body'))
		}

		o.getQueryString = function (name) {
			var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
			var r = window.location.search.substr(1).match(reg);
			if (r != null) return unescape(r[2]);
			return "";
		}

		return o;
	})();

	var that;
	var obj = function () {
		that = this;

		this.pageList = [];
		this._readyFnList = [];
		this._directiveList = [];
		//this._serviceList = [];
	};

	obj.prototype = {
		/**
		 * me主入口
		 * @function ctrl
		 */
		ctrl: function ($rootScope, $scope, $compile, $location) {
			that.$scope = $scope;
			that.$compile = $compile;
			that.$location = $location;

			that._triggerReadyFn();
			$rootScope.$on('$locationChangeSuccess', that._pageChange);

			that.$scope.show = that.show;
			that.$scope.hide = that.hide;

			that._init();
		},

		/**
		 * 配置me
		 * @function config
		 * @param {Object} cf - 配置参数
		 * @property {String} main - 默认打开的页面
		 * @property {String} container - 根元素的jQuery选择器
		 * @property {String} hideSelector - 当showType = 1 打开页面的时候，需要隐藏的元素选择器，返回到一级页面时，会重新显示
		 * @property {String} tplPath - 模板所在的路径，默认为tpl/
		 */
		config: function (cf) {
			that.config = cf
		},

		// 自定义服务
		//service: function (svName, fn) {
		//	that._serviceList.push({
		//		name: svName,
		//		fn: fn
		//	});
		//},

		directive: function (tagName, fn) {
			if (typeof fn != "function") return;

			that._directiveList.push({
				tagName: tagName,
				fn: fn
			});
		},

		/**
		 * 启动angular
		 * @function ready
		 * @param {String} appName - 应用程序名称
		 * @param {Array} plugins - 插件列表
		 */
		run: function (appName, plugins) {
			that._module = angular.module(appName, plugins);

			that._buildDirective();

			//for (var i = 0; i < that._serviceList.length; i++) {
			//	that._module.factory(that._serviceList[i].name, that._serviceList[i].fn);
			//}
		},

		/**
		 * 注入me稳定后需要执行的函数
		 * @function ready
		 * @param {Function} fn - me稳定后执行的函数
		 */
		ready: function (fn) {
			if (typeof fn != "function") return;

			that._readyFnList.push(fn);
		},

		/**
		 * 显示一个页面
		 * @function show
		 * @param {String} src - 页面src
		 * @param {Object} options - 参数
		 * @property {Number} showType - 页面类型，0：一级页面 1：非一级页面
		 * @property {Object} param - 传递的参数参数
		 * @property {String} title - 页面标题
		 * @property {Boolean} refresh - 是否立即渲染ui
		 * @property {String} style - null: 填充（默认） 'pop'：弹出层
		 */
		show: function (src, options) {
			that._log(src, options);
			that._setTitle(options);

			var lastPage = that._getLastPage(),
				html = that._getPageHtml(src, options),
                container = $(that._getContainer()),
				newPage = that._getLastPage();

			if (options.showType == 0) {
				container.html(html);
				that.config.hideSelector && $(that.config.hideSelector).show();
			} else {
				lastPage && (lastPage.scrollTop = $(document).scrollTop());

				if (newPage.style == "pop") {
					container.append(html);
				} else {
					lastPage && ($("#" + lastPage.id).hide());
					container.append(html);
				}

				that.$location.hash(newPage.hash)
				that.config.hideSelector && $(that.config.hideSelector).hide();
			}

			options.refresh && that.$scope.$apply();

			return newPage;
		},

		/**
		 * 关闭页面，如果只剩下一个页面，则不会有任何动作
		 * @function hide
		 * @param {Object} params - 这里的参数将会被传入页面hide事件中
		 * @param {Number} layer - 关闭的层级，默认为1，表示关闭当前页面，如果大于1，则往上关闭相应的页面
		 */
		hide: function (params, layer) {
			if (that.pageList.length <= 0) {
				return;
			}

			that._hideParam = params;
			history.go(-1);
		},

		/**
		 * 获得顶层页面的参数
		 * @function param
		 */
		param: function () {
			return that.page().param;
		},

		/**
		 * 执行顶层页面注册的事件
		 * @function trigger
		 * @param {String} ename - 事件名称
		 * @param {Arguments} args - 传递的参数，多个参数逗号分隔
		 */
		trigger: function (ename, args) {
			var page = that.page();
			page.exec.apply(page, arguments);
		},

		/**
		 * 获取顶层的页面对象
		 * @function page
		 */
		page: function () {
			return that._getLastPage();
		},

		/**
		 * 定义controller
		 * @function define
		 * @param {String} ctrlName - controller名称
		 * @param {Object} fnList - 接口列表
		 */
		define: function (ctrlName, fnList) {
			return that.require(ctrlName, fnList);
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

				obj.prototype = pro;

				return new obj();
			})();

			return window[ctrlName];
		},

		/**
		 * 获取顶层页面对象
		 * @function _getLastPage
		 * @private
		 * @param {Boolean} isRemove - 获取后是否从队列中删除
		 */
		_getLastPage: function (isRemove) {
			if (that.pageList.length > 0) {
				return isRemove ? that.pageList.pop() : that.pageList[that.pageList.length - 1];
			}
		},

		/**
		 * 删除顶层页面
		 * @function _hidePage
		 * @private
		 */
		_hidePage: function () {
			if (that.pageList.length <= 0) return;

			// 删掉当前页面
			var curPageObj = that._getLastPage(true);
			that._cleanCtrl();

			// 出发hide事件
			that._triggerEvent(curPageObj, "hide", that._hideParam ? [that._hideParam] : null);
			that._hideParam = null;

			$("#" + curPageObj.id).remove();

			// 显示上一个页面
			var lastPage = that._getLastPage();
			if (lastPage) {
				that.$location.hash(lastPage.hash);
				$("#" + lastPage.id).show();
				that._setTitle(lastPage);

				that.$scope.$$postDigest(function () {
					window.scrollTo(0, lastPage.scrollTop);
				});
			}

			// 显示被隐藏的元素
			if (that.config.hideSelector && that.pageList.length == 1) {
				$(that.config.hideSelector).show();
			}
		},

		/**
		 * 准备销毁页面控制器内存
		 * @function _cleanCtrl
		 * @private
		 * @param {Boolean} isCleanAll - 是否销毁所有的页面，如果为false，只销毁当前的页面
		 */
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

		/**
		 * 销毁某个angular控制器
		 * @function _cleanScope
		 * @private
		 * @param {Element} angularEl - angular元素
		 */
		_cleanScope: function (angularEl) {
			if (angularEl.length > 0) {
				var vScope = angularEl.scope();
				vScope && vScope.$destroy();
			}
		},

		/**
		 * 路由捕捉到的页面url更改事件
		 * @function _pageChange
		 * @private
		 * @param {Event} angularEvent - event对象
		 * @param {String} newUrl - 更改之后的url
		 * @param {String} oldUrl - 更改之前的url
		 */
		_pageChange: function (angularEvent, newUrl, oldUrl) {
			var lastPage = that._getLastPage();

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

		/**
		 * 在ctrl主入口中调用的初始化方法
		 * @function _init
		 * @private
		 */
		_init: function () {
			that.$location.hash("");

			var startPageName = utils.getQueryString("p");
			if (startPageName) {
				that.show((that.config.tplPath || "tpl/") + startPageName + ".html", { showType: 0 });
			}
			else if (that.config.main) {
				that.show(that.config.main, { showType: 0 });
			}
		},

		/**
		 * 获取即将打开的页面html对象
		 * @function _getPageHtml
		 * @private
		 * @param {String} src - me.show中传入的src
		 * @param {Object} options - me.show中传入的options对象
		 */
		_getPageHtml: function (src, options) {
			var pageId = "id" + Math.random().toString().substring(2);
			var page = '<div id="' + pageId + '" ng-include src="\'' + src + '?temp=' + Math.random() + '\'"></div>';
			page = that.$compile(page)(that.$scope);

			var pageObj = {
				id: pageId,
				hash: (options.showType == 0) ? "" : pageId,
				scrollTop: 0,
				param: options.param,
				title: options.title,
				style: options.style,
				src: src
			};

			that._appendEvent(pageObj);

			if (options.showType == 0) {
				that._cleanCtrl(true);
				that.pageList = [pageObj];
			} else {
				that.pageList.push(pageObj);
			}

			return page;
		},

		/**
		 * 在页面对象中添加on和exec函数
		 * @function _appendEvent
		 * @private
		 * @param {Object} pageObj - 页面对象
		 */
		_appendEvent: function (pageObj) {
			pageObj.on = function (ename, callback) {
				if (typeof (callback) != "function") return;
				this._eventMap = this._eventMap || {};
				this._eventMap[ename] = callback;
				return this;
			}

			pageObj.exec = function (ename) {
				var args = null;
				if (arguments.length > 1) {
					args = [];
					for (var i = 1; i < arguments.length; i++) {
						args.push(arguments[i]);
					}
				}

				that._triggerEvent(this, ename, args);
				return this;
			}
		},

		/**
		 * 触发页面的事件
		 * @function _triggerEvent
		 * @private
		 * @param {Object} page - 页面对象
		 * @param {String} ename - 事件名称
		 * @param {Array} args - 参数
		 */
		_triggerEvent: function (page, ename, args) {
			if (!ename
				|| !page._eventMap
				|| !(ename in page._eventMap)
				|| typeof (page._eventMap[ename]) != "function")
				return;
			page._eventMap[ename].apply(page, args);
		},

		/**
		 * 获取config中设置的container对象，如果没有设置，返回body对象
		 * @function _getContainer
		 * @private
		 */
		_getContainer: function () {
			return that.config.container || "body";
		},

		/**
		 * me.show页面时，在控制台打印的数据
		 * @function _log
		 * @private
		 * @param {String} src - 路径
		 * @param {Object} options - me.show的时候传入的options
		 */
		_log: function (src, options) {
			console.group("me.js");
			console.log("%c 链接：" + src, "color:green");
			console.log("%c 参数：" + (options.param ? "" : "[无]"), "color:green");
			options.param && console.log(options.param)
			console.groupEnd();
		},

		/**
		 * 触发me.ready中注册的函数
		 * @function _triggerReadyFn
		 * @private
		 */
		_triggerReadyFn: function () {
			if (that._readyFnList.length == 0) return;

			for (var i = 0; i < that._readyFnList.length; i++) {
				that._readyFnList[i](that.$scope);
			}
		},

		_buildDirective: function () {
			for (var i = 0; i < that._directiveList.length; i++) {
				that._module.directive(that._directiveList[i].tagName, that._directiveList[i].fn);
			}
		},

		/**
		 * 设置新打开的页面标题
		 * @function _setTitle
		 * @private
		 * @param {String} options - me.show的时候传入的options
		 */
		_setTitle: function (options) {
			if (!options.title) {
				options.title = document.title;
				return;
			}

			utils.setTitle(options.title);
		}
	};
	
	window.me = new obj();
})();