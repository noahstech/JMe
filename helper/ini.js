var ini = (function () {
	var fileName = "config.ini",
		fs = require("fs");
	var obj = function () { }

	obj.prototype = {
		set: function (key, value, callback) {
			var cf = this._readFile();
			cf[key] = value;

			fs.writeFile(fileName, JSON.stringify(cf), function (err) {
				if (err) throw err;

				if (typeof callback == "function") callback();
			});
		},

		get: function (key) {
			var cf = this._readFile();
			return cf[key];
		},

		_readFile: function () {
			if (!fs.existsSync(fileName)) {
				fs.writeFile(fileName, '{}', function (err) {
					if (err) throw err;
				});
				return {};
			}

			var str = fs.readFileSync(fileName);
			try {
				return JSON.parse(str);
			} catch (e) {
				return {};
			}
		}
	}

	return new obj();
})();