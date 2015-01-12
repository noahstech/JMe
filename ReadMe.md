##JMe描述

基于[AngularJS](https://angularjs.org/)的前端框架，目的是为了提高前端开发的效率，适用于任何前端项目

##使用方法

1.页面必须引用[jQuery](http://jquery.com/) ,[AngularJS](https://angularjs.org/) ，以及`me.js`

2.创建主页面`index.html`

    <html xmlns:ng="http://angularjs.org" id="ng-app" ng-app="meApp">
		<head>
			<title>me 测试页面</title>
			<script src="js/jquery-2.0.2.min.js"></script>
			<script src="js/angular1.3.8.min.js"></script>
			<script src="js/me-1.0.js"></script>
			<script src="js-ctrl/a.js"></script>
			<script src="js-ctrl/b.js"></script>

			<script>
				me.config({
					container: "#me_body",
					main: "tpl/a.html" // 默认加载a.html
				});
			</script>
		</head>
		<body ng-controller="me.ctrl">
			<div id="me_body"></div>
		</body>
	</html>
	<script>me.run("meApp", []);</script>

3.创建子页面`tpl/a.html`

	<div ng-controller="a.ctrl">
		<h1>这是a页面</h1>
		<button ng-click="showB()">打开b页面</button>
	</div>

4.创建子页面a的控制器`js-ctrl/a.js`

	me.define("a",{
		ctrl: function(){
			// a初始化函数
		},

		showB: function(){
			me.show("tpl/b.html", {
				showType: 1
			});
		}
	});

5.创建子页面`tpl/b.html`

	<div ng-controller="b.ctrl">
		<h1>这是b页面</h1>
		<button ng-click="hide()">返回a页面</button>
	</div>

6.创建子页面b的控制器'js-ctrl/b.js'

	me.define("b",{
		ctrl: function(){
			// b初始化函数
		}
	});

##结束语

`JMe`是完全开源的项目，欢迎大家来拍砖，多提提意见。有什么好的意见可以留言给我们。如果大家对`JMe`感兴趣的话,也可以加QQ群（群号：4615680）
