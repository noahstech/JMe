var NumberInput = (function () {
    var obj = function (el, options) {
        this.options = options || {
            inputId: "", // 关联的input的id
            onChanged: function () { } // input的value改变之后的事件
        };

        this.container = typeof el == "string" ? document.querySelector(el) : el;
        if (this.options.inputId) {
        	this.input = document.querySelector(this.options.inputId);
        	this.value = this.input.value;
        } else {
        	this.value = "";
        }

        this._generateStyle();
        this._init();
    }

    obj.prototype = {
        handleEvent: function (e) {
            var btn = e.srcElement;

            switch (btn.className) {
                case "numberinput_num":
                	this.value += btn.innerHTML;
                	if (this.options.onChanged) this.options.onChanged(this.value);
                	this._setInputValue();
                    break;
                case "numberinput_btn":
                    var flag = btn.attributes["flag"].value;
                    if (flag == 0) {
                    	this.value = "";
                    } else {
                        if (this.value != "") {
                            this.value = this.value.substring(0, this.value.length - 1);
                        }
                    }
                    if (this.options.onChanged) this.options.onChanged(this.value);
                    this._setInputValue();
                    break;
            }
        },

        _setInputValue: function () {
        	this.input && (this.input.value = this.value);
        },

        _init: function () {
            var html = "<table class='numberinput_table'>";
            html += "<tr>";
            html += "<td class='numberinput_num'>1</td>";
            html += "<td class='numberinput_num'>2</td>";
            html += "<td class='numberinput_num'>3</td>";
            html += "</tr>";
            html += "<tr>";
            html += "<td class='numberinput_num'>4</td>";
            html += "<td class='numberinput_num'>5</td>";
            html += "<td class='numberinput_num'>6</td>";
            html += "</tr>";
            html += "<tr>";
            html += "<td class='numberinput_num'>7</td>";
            html += "<td class='numberinput_num'>8</td>";
            html += "<td class='numberinput_num'>9</td>";
            html += "</tr>";
            html += "<tr>";
            html += "<td class='numberinput_btn' flag='0'>清除</td>";
            html += "<td class='numberinput_num'>0</td>";
            html += "<td class='numberinput_btn' flag='1'>退格</td>";
            html += "</tr>";
            html += "</table>";
            this.container.innerHTML = html;
            this.table = this.container.querySelector(".numberinput_table");
            this.table.addEventListener("click",this);
        },

        _generateStyle: function () {
            var styleId = "numberinput_style";
            if (document.getElementById(styleId)) {
                return;
            }

            var cssObj = {
                numberinput_container: {
                    
                }
            };

            var str_css = ".numberinput_table{border-spacing:3px;background-color:white;-webkit-user-select:none;cursor:default;}"
                + ".numberinput_table td{background-color:#dee7f5;width:100px;height:75px;text-align:center;font-size:30px;}"
                + ".numberinput_table td:not(.numberinput_btn):hover{background-color:#0190dc;color:white;}"
                + ".numberinput_table td:not(.numberinput_btn):active{background-color:#0085cc;}"
                + ".numberinput_btn{background-color:#1bbc9d !important;color:white !important; font-size:24px !important;}"
                + ".numberinput_btn:hover{background-color:#16ac8f !important;}"
                + ".numberinput_btn:active{background-color:#119e83 !important;}";
            for (var i in cssObj) {
                str_css += "." + i + "{";
                for (var j in cssObj[i]) {
                    str_css += j + ":" + cssObj[i][j] + ";";
                }
                str_css += "}";
            }

            var style = document.createElement("style");
            style.id = styleId;
            style.type = "text/css";
            style.innerHTML = str_css;
            document.getElementsByTagName("HEAD").item(0).appendChild(style);
        }
    };

    return obj;
})();
/**
 * 数字键盘
 */
me.directive("mNuminput", function () {
	return {
		restrict: "EA",
		replace: true,
		require: "?ngModel",
		template: '<div></div>',
		link: function (scope, element, attrs, ngModel) {
			if (!ngModel) return;

			ngModel.$render = function () {
				
			};

			new NumberInput(element[0], {
				onChanged: function (value) {
					scope.$apply(function () {
						ngModel.$setViewValue(value);
					});
				}
			});
		}
	}
});

