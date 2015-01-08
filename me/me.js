/**
 * 魔法师
 * @module me
 * @namespace me
 * @version 1.0
 */
;var me = function (src, options) {
	me.show(src, options);
};

/*
 * @module utils
 * @memberof me
 */
(function ($) {
	var isIOS = !!navigator.userAgent.match(/(i[^;]+\;(U;)? CPU.+Mac OS X)/);

	$.utils = {
		setTitle: function (title) {
			document.title = title;
			if (!isIOS) return;

			var iframe = jQuery('<iframe src="/favicon.ico" style="display:none;"></iframe>').on('load', function () {
				setTimeout(function () {
					iframe.off('load').remove();
				}, 0)
			}).appendTo(jQuery('body'))
		},

		getQueryString: function (name) {
			var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
			var r = window.location.search.substr(1).match(reg);
			if (r != null) return unescape(r[2]);
			return "";
		},

		endWith: function (str, end) {
			var reg = new RegExp(end + "$");
			return reg.test(str);
		},

		startWith: function (str, start) {
			return str.indexOf(start) == 0;
		},

		extend: function (obj, newObj) {
			for (var i in newObj) {
				obj[i] = newObj[i];
			}
		}
	}
})(me);

/*
 * angular入口函数
 */
(function ($) {
	$.utils.extend($, {
		ctrl: function ($rootScope, $scope, $compile, $location, $http) {
			$.ngobj = {
				$rootScope: $rootScope,
				$scope: $scope,
				$compile: $compile,
				$location: $location,
				$http: $http
			};

			$._method._triggerReadyFn();
			$rootScope.$on('$locationChangeSuccess', $._method._urlChanged);

			$scope.show = $.show;
			$scope.hide = $.hide;

			$._method._init();
		}
	});
})(me);

/*
 * 公共接口
 */
(function ($) {
	$.utils.extend($, {
		/**
		 * 请求网络数据
		 * @function ajax
		 * @memberof me
		 * @param {Object} option - 请求参数
		 * @property {String} method - post或者get
		 * @property {String} url - 请求的http链接
		 * @property {Object} data - post请求时的参数，json格式
		 * @param {function} success - 成功回调函数
		 * @param {function} failure - 失败回调函数
	     * @param {function} before - 调用前准备函数
		 */
		ajax: function (option, success, failure, before) {
			if (before && typeof (before) == 'function') before();

			$.ngobj.$http(option).success(function (data) {
				if (typeof success == 'function') success(data);
			}).error(function (msg, status) {
				console.log('me ajax callback error | msg=' + msg + '\r\n\tstatus=' + status);
				if (typeof failure == 'function') failure(msg, status);
			});
		},

		/**
		 * 配置me
		 * @function config
		 * @memberof me
		 * @param {Object} cf - 配置参数
		 * @property {String} main - 默认打开的页面
		 * @property {String} container - 根元素的jQuery选择器
		 * @property {String} hideSelector - 当showType = 1 打开页面的时候，需要隐藏的元素选择器，返回到一级页面时，会重新显示
		 * @property {String} path - 模板所在的路径，默认为tpl/
		 * @property {Object} route - 路由配置表，key-value形式，配置后可以在me.show的时候传入key寻找页面
		 */
		config: function (cf) {
			$._param.config = cf
		},

		plugins: function (pluginMap) {

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
		 * @memberof me
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
				var scope = $.ngobj.$scope;

				$.global[key] = value;
				scope.global || (scope.global = {});
				scope.global[key] = value;
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
		 * @function directive
		 * @memberof me
		 * @param {String} tagName - 指令名称
		 * @param {Function} fn - 指令构造函数，参考angular.directive
		 */
		directive: function (tagName, fn) {
			if (typeof fn != "function") return;

			$._param.directiveList.push({
				tagName: tagName,
				fn: fn
			});
		},

		/**
		 * 启动angular
		 * @function run
		 * @memberof me
		 * @param {String} appName - 应用程序名称
		 * @param {Array} plugins - 插件列表
		 */
		run: function (appName, plugins) {
			$._param.module = angular.module(appName, plugins);
			$._method._appendCtrl("me", $.ctrl);
			$._method._buildCtrl();
			$._method._buildDirective();
		},

		/**
		 * 注入me稳定后需要执行的函数
		 * @function ready
		 * @memberof me
		 * @param {Function} fn - me稳定后执行的函数
		 */
		ready: function (fn) {
			if (typeof fn != "function") return;

			$._param.readyFnList.push(fn);
		},

		/**
		 * 显示一个页面
		 * @function show
		 * @memberof me
		 * @param {String} src - 页面src
		 * @param {Object} options - 参数
		 * @property {Number} showType - 页面类型，0：一级页面 1：非一级页面
		 * @property {Object} param - 传递的参数参数
		 * @property {String} title - 页面标题
		 * @property {Boolean} refresh - 是否立即渲染ui
		 * @property {String} style - null: 填充（默认） 'pop'：弹出层
		 */
		show: function (src, options) {
			$._method._log(src, options);
			$._method._setTitle(options);

			var lastPage = $._method._getLastPage(),
				html = $._method._getPageHtml(src, options),
                container = $._method._getContainer(),
				newPage = $._method._getLastPage(),
                hideSelector = $._param.config.hideSelector;

			if (options.showType == 0) {
				container.html(html);
				hideSelector && jQuery(hideSelector).show();
			} else {
				lastPage && (lastPage.scrollTop = jQuery(document).scrollTop());

				container.append(html);
				newPage.style == "pop" || (lastPage && (jQuery("#" + lastPage.id).hide()));

				$.ngobj.$location.hash(newPage.hash)
				hideSelector && jQuery(hideSelector).hide();
			}

			options.refresh && $.ngobj.$scope.$apply();

			return newPage;
		},

		/**
		 * 关闭页面，如果只剩下一个页面，则不会有任何动作
		 * @function hide
		 * @memberof me
		 * @param {Object} params - 这里的参数将会被传入页面hide事件中
		 * @param {Number} layer - 关闭的层级，默认为1，表示关闭当前页面，如果大于1，则往上关闭相应的页面
		 */
		hide: function (params, layer) {
			if ($._param.pageList.length <= 0) {
				return;
			}

			$._param.hideParam = params;
			$._param.hideLayer = layer || 1;

			$._method._triggerHide();
		},

		/**
		 * 设置页面进入和离去动画，该配置作用于showType=1的情况
		 * @function animate
		 * @memberof me
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
		 * @memberof me
		 */
		param: function () {
			return $.page().param;
		},

		/**
		 * 执行顶层页面注册的事件
		 * @function trigger
		 * @memberof me
		 * @param {String} ename - 事件名称
		 * @param {Arguments} args - 传递的参数，多个参数逗号分隔
		 */
		trigger: function (ename, args) {
			var page = $.page();
			page.exec.apply(page, arguments);
		},

		/**
		 * 获取顶层的页面对象
		 * @function page
		 * @memberof me
		 */
		page: function () {
			return $._method._getLastPage();
		},

		/**
		 * 定义controller
		 * @function define
		 * @memberof me
		 * @param {String} ctrlName - controller名称
		 * @param {Object} fnList - 接口列表
		 */
		define: function (ctrlName, fnList) {
			return $.require(ctrlName, fnList);
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

			$._method._appendCtrl(ctrlName, window[ctrlName].ctrl);
			return window[ctrlName];
		}
	});
})(me);

/*
 * 私有变量
 */
(function ($) {
	$._param = {
		ctrlList: [],
		hideLayer: 0,
		pageList: [],
		hideParam: null,
		config: {},
		container: null,
		readyFnList: [],
		directiveList: [],
		module: null
	};
})(me);

/*
 * 私有函数
 * @module _method
 * @memberof me
 * @private
 */
(function ($) {
	$._method = {
		/**
		 * 构建controller
		 * @function _buildCtrl
		 */
		_buildCtrl: function () {
			for (var i = 0; i < $._param.ctrlList.length; i++) {
				var ctrl = $._param.ctrlList[i];

				$._param.module.controller(ctrl.name + ".ctrl", ctrl.fn);
			}
		},

		/**
		 * 存储controller列表
		 * @function _appendCtrl
		 * @param {String} ctrlName - controller名称
		 * @param {Function} fn - 入口函数
		 */
		_appendCtrl: function (ctrlName, fn) {
			if (angular.version.minor < 3) return;

			$._param.ctrlList.push({
				name: ctrlName,
				fn: fn
			});
		},

		/**
		 * 处理页面进入和离去动画
		 * @function _handleAnimate
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
		 */
		_triggerHide: function () {
			if ($._param.hideLayer <= 0) return;

			$._param.hideLayer--;
			history.go(-1);
		},

		/**
		 * 获取顶层页面对象
		 * @function _getLastPage
		 * @param {Boolean} isRemove - 获取后是否从队列中删除
		 */
		_getLastPage: function (isRemove) {
			if ($._param.pageList.length > 0) {
				var pageList = $._param.pageList;
				return isRemove ? pageList.pop() : pageList[pageList.length - 1];
			}
		},

		/**
		 * 删除顶层页面
		 * @function _hidePage
		 */
		_hidePage: function () {
			if ($._param.pageList.length <= 0) return;

			// 删掉当前页面
			var curPageObj = $._method._getLastPage(true);
			$._method._cleanCtrl();

			// 触发hide事件
			$._method._triggerEvent(curPageObj, "hide", $._param._hideParam ? [$._param._hideParam] : null);
			$._param._hideParam = null;

			jQuery("#" + curPageObj.id).remove();

			// 显示上一个页面
			var lastPage = $._method._getLastPage();
			if (lastPage) {
				$.ngobj.$location.hash(lastPage.hash);
				jQuery("#" + lastPage.id).show();
				$._method._setTitle(lastPage);

				$.ngobj.$scope.$$postDigest(function () {
					window.scrollTo(0, lastPage.scrollTop);
				});
			}

			// 显示被隐藏的元素
			if ($._param.config.hideSelector && $._param.pageList.length == 1) {
				jQuery($._param.config.hideSelector).show();
			}

			$._method._triggerHide();
		},

		/**
		 * 准备销毁页面控制器内存
		 * @function _cleanCtrl
		 * @param {Boolean} isCleanAll - 是否销毁所有的页面，如果为false，只销毁当前的页面
		 */
		_cleanCtrl: function (isCleanAll) {
			if (!isCleanAll)
				$._method._cleanScope(angular.element($._method._getContainer().find("> div:last > div")[0]));
			else {
				var pages = $._method._getContainer().find("> div"),
                    angularEl;
				for (var i = 0; i < pages.length; i++) {
					angularEl = angular.element(pages.eq(i).find("> div")[0]);
					$._method._cleanScope(angularEl);
				}
			}
		},

		/**
		 * 销毁某个angular控制器
		 * @function _cleanScope
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
		 * @param {Event} angularEvent - event对象
		 * @param {String} newUrl - 更改之后的url
		 * @param {String} oldUrl - 更改之前的url
		 */
		_urlChanged: function (angularEvent, newUrl, oldUrl) {
			var lastPage = $._method._getLastPage();

			if (!lastPage) {
				return;
			}

			var newHash = $.ngobj.$location.hash(),
                oldHash = lastPage.hash;

			if (newHash == oldHash) {
				return;
			}

			$._method._hidePage();
		},

		/**
		 * 在ctrl主入口中调用的初始化方法
		 * @function _init
		 */
		_init: function () {
			$.ngobj.$location.hash("");

			var startPageName = $.utils.getQueryString("p");
			if (startPageName) {
				$.show(startPageName, { showType: 0 });
			}
			else if ($._param.config.main) {
				$.show($._param.config.main, { showType: 0 });
			}
		},

		_getShowAniClass: function (options) {
			if (!$._param.config.animate
				|| !$._param.config.animate.show
				|| options.showType == 0
				|| options.style == "pop")
				return "";

			return ' class="' + $._param.config.animate.show + '" ';
		},

		_getHideAniClass: function () {
			if (!$._param.config.animate || !$._param.config.animate.hide) return "";

			return ' class="' + $._param.config.animate.hide + '" ';
		},

		/**
		 * 获取即将打开的页面html对象
		 * @function _getPageHtml
		 * @param {String} src - me.show中传入的src
		 * @param {Object} options - me.show中传入的options对象
		 */
		_getPageHtml: function (src, options) {
			var pageId = "id" + Math.random().toString().substring(2);
			var page = '<div id="' + pageId + '" ng-include src="\'' + $._method._getTplSrc(src) + '?temp=' + Math.random() + '\'"';
			//page += that._getShowAniClass(options);
			page += "></div>";

			page = $.ngobj.$compile(page)($.ngobj.$scope);

			var pageObj = {
				id: pageId,
				hash: (options.showType == 0) ? "" : pageId,
				scrollTop: 0,
				param: options.param,
				title: options.title,
				style: options.style,
				src: src
			};

			$._method._attachEvent(pageObj);

			if (options.showType == 0) {
				$._method._cleanCtrl(true);
				$._param.pageList = [pageObj];
			} else {
				$._param.pageList.push(pageObj);
			}

			return page;
		},

		/**
		 * 获取模板路径
		 * @function _getTplSrc
		 * @param {String} src - route名称 | 相对路径 | 绝对路径
		 */
		_getTplSrc: function (src) {
			var config = $._param.config;
			if (config.route && config.route[src])
				return config.route[src];

			config.path = config.path || "tpl/";

			if (!$.utils.startWith(src, config.path)) {
				src = config.path + src;
			}

			if (!$.utils.endWith(src, ".html")) {
				src += ".html";
			}

			return src;
		},

		/**
		 * 在页面对象中添加on和exec函数
		 * @function _attachEvent
		 * @param {Object} pageObj - 页面对象
		 */
		_attachEvent: function (pageObj) {
			pageObj.on = function (ename, callback) {
				if (typeof (callback) != "function") return;
				this._eventMap || (this._eventMap = {});
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

				$._method._triggerEvent(this, ename, args);
				return this;
			}
		},

		/**
		 * 触发页面的事件
		 * @function _triggerEvent
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
		 */
		_getContainer: function () {
			$._param.container || ($._param.container = jQuery($._param.config.container || "body"));
			return $._param.container;
		},

		/**
		 * me.show页面时，在控制台打印的数据
		 * @function _log
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
		 */
		_triggerReadyFn: function () {
			if ($._param.readyFnList.length == 0) return;

			for (var i = 0; i < $._param.readyFnList.length; i++) {
				$._param.readyFnList[i]($.ngobj.$scope);
			}
		},

		/**
		 * 构建自定义指令
		 * @function _buildDirective
		 */
		_buildDirective: function () {
			var dirs = $._param.directiveList;
			for (var i = 0; i < dirs.length; i++) {
				$._param.module.directive(dirs[i].tagName, dirs[i].fn);
			}
		},

		/**
		 * 设置新打开的页面标题
		 * @function _setTitle
		 * @param {String} options - me.show的时候传入的options
		 */
		_setTitle: function (options) {
			if (!options.title) {
				options.title = document.title;
				return;
			}

			$.utils.setTitle(options.title);
		}
	};
})(me);