/**
 * 菜单
 * @module Menu
 * @author 304854360@qq.com
 * @namespace Menu
 * @version 1.0
 */
var Menu = function () {
	return new Menu.wrap();
};

/**
 * @module utils
 * @memberof Menu
 */
(function (m) {
	m.utils = {
		startWith: function (str, start) {
			return str.indexOf(start) == 0;
		},

		each: function (array, fn) {
			for (var i = 0; i < array.length; i++) {
				fn.call(this, array[i], i);
			}
		},

		style: function (styleId, cssObj) {
			if (document.all && document.styleSheets[styleId]) return;
			if (document.getElementById(styleId)) return;

			var str_css = "";

			if (typeof cssObj == "object") {
				for (var i in cssObj) {
					str_css += i + "{";
					for (var j in cssObj[i]) {
						str_css += j;
						if (!this.startWith(i, "@")) str_css += ":";
						str_css += cssObj[i][j];
						if (!this.startWith(i, "@")) str_css += ";";
					}
					str_css += "}";
				}
			} else if (typeof cssObj == "string") {
				str_css = cssObj;
			} else {
				return;
			}

			if (document.all) {
				var ss = document.createStyleSheet();
				ss.owningElement.id = styleId;
				ss.cssText = str_css;
			} else {
				var style = document.createElement("style");
				style.id = styleId;
				style.type = "text/css";
				style.innerHTML = str_css;
				document.getElementsByTagName("HEAD").item(0).appendChild(style);
			}
		}
	};
})(Menu);

/**
 * @module wrap
 * @memberof Menu
 */
(function (m) {
	m.wrap = function () {
		this._buildStyle();
		this._clear();
		this._build();
	}

	m.wrap.prototype = {
		append: function (item) {
			if (!(item instanceof m.Item)) {
				throw new Error("item不是Menu.Item对象");
			}

			var that = this;
			item.li.addEventListener("click", function () {
				if (typeof item.click == "function") {
					item.click();
				}

				that._clear();
				that = null;
			});
			
			this.ul.appendChild(item.li);
		},

		popup: function (left, top) {
			document.body.appendChild(this.ul);

			left -= 10;
			top -= 10;
			var size = this.ul.getBoundingClientRect(),
				cssText = "";
			if (size.width + left > document.documentElement.clientWidth) {
				cssText += "right:5px;"
			} else {
				cssText += "left:" + left + "px;"
			}

			if (size.height + top > document.documentElement.clientHeight) {
				cssText += "bottom:5px;"
			} else {
				cssText += "top:" + top + "px;"
			}
			cssText += "opacity:1;";
			this.ul.style.cssText = cssText;
		},

		_build: function () {
			var ul = document.createElement("ul");
			ul.className = "_menu_container";

			var that = this;
			ul.addEventListener("mouseleave", function () {
				that._clear();
				that = null;
			});
			this.ul = ul;
		},

		_clear: function () {
			var menus = document.querySelectorAll("._menu_container");
			if (menus.length == 0) return;
			
			m.utils.each(menus, function (menu) {
				document.body.removeChild(menu);
			});
		},

		_buildStyle: function () {
			m.utils.style("menu_style", {
				"._menu_container": {
					"list-style": "none",
					"background-color": "white",
					"position": "fixed",
					"cursor": "default",
					"display": "inline-block",
					"box-shadow": "#000 1px 3px 9px",
					"opacity": "0",
					"z-index": 11,
					"list-style": "none",
					"padding": 0,
					"margin": 0
				},

				"._menu_item": {
					"line-height": "60px",
					"padding": "0 35px",
					"font-size": "14px",
					"color": "#2c2d31",
					"white-space": "nowrap",
					"min-width": "80px"
				},

				"._menu_item:hover": {
					"color": "#0097ec",
					"background-color": "#e5e9f2"
				}
			});
		}
	}
})(Menu);

/**
 * @module Item
 * @memberof Menu
 */
(function (m) {
	m.Item = function (options) {
		var label = options ? options.label : "";

		var li = document.createElement("li");
		li.innerHTML = label;
		li.className = "_menu_item";

		this.li = li;
	}
})(Menu);