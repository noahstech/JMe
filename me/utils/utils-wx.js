var Weixin = (function () {
	var that;
	var networkType = 'undefined';
	var wx_api_list = ["onMenuShareTimeline",
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
						"openCard"]

	var obj = function (isdebug,appId, timestamp, nonceStr, signature, readyFun) {
		that = this;
		that.shareParam = {
			Title: "",
			Desc: "",
			imgUrl: "",
			Link: "",
			callback: null,
			Type: "",
			DataUrl: ""
		};
		var configParam = {
			debug: isdebug,
			appId: appId,
			timestamp: timestamp,
			nonceStr: nonceStr,
			signature: signature,
			jsApiList: wx_api_list
		}
		wx.config(configParam);

		wx.ready(function () {
			that._initShare();
			that._getNetworkType();
			if (typeof (readyFun) == 'function')
				readyFun();
		});

		wx.error(function (res) {
			alert(JSON.stringify(res));
		});
	};

	obj.prototype = {
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
			wx.onMenuShareTimeline({
				title: that.shareParam.Title, // 分享标题
				link: that.shareParam.Link, // 分享链接
				imgUrl: that.shareParam.ImgUrl, // 分享图标
				success: function (res) {
					if (that.shareParam.callback && typeof (that.shareParam.callback) == 'function')
						that.shareParam.callback(res);
				},
				cancel: function (res) {
					if (that.shareParam.callback && typeof (that.shareParam.callback) == 'function')
						that.shareParam.callback(res);
				}
			});

			wx.onMenuShareAppMessage({
				title: that.shareParam.Title, // 分享标题
				desc: that.shareParam.Desc, // 分享描述
				link: that.shareParam.Link, // 分享链接
				imgUrl: that.shareParam.ImgUrl, // 分享图标
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

			wx.onMenuShareQQ({
				title: that.shareParam.Title, // 分享标题
				desc: that.shareParam.Desc, // 分享描述
				link: that.shareParam.Link, // 分享链接
				imgUrl: that.shareParam.ImgUrl, // 分享图标
				success: function (res) {
					if (that.shareParam.callback && typeof (that.shareParam.callback) == 'function')
						that.shareParam.callback(res);
				},
				cancel: function (res) {
					if (that.shareParam.callback && typeof (that.shareParam.callback) == 'function')
						that.shareParam.callback(res);
				}
			});

			wx.onMenuShareWeibo({
				title: that.shareParam.Title, // 分享标题
				desc: that.shareParam.Desc, // 分享描述
				link: that.shareParam.Link, // 分享链接
				imgUrl: that.shareParam.ImgUrl, // 分享图标
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


		setShareParam: function (shareParam) {
			that.shareParam = shareParam;
			that._initShare();
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

		translateVocie: function (localId, isShowProgressTips,callback) {
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

		openLocation: function(lat, lon, name,address,scale,infoUrl) {
			wx.openLocation({
				latitude: lat, // 纬度，浮点数，范围为90 ~ -90
				longitude: lon, // 经度，浮点数，范围为180 ~ -180。
				name: name, // 位置名
				address: address, // 地址详情说明
				scale: scale, // 地图缩放级别,整形值,范围从1~28。默认为最大
				infoUrl: infoUrl // 在查看位置界面底部显示的超链接,可点击跳转
			});
		},

		getLocation: function (timestamp, nonceStr, addrSign,callback) {
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
		}

	}
	return obj;
})()