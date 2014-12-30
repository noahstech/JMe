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