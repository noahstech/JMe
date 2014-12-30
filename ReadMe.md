##JMe描述##

`JMe`是一款基于[jQuery](http://jquery.com/) , [AngularJS](https://angularjs.org/)为基础的单页面网站框架库

##核心方法##

	me.define(...);
	me.page(...);
	me.show(...);
	me.on(...);
	me.hide(...);
	me.trigger(...);

具体方法介绍请直接查看`me.js`中注释，详细的API介绍稍后会展示给大家

##使用方法##

1.页面必须引用[jQuery](http://jquery.com/) ,[AngularJS](https://angularjs.org/) ，以及`me.js`

2.创建框架页面`index.html`，并在html标签中添加id&ng-app属性 

    <html xmlns:ng="http://angularjs.org" id="ng-app" ng-app="AngularApp"> 

3.页面底部添加Javascript代码（确保所有script和dom都加载完成） 后面的ngSanitize参数是第三方插件，这里不解释了。

	me.run('AngularApp', ['ngSanitize']);

4.在页面body标签中添加controller

	<body ng-controller="me.ctrl"></body>

5.配置`me.config.js` 

	me.config({
		container: "#main_body",
		main: "tpl/content.html"
	});

6.配置`me.global.js`

	me.ready(function () {
		me.$scope.globalData = {};
		me.$scope.globalMethod = {};
	});

7.编写内容页面`content.html`

	<div ng-controller="ControllerName.ctrl">
		Hello {{o}} !
	</div>


8.编写内容控制器`contentCtrl.js`

	(function(){
		var that = me.define("ControllerName",{
			ctrl:function(){//ctrl方法必须实现；相应控制器页面加载后调用
				//...
				that.init();
			},
			init:function(){
				//...
				that.$scope.o = "world";
			}
		})
	})()
	

9.我们可以打开浏览器查看了！


##结束语##

`JMe`是完全开源的项目，欢迎大家来拍砖，多提提意见。有什么好的意见可以留言给我们。