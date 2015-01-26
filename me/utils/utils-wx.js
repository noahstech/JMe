(function () {
	var CryptoJS = CryptoJS || function (s, p) {
		var m = {}, l = m.lib = {}, n = function () { }, r = l.Base = { extend: function (b) { n.prototype = this; var h = new n; b && h.mixIn(b); h.hasOwnProperty("init") || (h.init = function () { h.$super.init.apply(this, arguments) }); h.init.prototype = h; h.$super = this; return h }, create: function () { var b = this.extend(); b.init.apply(b, arguments); return b }, init: function () { }, mixIn: function (b) { for (var h in b) b.hasOwnProperty(h) && (this[h] = b[h]); b.hasOwnProperty("toString") && (this.toString = b.toString) }, clone: function () { return this.init.prototype.extend(this) } },
		q = l.WordArray = r.extend({
			init: function (b, h) { b = this.words = b || []; this.sigBytes = h != p ? h : 4 * b.length }, toString: function (b) { return (b || t).stringify(this) }, concat: function (b) { var h = this.words, a = b.words, j = this.sigBytes; b = b.sigBytes; this.clamp(); if (j % 4) for (var g = 0; g < b; g++) h[j + g >>> 2] |= (a[g >>> 2] >>> 24 - 8 * (g % 4) & 255) << 24 - 8 * ((j + g) % 4); else if (65535 < a.length) for (g = 0; g < b; g += 4) h[j + g >>> 2] = a[g >>> 2]; else h.push.apply(h, a); this.sigBytes += b; return this }, clamp: function () {
				var b = this.words, h = this.sigBytes; b[h >>> 2] &= 4294967295 <<
				32 - 8 * (h % 4); b.length = s.ceil(h / 4)
			}, clone: function () { var b = r.clone.call(this); b.words = this.words.slice(0); return b }, random: function (b) { for (var h = [], a = 0; a < b; a += 4) h.push(4294967296 * s.random() | 0); return new q.init(h, b) }
		}), v = m.enc = {}, t = v.Hex = {
			stringify: function (b) { var a = b.words; b = b.sigBytes; for (var g = [], j = 0; j < b; j++) { var k = a[j >>> 2] >>> 24 - 8 * (j % 4) & 255; g.push((k >>> 4).toString(16)); g.push((k & 15).toString(16)) } return g.join("") }, parse: function (b) {
				for (var a = b.length, g = [], j = 0; j < a; j += 2) g[j >>> 3] |= parseInt(b.substr(j,
				2), 16) << 24 - 4 * (j % 8); return new q.init(g, a / 2)
			}
		}, a = v.Latin1 = { stringify: function (b) { var a = b.words; b = b.sigBytes; for (var g = [], j = 0; j < b; j++) g.push(String.fromCharCode(a[j >>> 2] >>> 24 - 8 * (j % 4) & 255)); return g.join("") }, parse: function (b) { for (var a = b.length, g = [], j = 0; j < a; j++) g[j >>> 2] |= (b.charCodeAt(j) & 255) << 24 - 8 * (j % 4); return new q.init(g, a) } }, u = v.Utf8 = { stringify: function (b) { try { return decodeURIComponent(escape(a.stringify(b))) } catch (g) { throw Error("Malformed UTF-8 data"); } }, parse: function (b) { return a.parse(unescape(encodeURIComponent(b))) } },
		g = l.BufferedBlockAlgorithm = r.extend({
			reset: function () { this._data = new q.init; this._nDataBytes = 0 }, _append: function (b) { "string" == typeof b && (b = u.parse(b)); this._data.concat(b); this._nDataBytes += b.sigBytes }, _process: function (b) { var a = this._data, g = a.words, j = a.sigBytes, k = this.blockSize, m = j / (4 * k), m = b ? s.ceil(m) : s.max((m | 0) - this._minBufferSize, 0); b = m * k; j = s.min(4 * b, j); if (b) { for (var l = 0; l < b; l += k) this._doProcessBlock(g, l); l = g.splice(0, b); a.sigBytes -= j } return new q.init(l, j) }, clone: function () {
				var b = r.clone.call(this);
				b._data = this._data.clone(); return b
			}, _minBufferSize: 0
		}); l.Hasher = g.extend({
			cfg: r.extend(), init: function (b) { this.cfg = this.cfg.extend(b); this.reset() }, reset: function () { g.reset.call(this); this._doReset() }, update: function (b) { this._append(b); this._process(); return this }, finalize: function (b) { b && this._append(b); return this._doFinalize() }, blockSize: 16, _createHelper: function (b) { return function (a, g) { return (new b.init(g)).finalize(a) } }, _createHmacHelper: function (b) {
				return function (a, g) {
					return (new k.HMAC.init(b,
					g)).finalize(a)
				}
			}
		}); var k = m.algo = {}; return m
	}(Math);
	(function (s) {
		function p(a, k, b, h, l, j, m) { a = a + (k & b | ~k & h) + l + m; return (a << j | a >>> 32 - j) + k } function m(a, k, b, h, l, j, m) { a = a + (k & h | b & ~h) + l + m; return (a << j | a >>> 32 - j) + k } function l(a, k, b, h, l, j, m) { a = a + (k ^ b ^ h) + l + m; return (a << j | a >>> 32 - j) + k } function n(a, k, b, h, l, j, m) { a = a + (b ^ (k | ~h)) + l + m; return (a << j | a >>> 32 - j) + k } for (var r = CryptoJS, q = r.lib, v = q.WordArray, t = q.Hasher, q = r.algo, a = [], u = 0; 64 > u; u++) a[u] = 4294967296 * s.abs(s.sin(u + 1)) | 0; q = q.MD5 = t.extend({
			_doReset: function () { this._hash = new v.init([1732584193, 4023233417, 2562383102, 271733878]) },
			_doProcessBlock: function (g, k) {
				for (var b = 0; 16 > b; b++) { var h = k + b, w = g[h]; g[h] = (w << 8 | w >>> 24) & 16711935 | (w << 24 | w >>> 8) & 4278255360 } var b = this._hash.words, h = g[k + 0], w = g[k + 1], j = g[k + 2], q = g[k + 3], r = g[k + 4], s = g[k + 5], t = g[k + 6], u = g[k + 7], v = g[k + 8], x = g[k + 9], y = g[k + 10], z = g[k + 11], A = g[k + 12], B = g[k + 13], C = g[k + 14], D = g[k + 15], c = b[0], d = b[1], e = b[2], f = b[3], c = p(c, d, e, f, h, 7, a[0]), f = p(f, c, d, e, w, 12, a[1]), e = p(e, f, c, d, j, 17, a[2]), d = p(d, e, f, c, q, 22, a[3]), c = p(c, d, e, f, r, 7, a[4]), f = p(f, c, d, e, s, 12, a[5]), e = p(e, f, c, d, t, 17, a[6]), d = p(d, e, f, c, u, 22, a[7]),
				c = p(c, d, e, f, v, 7, a[8]), f = p(f, c, d, e, x, 12, a[9]), e = p(e, f, c, d, y, 17, a[10]), d = p(d, e, f, c, z, 22, a[11]), c = p(c, d, e, f, A, 7, a[12]), f = p(f, c, d, e, B, 12, a[13]), e = p(e, f, c, d, C, 17, a[14]), d = p(d, e, f, c, D, 22, a[15]), c = m(c, d, e, f, w, 5, a[16]), f = m(f, c, d, e, t, 9, a[17]), e = m(e, f, c, d, z, 14, a[18]), d = m(d, e, f, c, h, 20, a[19]), c = m(c, d, e, f, s, 5, a[20]), f = m(f, c, d, e, y, 9, a[21]), e = m(e, f, c, d, D, 14, a[22]), d = m(d, e, f, c, r, 20, a[23]), c = m(c, d, e, f, x, 5, a[24]), f = m(f, c, d, e, C, 9, a[25]), e = m(e, f, c, d, q, 14, a[26]), d = m(d, e, f, c, v, 20, a[27]), c = m(c, d, e, f, B, 5, a[28]), f = m(f, c,
				d, e, j, 9, a[29]), e = m(e, f, c, d, u, 14, a[30]), d = m(d, e, f, c, A, 20, a[31]), c = l(c, d, e, f, s, 4, a[32]), f = l(f, c, d, e, v, 11, a[33]), e = l(e, f, c, d, z, 16, a[34]), d = l(d, e, f, c, C, 23, a[35]), c = l(c, d, e, f, w, 4, a[36]), f = l(f, c, d, e, r, 11, a[37]), e = l(e, f, c, d, u, 16, a[38]), d = l(d, e, f, c, y, 23, a[39]), c = l(c, d, e, f, B, 4, a[40]), f = l(f, c, d, e, h, 11, a[41]), e = l(e, f, c, d, q, 16, a[42]), d = l(d, e, f, c, t, 23, a[43]), c = l(c, d, e, f, x, 4, a[44]), f = l(f, c, d, e, A, 11, a[45]), e = l(e, f, c, d, D, 16, a[46]), d = l(d, e, f, c, j, 23, a[47]), c = n(c, d, e, f, h, 6, a[48]), f = n(f, c, d, e, u, 10, a[49]), e = n(e, f, c, d,
				C, 15, a[50]), d = n(d, e, f, c, s, 21, a[51]), c = n(c, d, e, f, A, 6, a[52]), f = n(f, c, d, e, q, 10, a[53]), e = n(e, f, c, d, y, 15, a[54]), d = n(d, e, f, c, w, 21, a[55]), c = n(c, d, e, f, v, 6, a[56]), f = n(f, c, d, e, D, 10, a[57]), e = n(e, f, c, d, t, 15, a[58]), d = n(d, e, f, c, B, 21, a[59]), c = n(c, d, e, f, r, 6, a[60]), f = n(f, c, d, e, z, 10, a[61]), e = n(e, f, c, d, j, 15, a[62]), d = n(d, e, f, c, x, 21, a[63]); b[0] = b[0] + c | 0; b[1] = b[1] + d | 0; b[2] = b[2] + e | 0; b[3] = b[3] + f | 0
			}, _doFinalize: function () {
				var a = this._data, k = a.words, b = 8 * this._nDataBytes, h = 8 * a.sigBytes; k[h >>> 5] |= 128 << 24 - h % 32; var l = s.floor(b /
				4294967296); k[(h + 64 >>> 9 << 4) + 15] = (l << 8 | l >>> 24) & 16711935 | (l << 24 | l >>> 8) & 4278255360; k[(h + 64 >>> 9 << 4) + 14] = (b << 8 | b >>> 24) & 16711935 | (b << 24 | b >>> 8) & 4278255360; a.sigBytes = 4 * (k.length + 1); this._process(); a = this._hash; k = a.words; for (b = 0; 4 > b; b++) h = k[b], k[b] = (h << 8 | h >>> 24) & 16711935 | (h << 24 | h >>> 8) & 4278255360; return a
			}, clone: function () { var a = t.clone.call(this); a._hash = this._hash.clone(); return a }
		}); r.MD5 = t._createHelper(q); r.HmacMD5 = t._createHmacHelper(q)
	})(Math);


	var CryptoJS = CryptoJS || function (e, m) {
		var p = {}, j = p.lib = {}, l = function () { }, f = j.Base = { extend: function (a) { l.prototype = this; var c = new l; a && c.mixIn(a); c.hasOwnProperty("init") || (c.init = function () { c.$super.init.apply(this, arguments) }); c.init.prototype = c; c.$super = this; return c }, create: function () { var a = this.extend(); a.init.apply(a, arguments); return a }, init: function () { }, mixIn: function (a) { for (var c in a) a.hasOwnProperty(c) && (this[c] = a[c]); a.hasOwnProperty("toString") && (this.toString = a.toString) }, clone: function () { return this.init.prototype.extend(this) } },
		n = j.WordArray = f.extend({
			init: function (a, c) { a = this.words = a || []; this.sigBytes = c != m ? c : 4 * a.length }, toString: function (a) { return (a || h).stringify(this) }, concat: function (a) { var c = this.words, q = a.words, d = this.sigBytes; a = a.sigBytes; this.clamp(); if (d % 4) for (var b = 0; b < a; b++) c[d + b >>> 2] |= (q[b >>> 2] >>> 24 - 8 * (b % 4) & 255) << 24 - 8 * ((d + b) % 4); else if (65535 < q.length) for (b = 0; b < a; b += 4) c[d + b >>> 2] = q[b >>> 2]; else c.push.apply(c, q); this.sigBytes += a; return this }, clamp: function () {
				var a = this.words, c = this.sigBytes; a[c >>> 2] &= 4294967295 <<
				32 - 8 * (c % 4); a.length = e.ceil(c / 4)
			}, clone: function () { var a = f.clone.call(this); a.words = this.words.slice(0); return a }, random: function (a) { for (var c = [], b = 0; b < a; b += 4) c.push(4294967296 * e.random() | 0); return new n.init(c, a) }
		}), b = p.enc = {}, h = b.Hex = {
			stringify: function (a) { var c = a.words; a = a.sigBytes; for (var b = [], d = 0; d < a; d++) { var f = c[d >>> 2] >>> 24 - 8 * (d % 4) & 255; b.push((f >>> 4).toString(16)); b.push((f & 15).toString(16)) } return b.join("") }, parse: function (a) {
				for (var c = a.length, b = [], d = 0; d < c; d += 2) b[d >>> 3] |= parseInt(a.substr(d,
				2), 16) << 24 - 4 * (d % 8); return new n.init(b, c / 2)
			}
		}, g = b.Latin1 = { stringify: function (a) { var c = a.words; a = a.sigBytes; for (var b = [], d = 0; d < a; d++) b.push(String.fromCharCode(c[d >>> 2] >>> 24 - 8 * (d % 4) & 255)); return b.join("") }, parse: function (a) { for (var c = a.length, b = [], d = 0; d < c; d++) b[d >>> 2] |= (a.charCodeAt(d) & 255) << 24 - 8 * (d % 4); return new n.init(b, c) } }, r = b.Utf8 = { stringify: function (a) { try { return decodeURIComponent(escape(g.stringify(a))) } catch (c) { throw Error("Malformed UTF-8 data"); } }, parse: function (a) { return g.parse(unescape(encodeURIComponent(a))) } },
		k = j.BufferedBlockAlgorithm = f.extend({
			reset: function () { this._data = new n.init; this._nDataBytes = 0 }, _append: function (a) { "string" == typeof a && (a = r.parse(a)); this._data.concat(a); this._nDataBytes += a.sigBytes }, _process: function (a) { var c = this._data, b = c.words, d = c.sigBytes, f = this.blockSize, h = d / (4 * f), h = a ? e.ceil(h) : e.max((h | 0) - this._minBufferSize, 0); a = h * f; d = e.min(4 * a, d); if (a) { for (var g = 0; g < a; g += f) this._doProcessBlock(b, g); g = b.splice(0, a); c.sigBytes -= d } return new n.init(g, d) }, clone: function () {
				var a = f.clone.call(this);
				a._data = this._data.clone(); return a
			}, _minBufferSize: 0
		}); j.Hasher = k.extend({
			cfg: f.extend(), init: function (a) { this.cfg = this.cfg.extend(a); this.reset() }, reset: function () { k.reset.call(this); this._doReset() }, update: function (a) { this._append(a); this._process(); return this }, finalize: function (a) { a && this._append(a); return this._doFinalize() }, blockSize: 16, _createHelper: function (a) { return function (c, b) { return (new a.init(b)).finalize(c) } }, _createHmacHelper: function (a) {
				return function (b, f) {
					return (new s.HMAC.init(a,
					f)).finalize(b)
				}
			}
		}); var s = p.algo = {}; return p
	}(Math);
	(function () {
		var e = CryptoJS, m = e.lib, p = m.WordArray, j = m.Hasher, l = [], m = e.algo.SHA1 = j.extend({
			_doReset: function () { this._hash = new p.init([1732584193, 4023233417, 2562383102, 271733878, 3285377520]) }, _doProcessBlock: function (f, n) {
				for (var b = this._hash.words, h = b[0], g = b[1], e = b[2], k = b[3], j = b[4], a = 0; 80 > a; a++) {
					if (16 > a) l[a] = f[n + a] | 0; else { var c = l[a - 3] ^ l[a - 8] ^ l[a - 14] ^ l[a - 16]; l[a] = c << 1 | c >>> 31 } c = (h << 5 | h >>> 27) + j + l[a]; c = 20 > a ? c + ((g & e | ~g & k) + 1518500249) : 40 > a ? c + ((g ^ e ^ k) + 1859775393) : 60 > a ? c + ((g & e | g & k | e & k) - 1894007588) : c + ((g ^ e ^
					k) - 899497514); j = k; k = e; e = g << 30 | g >>> 2; g = h; h = c
				} b[0] = b[0] + h | 0; b[1] = b[1] + g | 0; b[2] = b[2] + e | 0; b[3] = b[3] + k | 0; b[4] = b[4] + j | 0
			}, _doFinalize: function () { var f = this._data, e = f.words, b = 8 * this._nDataBytes, h = 8 * f.sigBytes; e[h >>> 5] |= 128 << 24 - h % 32; e[(h + 64 >>> 9 << 4) + 14] = Math.floor(b / 4294967296); e[(h + 64 >>> 9 << 4) + 15] = b; f.sigBytes = 4 * e.length; this._process(); return this._hash }, clone: function () { var e = j.clone.call(this); e._hash = this._hash.clone(); return e }
		}); e.SHA1 = j._createHelper(m); e.HmacSHA1 = j._createHmacHelper(m)
	})();


	var that, oldPackageString, oldTimeStamp, oldNonceStr,
	networkType = 'undefined',
	wx_api_list = ["onMenuShareTimeline",
						"onMenuShareAppMessage",
						"onMenuShareQQ",
						"onMenuShareWeibo",
						"startRecord",
						"stopRecord",
						"onVoiceRecordEnd",
						"playVoice",
						"pauseVoice",
						"stopVoice",
						"onVoicePlayEnd",
						"uploadVoice",
						"downloadVoice",
						"chooseImage",
						"previewImaged",
						"uploadImage",
						"downloadImage",
						"translateVoice",
						"getNetworkType",
						"openLocation",
						"getLocation",
						"hideOptionMenu",
						"showOptionMenu",
						"hideMenuItems",
						"showMenuItems",
						"hideAllNonBaseMenuItem",
						"showAllNonBaseMenuItem",
						"closeWindow",
						"scanQRCode",
						"chooseWXPay",
						"openProductSpecificView",
						"addCard",
						"chooseCard",
						"openCard"];

	var ua = navigator.userAgent.toLowerCase(),
	weixinVersion = function () {
		var a = ua.match(/micromessenger\/(\d+\.\d+\.\d+)/) || ua.match(/micromessenger\/(\d+\.\d+)/);
		return a ? a[1] : ""
	}();

	function _getPackage(partnerId, partnerKey, productName, orderNum, totalPrice, clientIp, notifyUrl) {
		var banktype = "WX";
		var fee_type = "1";//费用类型，这里1为默认的人民币
		var input_charset = "UTF-8";//字符集，这里将统一使用GBK
		var notify_url = notifyUrl//"http://weixin.noahstrade.com/pay/notify/appname/PayNotifyUrl";//TODO APPNAME 支付成功后将通知该地址

		var signString = "bank_type=" + banktype + "&body=" + productName + "&fee_type=" + fee_type + "&input_charset=" + input_charset + "&notify_url=" + notify_url + "&out_trade_no=" + orderNum + "&partner=" + partnerId + "&spbill_create_ip=" + clientIp + "&total_fee=" + totalPrice + "&key=" + partnerKey;

		var md5SignValue = ("" + CryptoJS.MD5(signString)).toUpperCase();
		banktype = encodeURIComponent(banktype);
		productName = encodeURIComponent(productName);
		fee_type = encodeURIComponent(fee_type);
		input_charset = encodeURIComponent(input_charset);
		notify_url = encodeURIComponent(notify_url);
		orderNum = encodeURIComponent(orderNum);
		partnerId = encodeURIComponent(partnerId);
		clientIp = encodeURIComponent(clientIp);
		totalPrice = encodeURIComponent(totalPrice);

		var completeString = "bank_type=" + banktype + "&body=" + productName + "&fee_type=" + fee_type + "&input_charset=" + input_charset + "&notify_url=" + notify_url + "&out_trade_no=" + orderNum + "&partner=" + partnerId + "&spbill_create_ip=" + clientIp + "&total_fee=" + totalPrice;
		completeString = completeString + "&sign=" + md5SignValue;

		oldPackageString = completeString;

		return completeString;
	};
	function _getSign(payAppId, payAppKey) {
		var app_id = payAppId;
		var app_key = payAppKey
		var nonce_str = oldNonceStr;
		var package_string = oldPackageString;
		var time_stamp = oldTimeStamp;

		var keyvaluestring = "appid=" + app_id + "&appkey=" + app_key + "&noncestr=" + nonce_str + "&package=" + package_string + "&timestamp=" + time_stamp;
		sign = CryptoJS.SHA1(keyvaluestring).toString();
		return sign;
	};
	function _getTimeStamp() {
		if (oldTimeStamp) return oldTimeStamp;
		var timestamp = new Date().getTime();
		var timestampstring = timestamp.toString();//一定要转换字符串
		oldTimeStamp = timestampstring;
		return timestampstring;
	};
	function _getNonceStr() {
		if (oldNonceStr) return oldNonceStr;
		var $chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		var maxPos = $chars.length;
		var noceStr = "";
		for (i = 0; i < 32; i++) {
			noceStr += $chars.charAt(Math.floor(Math.random() * maxPos));
		}
		oldNonceStr = noceStr;
		return noceStr;
	};


	var obj = function () {
		if (!'wx' in window) {
			throw new Error("请先引用微信官方js");
		}

		that = this;
		that._eventMap = {};
		that._paramMap = {};
		that.shareParam = {};
		that.readyList = [];
	};

	obj.prototype = {
		on: function (ename, callback, param) {
			if (typeof (callback) != "function") return;
			that._eventMap || (that._eventMap = {});
			that._eventMap[ename] = callback;
			that._paramMap[ename] = param;

			wx.ready(function () {
				that._getNetworkType();

				while (f = that.readyList.pop()) {
					f();
				}

				that.readyState = true;
			});

			that._error();
		},

		config:function(isdebug,weixinAppId,timestamp,noncestr,signature){
			wx.config({
				debug: isdebug,
				appId: weixinAppId,
				timestamp: timestamp,
				nonceStr: noncestr,
				signature: signature,
				jsApiList: wx_api_list
			});
		}
		ready: function (fn) {
			if (that.readyState) {
				fn();
			} else {
				that.readyList.push(fn);
			}
		},
		_error: function () {
			wx.error(function (res) {
				alert(JSON.stringify(res));
			});
		},

		setShareParam: function (shareParam) {
			that.shareParam = shareParam;
			that._initShare();
		},

		getNetworkType: function () {
			return networkType;
		},
		/*图片*/
		previewImage: function (imageUrls, index) {
			var currentImg = imageUrls[index];
			wx.previewImage({
				current: currentImg,
				urls: imageUrls
			})
		},

		chooseImage: function (callback) {
			wx.chooseImage({
				success: function (res) {
					if (typeof (callback) == 'function')
						callback(res.localIds);
				}
			});
		},

		uploadImage: function (localId, callback) {
			wx.uploadImage({
				localId: localId, // 需要上传的图片的本地ID，由chooseImage接口获得
				isShowProgressTips: 1,// 默认为1，显示进度提示
				success: function (res) {
					var serverId = res.serverId; // 返回图片的服务器端ID
					if (typeof (callback) == 'function')
						callback(serverId);
				}
			});
		},

		downloadImage: function (serverId, callback) {
			wx.downloadImage({
				serverId: serverId, // 需要下载的图片的服务器端ID，由uploadImage接口获得
				isShowProgressTips: 1,// 默认为1，显示进度提示
				success: function (res) {
					var localId = res.localId; // 返回图片下载后的本地ID
					if (typeof (callback) == 'function')
						callback(localId);
				}
			});
		},
		/*窗口*/

		closeWindow: function () {
			wx.closeWindow();
		},

		/*菜单*/

		hideOptionMenu: function () {
			console.log("hideOptionMenu");
			wx.hideOptionMenu();
		},

		showOptionMenu: function () {
			wx.showOptionMenu();
		},

		/*
		基本类

		举报: "menuItem:exposeArticle"
		调整字体: "menuItem:setFont"
		日间模式: "menuItem:dayMode"
		夜间模式: "menuItem:nightMode"
		刷新: "menuItem:refresh"
		查看公众号（已添加）: "menuItem:profile"
		查看公众号（未添加）: "menuItem:addContact"
		传播类

		发送给朋友: "menuItem:share:appMessage"
		分享到朋友圈: "menuItem:share:timeline"
		分享到QQ: "menuItem:share:qq"
		分享到Weibo: "menuItem:share:weiboApp"
		收藏: "menuItem:favorite"
		分享到FB: "menuItem:share:facebook"
		保护类

		调试: "menuItem:jsDebug"
		编辑标签: "menuItem:editTag"
		删除: "menuItem:delete"
		复制链接: "menuItem:copyUrl"
		原网页: "menuItem:originPage"
		阅读模式: "menuItem:readMode"
		在QQ浏览器中打开: "menuItem:openWithQQBrowser"
		在Safari中打开: "menuItem:openWithSafari"
		邮件: "menuItem:share:email"
		一些特殊公众号: "menuItem:share:brand"
		*/


		hideMenuItems: function (menuItems) {
			wx.hideMenuItems({
				menuList: menuItems// 要隐藏的菜单项，所有menu项见附录3
			});
		},
		showMenuItems: function (menuItems) {
			wx.showMenuItems({
				menuList: menuItems // 要显示的菜单项，所有menu项见附录3
			});
		},
		hideNonBaseMenuItems: function () {
			wx.hideAllNonBaseMenuItem();
		},
		showNonBaseMenuItems: function () {
			wx.showAllNonBaseMenuItem();
		},

		/*二维码*/

		scanQRCode: function (desc, needResult, callback) {
			wx.scanQRCode({
				desc: desc,
				needResult: needResult, // 默认为0，扫描结果由微信处理，1则直接返回扫描结果，
				scanType: ["qrCode", "barCode"], // 可以指定扫二维码还是一维码，默认二者都有
				success: function (res) {
					var result = res.resultStr; // 当needResult 为 1 时，扫码返回的结果
					if (typeof (callback) == 'function') {
						callback(result);
					}
				}
			});
		},

		/*录音*/

		startRecord: function (longTimeAutoStop, callback) {
			if (longTimeAutoStop)
				wx.onVoiceRecordEnd({
					// 录音时间超过一分钟没有停止的时候会执行 complete 回调
					complete: function (res) {
						var localId = res.localId;
						if (typeof (callback) == 'function')
							callback(localId);
					}
				});
			wx.startRecord();
		},

		stopRecord: function (callback) {
			wx.stopRecord({
				success: function (res) {
					var localId = res.localId;
					if (typeof (callback) == 'function')
						callback(localId);
				}
			});
		},

		playVoice: function (localId, onVoicePlayEndCallback) {
			if (typeof (onVoicePlayEndCallback) == 'function') {
				wx.onVoicePlayEnd({
					complete: function (res) {
						var localId = res.localId; // 返回音频的本地ID
						onVoicePlayEndCallback(localId);
					}
				});
			}
			wx.playVoice({
				localId: localId // 需要播放的音频的本地ID，由stopRecord接口获得
			});
		},

		pauseVoice: function (localId) {
			wx.pauseVoice({
				localId: localId // 需要暂停的音频的本地ID，由stopRecord接口获得
			});
		},

		stopVoice: function (localId) {
			wx.stopVoice({
				localId: localId // 需要停止的音频的本地ID，由stopRecord接口获得
			});
		},

		uploadVoice: function (localId, isShowProgressTips, callback) {
			wx.uploadVoice({
				localId: localId, // 需要上传的音频的本地ID，由stopRecord接口获得
				isShowProgressTips: isShowProgressTips,// 默认为1，显示进度提示
				success: function (res) {
					var serverId = res.serverId; // 返回音频的服务器端ID
					if (typeof (callback) == 'function')
						callback(serverId);
				}
			});
		},

		downloadVoice: function (serverId, isShowProgressTips, callback) {
			wx.downloadVoice({
				serverId: serverId, // 需要下载的音频的服务器端ID，由uploadVoice接口获得
				isShowProgressTips: isShowProgressTips,// 默认为1，显示进度提示
				success: function (res) {
					var localId = res.localId; // 返回音频的本地ID
					if (typeof (callback) == 'function')
						callback(localId);
				}
			});
		},

		translateVocie: function (localId, isShowProgressTips, callback) {
			wx.translateVoice({
				localId: localId, // 需要识别的音频的本地Id，由录音相关接口获得
				isShowProgressTips: isShowProgressTips, // 默认为1，显示进度提示
				success: function (res) {
					if (typeof (callback) == 'function')
						callback(res.translateResult);
				}
			});
		},

		/*地理位置*/

		openLocation: function (lat, lon, name, address, scale, infoUrl) {
			wx.openLocation({
				latitude: lat, // 纬度，浮点数，范围为90 ~ -90
				longitude: lon, // 经度，浮点数，范围为180 ~ -180。
				name: name, // 位置名
				address: address, // 地址详情说明
				scale: scale, // 地图缩放级别,整形值,范围从1~28。默认为最大
				infoUrl: infoUrl // 在查看位置界面底部显示的超链接,可点击跳转
			});
		},

		getLocation: function (timestamp, nonceStr, addrSign, callback) {
			wx.getLocation({
				timestamp: timestamp, // 位置签名时间戳，仅当需要兼容6.0.2版本之前时提供
				nonceStr: nonceStr, // 位置签名随机串，仅当需要兼容6.0.2版本之前时提供
				addrSign: addrSign, // 位置签名，仅当需要兼容6.0.2版本之前时提供，详见附录4
				success: function (res) {
					var lon = res.longitude; // 纬度，浮点数，范围为90 ~ -90
					var lat = res.latitude; // 经度，浮点数，范围为180 ~ -180。
					var accuracy = res.accuracy; // 位置精度
					if (typeof (callback) == 'function')
						callback(lon, lat, accuracy);
				}
			});
		},

		payRequest: function (payAppId, payAppKey, partnerId, partnerKey, productName, orderNum, totalPrice, clientIp, notifyUrl, callback) {
			wx.chooseWXPay({
				timestamp: _getTimeStamp(), // 支付签名时间戳，注意微信jssdk中的所有使用timestamp字段均为小写。但最新版的支付后台生成签名使用的timeStamp字段名需大写其中的S字符
				nonceStr: _getNonceStr(), // 支付签名随机串，不长于 32 位
				package: _getPackage(partnerId, partnerKey, productName, orderNum, totalPrice, clientIp, notifyUrl), // 统一支付接口返回的prepay_id参数值，提交格式如：prepay_id=***）
				signType: 'SHA1', // 签名方式，默认为'SHA1'，使用新版支付需传入'MD5'
				paySign: _getSign(payAppId, payAppKey) // 支付签名
			});
		},

		/*网络*/
		_getNetworkType: function () {
			wx.getNetworkType({
				success: function (res) {
					networkType = res.networkType; // 返回网络类型2g，3g，4g，wifi
				}
			});
		},

		/*分享*/
		_initShare: function () {
			that._onMenuShareTimeline();

			that._onMenuShareAppMessage();

			that._onMenuShareQQ();

			that._onMenuShareWeibo();
		},

		_onMenuShareTimeline: function () {
			wx.onMenuShareTimeline({
				title: that.shareParam.ShareTitle, // 分享标题
				link: that.shareParam.ShareLink, // 分享链接
				imgUrl: that.shareParam.ShareImgUrl, // 分享图标
				success: function (res) {
					if (that.shareParam.callback && typeof (that.shareParam.callback) == 'function')
						that.shareParam.callback(res);
				},
				cancel: function (res) {
					if (that.shareParam.callback && typeof (that.shareParam.callback) == 'function')
						that.shareParam.callback(res);
				}
			});
		},

		_onMenuShareAppMessage: function () {
			wx.onMenuShareAppMessage({
				title: that.shareParam.ShareTitle, // 分享标题
				desc: that.shareParam.ShareDesc, // 分享描述
				link: that.shareParam.ShareLink, // 分享链接
				imgUrl: that.shareParam.ShareImgUrl, // 分享图标
				type: that.shareParam.Type, // 分享类型,music、video或link，不填默认为link
				dataUrl: that.shareParam.DataUrl, // 如果type是music或video，则要提供数据链接，默认为空
				success: function (res) {
					if (that.shareParam.callback && typeof (that.shareParam.callback) == 'function')
						that.shareParam.callback(res);
				},
				cancel: function (res) {
					if (that.shareParam.callback && typeof (that.shareParam.callback) == 'function')
						that.shareParam.callback(res);
				}
			});
		},

		_onMenuShareQQ: function () {
			wx.onMenuShareQQ({
				title: that.shareParam.ShareTitle, // 分享标题
				desc: that.shareParam.ShareDesc, // 分享描述
				link: that.shareParam.ShareLink, // 分享链接
				imgUrl: that.shareParam.ShareImgUrl, // 分享图标
				success: function (res) {
					if (that.shareParam.callback && typeof (that.shareParam.callback) == 'function')
						that.shareParam.callback(res);
				},
				cancel: function (res) {
					if (that.shareParam.callback && typeof (that.shareParam.callback) == 'function')
						that.shareParam.callback(res);
				}
			});
		},

		_onMenuShareWeibo: function () {
			wx.onMenuShareWeibo({
				title: that.shareParam.ShareTitle, // 分享标题
				desc: that.shareParam.ShareDesc, // 分享描述
				link: that.shareParam.ShareLink, // 分享链接
				imgUrl: that.shareParam.ShareImgUrl, // 分享图标
				success: function (res) {
					if (that.shareParam.callback && typeof (that.shareParam.callback) == 'function')
						that.shareParam.callback(res);
				},
				cancel: function (res) {
					if (that.shareParam.callback && typeof (that.shareParam.callback) == 'function')
						that.shareParam.callback(res);
				}
			});
		},
	}

	var oldwx = function () {
		that = this;
		that.readyList = [];
		if (typeof WeixinJSBridge == "undefined") {
			if (document.addEventListener) {
				document.addEventListener('WeixinJSBridgeReady', that._onBridgeReady, false);
			} else if (document.attachEvent) {
				document.attachEvent('WeixinJSBridgeReady', that._onBridgeReady);
				document.attachEvent('onWeixinJSBridgeReady', that._onBridgeReady);
			}
		} else {
			that._onBridgeReady();
		}
	}

	oldwx.prototype = {
		config:function(){},
		ready: function (fn) {
			if (that.readyState) {
				fn();
			} else {
				that.readyList.push(fn);
			}
		},
		setShareParam: function (shareParam) {
			that.shareParam = shareParam;
		},

		_onBridgeReady: function () {
			while (f = that.readyList.pop()) {
				f();
			}

			WeixinJSBridge.invoke('getNetworkType', {},
		 		function (e) {
		 			networkType = e.err_msg;
		 		}
	 	    );

			WeixinJSBridge.on('menu:share:appmessage',
				function (argv) {
					WeixinJSBridge.invoke('sendAppMessage', {
						"img_url": that.shareParam.ShareImgUrl,
						"img_width": "640",
						"img_height": "640",
						"link": that.shareParam.ShareLink,
						"title": that.shareParam.ShareTitle,
						"desc": that.shareParam.ShareDesc
					},
					function (res) {
						if (that.shareParam.callback) that.shareParam.callback(res);
					})
				}
			);

			WeixinJSBridge.on('menu:share:timeline',
				function (argv) {
					WeixinJSBridge.invoke('shareTimeline', {
						"img_url": that.shareParam.ShareImgUrl,
						"img_width": "640",
						"img_height": "640",
						"link": that.shareParam.ShareLink,
						"title": that.shareParam.ShareTitle,
						"desc": ""
					},
					function (res) {
						if (that.shareParam.callback) that.shareParam.callback(res);
					});
				}
			);

			WeixinJSBridge.on('menu:share:weibo',
				function (argv) {
					WeixinJSBridge.invoke('shareWeibo', {
						"content": that.shareParam.ShareDesc,
						"url": that.shareParam.ShareLink
					},
					function (res) {
						if (that.shareParam.callback) that.shareParam.callback(res);
					});
				}
			);
			that.readyState = true;
			WeixinJSBridge.call('hideToolbar');
		},

		payRequest: function (payAppId, payAppKey, partnerId, partnerKey, productName, orderNum, totalPrice, clientIp, notifyUrl, callback) {
			if (typeof WeixinJSBridge == "undefined") {
				console.log("error WeixinJSBridge is undefined");
				return;
			}
			WeixinJSBridge.invoke('getBrandWCPayRequest', {
				"appId": payAppId,
				"timeStamp": _getTimeStamp(),
				"nonceStr": _getNonceStr(),
				"package": _getPackage(partnerId, partnerKey, productName, orderNum, totalPrice, clientIp, notifyUrl),
				"signType": "SHA1",
				"paySign": _getSign(payAppId, payAppKey)
			}, function (res) {
				if (res.err_msg == "get_brand_wcpay_requegetPackagest:ok" || res.err_msg == "get_brand_wcpay_request:ok") {
					callback(true)
				} else {
					console.log(JSON.stringify(res));
					callback();
				}
			});
		},

		getNetworkType: function () {
			return networkType;
		},

		hideOptionMenu: function () {
			WeixinJSBridge.call('hideOptionMenu');
		},

		closeWindow: function () {
			WeixinJSBridge.invoke('closeWindow', {}, function (res) { });
		}
	};
	window.Weixin = weixinVersion > "6.0.1" ? new obj() : new oldwx();

})()

