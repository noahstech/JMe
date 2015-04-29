/**
 * 拼图
 * @module Jigsaw
 * @author 304854360@qq.com
 * @namespace Jigsaw
 * @version 1.0
 *
 * @param {Element} container - 拼图容器
 * @param {Object} options - 参数
 * @property {Array} images - 瓦片的图像链接集合 如：["1.jpg", "2.jpg", ...]
 * @property {Number} column - 拼图列数，设置为3意味着拼图为3x3的形式
 * @property {Number} [space=3] - 瓦片之间的间隔，单位像素
 * @property {Number} [speed=800] - 瓦片交换的速度，单位毫秒
 * @param {Function} success - 拼图成功后的回调
 */
var Jigsaw = function (container, options, success) {
	return new Jigsaw.viewer(container, options, success);
};

/**
 * @module utils
 * @memberof Jigsaw
 */
(function (m) {
	m.utils = {
		startWith: function (str, start) {
			return str.indexOf(start) == 0;
		},

		each: function (array, fn) {
			if (!(array instanceof Array)) return;

			for (var i = 0; i < array.length; i++) {
				fn.call(this, array[i], i);
			}
		},

		random: function (array, sort) {
			if (!(array instanceof Array)) return;
			
			if (sort) {
				var arr = [];
				this.each(sort, function(s){
					arr.push(array[parseFloat(s)]);
				});
				return arr;
			} else {
				var copy = array.slice(0);
				copy.sort(function () { return 0.5 - Math.random() });
				return copy;
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
})(Jigsaw);

/**
 * @module viewer
 * @memberof Jigsaw
 */
(function (m) {
	var touchevent = navigator.userAgent.indexOf("Windows NT") >= 0 ? "click" : "touchstart";

	m.viewer = function (container, options, success) {
		this.images = options.images;
		this.column = options.column;
		this.space = options.space || 3;
		this.speed = options.speed || 800;
		this.sort = options.sort;
		
		this.container = typeof container == "string" ? document.querySelector(container) : container;
		this.tiles = [];
		this.process = [];
		this.success = success;

		this._style();
		this._init();
	}

	m.viewer.prototype = {
		_init: function () {
			this.container.className = "jigsaw_main";
			this.container.innerHTML = "";

			var randomImages = m.utils.random(this.images, this.sort);
			this.randomImages = randomImages;
			m.utils.each.call(this, randomImages, function (imgSrc, index) {
				var tile = new Image();
				tile.src = imgSrc;
				tile.className = "jigsaw_tile";
				tile.setAttribute("index", index);

				this._attachEvent(tile);
				this.container.appendChild(tile);
				this.tiles.push(tile);
				
				if ((index + 1) % this.column == 0) {
					this._addBreak();
				}

				// if (index == Math.floor(randomImages.length / 2)) {
					// $(tile).addClass("selected");
					// this.selected = $(tile);
				// }
			})
		},
		
		_getIndex: function(src){
			var reg = /\/(\d+)\.jpg/i;
			return reg.exec(src)[1];
		},
		
		_addBreak: function(){
			var div = document.createElement("div");
			div.className = "jigsaw_break";
			this.container.appendChild(div);
		},

		_attachEvent: function (tile) {
			var that = this;
			tile.addEventListener(touchevent, function () {
				var el = $(this);

				if (el.hasClass("selected")) {
					$(this).removeClass("selected");
					that.selected = null;
				} else {
					if (that.selected) {
						that.selected.removeClass("selected");
						_exchange.call(that, that.selected, el);
						that.selected = null;
					} else {
						$(this).addClass("selected");
						that.selected = el;
					}
				}
			});
		},

		_tiletemp: function (tile) {
			var size = tile.getBoundingClientRect();

			var img = document.createElement("img");
			img.src = tile.src;
			img.style.cssText = "width:" + size.width + "px;height:" + size.height
				+ "px;left:" + size.left + "px;top:" + size.top + "px;";
			img.className = "jigsaw_temp";

			return {
				tile: img,
				pos: size
			};
		},

		_isend: function () {
			if (this.isend) return;

			var trueCount = 0;
			m.utils.each.call(this, this.tiles, function (tile, index) {
				var trueSrc = this.images[index];
				if (tile.src.indexOf(trueSrc) >= 0) trueCount++;
			})

			this.isend = trueCount == this.tiles.length;

			if (this.isend) {
				this.container.className += " jigsaw_success";
				this.success && this.success();
			}
		},

		_style: function () {
			var cwidth = this.container.getBoundingClientRect().width;

			m.utils.style("jigsaw_style", {
				".jigsaw_tile": {
					"float": "left",
					"margin-left": this.space + "px",
					"margin-top": this.space + "px",
					"-webkit-tap-highlight-color": "rgba(0,0,0,0)",
					"width": (cwidth - this.space) / this.column - this.space + "px"
				},

				".jigsaw_tile.selected": {
					"-webkit-animation": "jigsaw_selected_animate 1600ms ease-in forwards infinite",
					"box-shadow": "#f18e08 0 0 3px 2px"
				},

				".jigsaw_main": {
					"display": "inline-block"
				},

				"@-webkit-keyframes jigsaw_selected_animate": {
					"0%": "{opacity: 1;}",
					"50%": "{opacity: 0.6;}",
					"100%": "{opacity: 1;}",
				},
				
				".jigsaw_break": {
					"clear": "both"
				},

				".jigsaw_temp": {
					"position": "fixed",
					"-webkit-transition-duration": this.speed + "ms",
					"-webkit-transition-property": "-webkit-transform",
					"-webkit-transition-timing-function": "ease-out",
					"z-index": "10000000"
				},

				".jigsaw_hidden": {
					"visibility": "hidden",
					"opacity": "0"
				},

				".jigsaw_success": {
					"-webkit-animation": "jigsaw_success_animate 800ms ease-in forwards 2"
				},

				"@-webkit-keyframes jigsaw_success_animate": {
					"0%": "{opacity: 1;}",
					"50%": "{opacity: 0.6;}",
					"100%": "{opacity: 1;}",
				},
			})
		}
	};
	
	function _exchange(tile1, tile2) {
		tile1.addClass("jigsaw_hidden");
		tile2.addClass("jigsaw_hidden");
		
		this.process.push(
			parseFloat(tile1.attr("index")) + "," + parseFloat(tile2.attr("index"))
		);

		var that = this;

		var temp1 = that._tiletemp(tile1[0]),
			temp2 = that._tiletemp(tile2[0]);

		temp1.tile.addEventListener("webkitTransitionEnd", function () {
			tile2[0].src = this.src;
			tile2.removeClass("jigsaw_hidden");
			$(this).remove();
			that._isend();
		})

		temp2.tile.addEventListener("webkitTransitionEnd", function () {
			tile1[0].src = this.src;
			tile1.removeClass("jigsaw_hidden");
			$(this).remove();
			that._isend();
		})
		document.body.appendChild(temp1.tile);
		document.body.appendChild(temp2.tile);

		setTimeout(function () {
			temp1.tile.style.webkitTransform = "translate(" + (temp2.pos.left - temp1.pos.left)
				+ "px," + (temp2.pos.top - temp1.pos.top) + "px)";

			temp2.tile.style.webkitTransform = "translate(" + (temp1.pos.left - temp2.pos.left)
				+ "px," + (temp1.pos.top - temp2.pos.top) + "px)";
		});
	}
})(Jigsaw);
