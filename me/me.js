;(function () {
	var utils = (function () {
		var isIOS = !!navigator.userAgent.match(/(i[^;]+\;(U;)? CPU.+Mac OS X)/);

		var _utils = {};
		_utils.setTitle = function (title) {
			document.title = title;
			if (!isIOS) return;

			var $iframe = $('<iframe src="/favicon.ico" style="display:none;"></iframe>').on('load', function () {
				setTimeout(function () {
					$iframe.off('load').remove();
				}, 0)
			}).appendTo($('body'))
		}

		_utils.getQueryString = function (name) {
			var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
			var r = window.location.search.substr(1).match(reg);
			if (r != null) return unescape(r[2]);
			return "";
		}

		return _utils;
	})();

	var that, _scope, _compile, _location, _config, _container, _animateOptions;
	var _http;
	var obj = function () {
		that = this;

		this._pageList = [];
		this._readyFnList = [];
		this._directiveList = [];
		//this._serviceList = [];
	};

	obj.prototype = {
		/**
		 * me主入口
		 * @function ctrl
		 */
		ctrl: function ($rootScope, $scope, $compile, $location,$http) {
			_scope = $scope;
			_compile = $compile;
			_location = $location;
			_http = $http;

			that._triggerReadyFn();
			$rootScope.$on('$locationChangeSuccess', that._urlChanged);

			_scope.show = that.show;
			_scope.hide = that.hide;

			that._init();
		},

		/**
		 * 请求网络数据
		 * @function ajax
		 * @param {Object} option - 请求参数
		 * @param {function} success - 成功回调函数
		 * @param {function} failure - 失败回调函数
	     * @param {function} before - 调用前准备函数
		 */
		ajax:function (option,success,failure,before) {
			if(before && typeof(before) == 'function')before();

			_http(option).success(function (data) {
				
				if(success && typeof(success) == 'function')success(data);

			}).error(function (msg, status) {

				console.log('me ajax callback error | msg='+msg+'\r\n\tstatus='+status);
				if(failure && typeof(failure) == 'function')failure(msg,status);
			});
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
			_config = cf
		},

		// 自定义服务
		//service: function (svName, fn) {
		//	that._serviceList.push({
		//		name: svName,
		//		fn: fn
		//	});
		//},

		/**
		 * 设置或者获取全局数据，参数可以是一个object，也可以是key,value
		 * @function global
		 * @demo 
		 * 设置：
		 * me.global(key, value)
		 * 或者
		 * me.global({key1: value1, key2: value2})
		 * 获取：
		 * js中 me.global.key
		 * html中 global.key
		 */
		global: function () {
			function _setGlobalValue(key, value) {
				that.global[key] = value;

				_scope.global || (_scope.global = {});
				_scope.global[key] = value;
			}

			if (arguments.length == 1
				&& typeof arguments[0] == "object") {
				for (var key in arguments[0]) {
					_setGlobalValue(key, arguments[0][key]);
				}
			} else if (arguments.length == 2
				&& typeof (arguments[0] == "string")) {
				_setGlobalValue(arguments[0], arguments[1]);
			}
		},

		/**
		 * 扩展公共指令
		 * @function ready
		 * @param {String} tagName - 指令名称
		 * @param {Function} fn - 指令构造函数，参考angular.directive
		 */
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
                container = that._getContainer(),
				newPage = that._getLastPage();

			if (options.showType == 0) {
				container.html(html);
				_config.hideSelector && $(_config.hideSelector).show();
			} else {
				lastPage && (lastPage.scrollTop = $(document).scrollTop());

				container.append(html);
				newPage.style == "pop" || (lastPage && ($("#" + lastPage.id).hide()));

				_location.hash(newPage.hash)
				_config.hideSelector && $(_config.hideSelector).hide();
			}

			options.refresh && _scope.$apply();

			return newPage;
		},

		/**
		 * 关闭页面，如果只剩下一个页面，则不会有任何动作
		 * @function hide
		 * @param {Object} params - 这里的参数将会被传入页面hide事件中
		 * @param {Number} layer - 关闭的层级，默认为1，表示关闭当前页面，如果大于1，则往上关闭相应的页面
		 */
		hide: function (params, layer) {
			if (that._pageList.length <= 0) {
				return;
			}

			that._hideParam = params;
			that._hideLayer = layer || 1;

			that._triggerHide();
		},

		/**
		 * 设置页面进入和离去动画，该配置作用于showType=1的情况
		 * @function animate
		 * @param {Object} options - 参数
		 * @property {Function} show - 页面显示之前的回调函数，会传递即将被显示的页面对象和即将被隐藏的页面对象
		 * @property {Function} hide - 页面隐藏之前的回调函数，会传递即将被显示的页面对象和即将被隐藏的页面对象
		 */
		//animate: function (options) {
		//	_animateOptions = options;
		//},

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
		 * 处理页面进入和离去动画
		 * @function _handleAnimate
		 * @private
		 * @param {Element} showPage - 即将被显示的元素
		 * @param {Element} hidePage - 即将被隐藏的元素
		 * @param {Boolean} isShow - 是显示页面还是隐藏页面
		 */
		//_handleAnimate: function (showPage, hidePage, isShow) {
		//	if (!_animateOptions) return;

		//	_animateOptions.show && _animateOptions.show($(showPage[0]), hidePage);
		//},

		/**
		 * 执行hide
		 * @function _triggerHide
		 * @private
		 */
		_triggerHide: function () {
			if (that._hideLayer <= 0) return;

			that._hideLayer--;
			history.go(-1);
		},

		/**
		 * 获取顶层页面对象
		 * @function _getLastPage
		 * @private
		 * @param {Boolean} isRemove - 获取后是否从队列中删除
		 */
		_getLastPage: function (isRemove) {
			if (that._pageList.length > 0) {
				return isRemove ? that._pageList.pop() : that._pageList[that._pageList.length - 1];
			}
		},

		/**
		 * 删除顶层页面
		 * @function _hidePage
		 * @private
		 */
		_hidePage: function () {
			if (that._pageList.length <= 0) return;

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
				_location.hash(lastPage.hash);
				$("#" + lastPage.id).show();
				that._setTitle(lastPage);

				_scope.$$postDigest(function () {
					window.scrollTo(0, lastPage.scrollTop);
				});
			}

			// 显示被隐藏的元素
			if (_config.hideSelector && that._pageList.length == 1) {
				$(_config.hideSelector).show();
			}

			that._triggerHide();
		},

		/**
		 * 准备销毁页面控制器内存
		 * @function _cleanCtrl
		 * @private
		 * @param {Boolean} isCleanAll - 是否销毁所有的页面，如果为false，只销毁当前的页面
		 */
		_cleanCtrl: function (isCleanAll) {
			if (!isCleanAll)
				that._cleanScope(angular.element(that._getContainer().find("> div:last > div")[0]));
			else {
				var pages = that._getContainer().find("> div"),
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
		 * @function _urlChanged
		 * @private
		 * @param {Event} angularEvent - event对象
		 * @param {String} newUrl - 更改之后的url
		 * @param {String} oldUrl - 更改之前的url
		 */
		_urlChanged: function (angularEvent, newUrl, oldUrl) {
			var lastPage = that._getLastPage();

			if (!lastPage) {
				return;
			}

			var newHash = _location.hash(),
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
			_location.hash("");

			var startPageName = utils.getQueryString("p");
			if (startPageName) {
				that.show((_config.tplPath || "tpl/") + startPageName + ".html", { showType: 0 });
			}
			else if (_config.main) {
				that.show(_config.main, { showType: 0 });
			}
		},

		_getShowAniClass: function (options) {
			if (!_config.animate
				|| !_config.animate.show
				|| options.showType == 0
				|| options.style == "pop")
				return "";

			return ' class="' + _config.animate.show + '" ';
		},

		_getHideAniClass: function () {
			if (!_config.animate || !_config.animate.hide) return "";

			return ' class="' + _config.animate.hide + '" ';
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
			var page = '<div id="' + pageId + '" ng-include src="\'' + src + '?temp=' + Math.random() + '\'"';
			//page += that._getShowAniClass(options);
			page += "></div>";

			page = _compile(page)(_scope);

			var pageObj = {
				id: pageId,
				hash: (options.showType == 0) ? "" : pageId,
				scrollTop: 0,
				param: options.param,
				title: options.title,
				style: options.style,
				src: src
			};

			that._attachEvent(pageObj);

			if (options.showType == 0) {
				that._cleanCtrl(true);
				that._pageList = [pageObj];
			} else {
				that._pageList.push(pageObj);
			}

			return page;
		},

		/**
		 * 在页面对象中添加on和exec函数
		 * @function _attachEvent
		 * @private
		 * @param {Object} pageObj - 页面对象
		 */
		_attachEvent: function (pageObj) {
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
			_container || (_container = $(_config.container || "body"));
			return _container;
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
				that._readyFnList[i](_scope);
			}
		},

		/**
		 * 构建自定义指令
		 * @function _buildDirective
		 * @private
		 */
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