var Upgrade = (function () {
	var that;
	var obj = function () {
		that = this;
		that.http = require('http');
		that.fs = require("fs");

		that._style("progress_bar_style", ".progress_container{color:#404040;background-color:rgba(42,42,42,1);position:fixed;top:0;left:0;width:100%;height:100%}.progress{position:absolute;top:50%;left:50%;-webkit-transform:translate(-50%,-50%);width:300px;text-align:center;padding:4px;background:rgba(0, 0, 0, 0.25);border-radius:6px;-webkit-box-shadow:inset 0 1px 2px rgba(0, 0, 0, 0.25), 0 1px rgba(255, 255, 255, 0.08);box-shadow:inset 0 1px 2px rgba(0, 0, 0, 0.25), 0 1px rgba(255, 255, 255, 0.08)}.progress-bar{position:relative;height:16px;border-radius:4px;-webkit-transition:0.4s linear;-moz-transition:0.4s linear;-o-transition:0.4s linear;transition:0.4s linear;-webkit-transition-property:width, background-color;-moz-transition-property:width, background-color;-o-transition-property:width, background-color;transition-property:width, background-color;-webkit-box-shadow:0 0 1px 1px rgba(0, 0, 0, 0.25), inset 0 1px rgba(255, 255, 255, 0.1);box-shadow:0 0 1px 1px rgba(0, 0, 0, 0.25), inset 0 1px rgba(255, 255, 255, 0.1)}.progress-bar:before, .progress-bar:after{content:'';position:absolute;top:0;left:0;right:0}.progress-bar:before{bottom:0;background:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAJ0lEQVR42mXMsQkAAAzDMH+S/69M6VAoeAgGDQFIW/4QQARbwaF+B3+SPGAo8blgAAAAAElFTkSuQmCC) 0 0 repeat;border-radius:4px 4px 0 0}.progress-bar:after{z-index:2;bottom:45%;border-radius:4px;background-image:-webkit-linear-gradient(top, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.05));background-image:-moz-linear-gradient(top, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.05));background-image:-o-linear-gradient(top, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.05));background-image:linear-gradient(to bottom, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.05))}.progress-bar-text{position:absolute;top:-30px;display:inline-block;padding:3px 8px;color:#fff;text-shadow:0 1px black;border-radius:3px;cursor:pointer;background:rgba(0, 0, 0, 0.25);left:50%;-webkit-transform:translateX(-50%)}");
	};

	obj.prototype = {
		check: function (api, callback) {
			if (!api) {
				callback && callback(false);
				return;
			}

			that.http.get(api, function (res) {
				var data = "";
				res.on("data", function (chunk) {
					data += chunk;
				});

				res.on("end", function () {
					var serverApp = eval("(" + data + ")"),
						curVersion = that.getCurVersion(serverApp.version);

					callback && callback(serverApp.version != curVersion, serverApp);
				}).on('error', function (e) {
					callback && callback(false);
				});
			});
		},

		get: function (api, callback) {
			if (!api) {
				callback && callback();
				return;
			}

			try {
				that.check(api, function (needUpdate, server) {
					if (!needUpdate) {
						callback && callback();
						return;
					}

					var regFirst = /^(\d+)\.\d*$/,
						regMiddle = /^\d+\.(\d+)$/,
						clientVersion = that.getCurVersion(),
						serverVersion = server.version,
						cv = [regFirst.exec(clientVersion)[1], regMiddle.exec(clientVersion)[1]],
						sv = [regFirst.exec(serverVersion)[1], regMiddle.exec(clientVersion)[1]];
					if (sv[0] != cv[0]) {
						// 下载exe重新安装
						server.exe && that._downloadExe(server.exe);
					} else {
						server.file && that._downloadZip(server.file, server.version, server.file_md5);
					}
				});
			} catch (e) {
				callback && callback();
				console.log(e);
			}
		},

		getCurVersion: function (serverVersion) {
			var curVersion = localStorage["version"];
			if (!curVersion) {
				curVersion = require('nw.gui').App.manifest.version;
				localStorage["version"] = curVersion;
			}

			return curVersion;
		},
		 
		_downloadZip: function (filePath, newVersion, md5) {
			Util.showLoading();
			Util.info("有新版本，正在更新...");
			var fileName = filePath.substring(filePath.lastIndexOf("/") + 1);
			var file = that.fs.createWriteStream(fileName);
			that.http.get(filePath, function (response) {
				response.pipe(file);

				response.on('end', function () {
					if (md5 && !that.checkMd5(fileName, md5)) {
						that._downloadZip(filePath, newVersion, md5);
					} else {
						that._unzip(fileName);
						localStorage["version"] = newVersion;
						Util.hideLoading();
						Util.info("更新成功", true);
						that.fs.unlink(fileName);
						location.reload(true);
					}
				});
			});
		},

		checkMd5: function (filePath, md5) {
			var crypto = require('crypto');
			var localMd5 = crypto.createHash('md5').update(that.fs.readFileSync(filePath)).digest('hex');
			return localMd5 == md5;
		},

		_downloadExe: function (filePath) {
			var container = document.createElement("div");
			container.className = "progress_container";
			container.innerHTML = '<div class="progress"><div class="progress-bar-text"></div><div class="progress-bar"></div></div>';
			document.body.appendChild(container);

			var elJindu = document.querySelector(".progress-bar-text"),
				progressbar = document.querySelector(".progress-bar");

			var fileName = filePath.substring(filePath.lastIndexOf("/") + 1),
				file = that.fs.createWriteStream(fileName);
			that.http.get(filePath, function (res) {
				res.pipe(file);
				var len = parseInt(res.headers['content-length'], 10);

				var downloadSize = 0;
				res.on('data', function (chunk) {
					downloadSize += chunk.length;

					var percent = Math.round((downloadSize / len) * 100);
					elJindu.innerHTML = percent + "%";
					progressbar.style.width = percent + "%";

					if (percent < 5) {
						progressbar.style.backgroundColor = "#f63a0f";
					} else if (percent < 25) {
						progressbar.style.backgroundColor = "#F27011";
					} else if (percent < 50) {
						progressbar.style.backgroundColor = "#f2b01e";
					} else if (percent < 75) {
						progressbar.style.backgroundColor = "#f2d31b";
					} else {
						progressbar.style.backgroundColor = "#86e01e";
					}
				});

				res.on('end', function () {
					require('child_process').exec(fileName);

					setTimeout(function () {
						var gui = require('nw.gui');
						gui.Window.get().close();
					}, 2000);
				});
			});
		},

		_unzip: function (fileName) {
			var adm_zip = require('adm-zip');
			var unzip = new adm_zip(fileName);
			unzip.extractAllTo("./", true);
		},

		_style: function (styleId, cssObj) {
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

	return new obj();
})();