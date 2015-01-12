##JMe描述

`JMe`是一款基于[jQuery](http://jquery.com/) , [AngularJS](https://angularjs.org/)为基础的单页面网站框架库

##核心方法

	me.define(...);//定义页面
	me.page(...);//获取当前显示页面对象
	me.show(...);//显示新页面
	me.on(...);//注册事件
	me.hide(...);//隐藏页面
	me.trigger(...);//触发事件

具体方法介绍请直接查看`me.js`中注释，详细的API介绍稍后会展示给大家

##使用方法

1.页面必须引用[jQuery](http://jquery.com/) ,[AngularJS](https://angularjs.org/) ，以及`me.js`

2.创建框架页面`index.html`，并在html标签中添加id&ng-app属性 

    <html xmlns:ng="http://angularjs.org" id="ng-app" ng-app="meApp"> 

3.页面底部添加Javascript代码（确保所有script和dom都加载完成） 后面的ngSanitize参数是第三方插件，这里不解释了。

	me.run('meApp', [/* angular插件 */]);

4.在页面标签中添加controller，一般添加在body上，如下设置后，意味着me将接管该标签

	<body ng-controller="me.ctrl">
		<div id="main_body"></div>
	</body>

5.配置`me.config.js`

	me.config({
		container: "#main_body",
		main: "tpl/content.html",
		path: "tpl/"
	});

6.配置`me.global.js`

	me.ready(function () {
		me.global({
			key: "value",

			methodName: functino() {
				// ...
			},

			// ...其他全局函数或属性
		});
	});

调用全局属性或函数

	me.global.key

或者

	me.global.methodName()

在html里，可以这样

	global.methodName()

7.编写内容页面`content.html`

	<div ng-controller="ControllerName.ctrl">
		Hello {{o}} !
	</div>


8.编写内容控制器`contentCtrl.js`

	(function(){
		var that = me.define("ControllerName",{

			//ctrl方法必须实现；相应控制器页面加载后调用
			ctrl:function(){
				//...
				that.init();
			},
			init:function(){
				//...
				that.$scope.o = "world";
			}
		})
	})()
	

9.打开浏览器可以看到如下内容

`Hello world!`

##结束语

`JMe`是完全开源的项目，欢迎大家来拍砖，多提提意见。有什么好的意见可以留言给我们。如果大家对`JMe`感兴趣的话,也可以加QQ群（群号：4615680）
