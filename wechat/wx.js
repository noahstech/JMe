(function(){var c=(function(){var g;var h=function(){g=this;if(typeof WeixinJSBridge=="undefined"){if(document.addEventListener){document.addEventListener("WeixinJSBridgeReady",g._onBridgeReady,false)}else{if(document.attachEvent){document.attachEvent("WeixinJSBridgeReady",g._onBridgeReady);document.attachEvent("onWeixinJSBridgeReady",g._onBridgeReady)}}}else{g._onBridgeReady}};h.prototype={init:function(f,j){g.shareParam=f;g.callback=j},_onBridgeReady:function(){WeixinJSBridge.on("menu:share:appmessage",function(f){WeixinJSBridge.invoke("sendAppMessage",{"img_url":g.shareParam.ShareImgUrl,"img_width":"640","img_height":"640","link":g.shareParam.ShareLink,"title":g.shareParam.ShareTitle,"desc":g.shareParam.ShareDesc},function(j){if(g.callback){g.callback(j)}})});WeixinJSBridge.on("menu:share:timeline",function(f){WeixinJSBridge.invoke("shareTimeline",{"img_url":g.shareParam.ShareImgUrl,"img_width":"640","img_height":"640","link":g.shareParam.ShareLink,"title":g.shareParam.ShareDesc,"desc":""},function(j){if(g.callback){g.callback(j)}})});WeixinJSBridge.on("menu:share:weibo",function(f){WeixinJSBridge.invoke("shareWeibo",{"content":g.shareParam.ShareDesc,"url":g.shareParam.ShareLink},function(j){if(g.callback){g.callback(j)}})});WeixinJSBridge.call("hideToolbar")}};return new h()})();var a=(function(){var j;var h;var l;var g;var f=f||function(B,u){var q={},x=q.lib={},v=function(){},A=x.Base={extend:function(m){v.prototype=this;var n=new v;m&&n.mixIn(m);n.hasOwnProperty("init")||(n.init=function(){n.$super.init.apply(this,arguments)});n.init.prototype=n;n.$super=this;return n},create:function(){var m=this.extend();m.init.apply(m,arguments);return m},init:function(){},mixIn:function(m){for(var n in m){m.hasOwnProperty(n)&&(this[n]=m[n])}m.hasOwnProperty("toString")&&(this.toString=m.toString)},clone:function(){return this.init.prototype.extend(this)}},t=x.WordArray=A.extend({init:function(m,n){m=this.words=m||[];this.sigBytes=n!=u?n:4*m.length},toString:function(m){return(m||y).stringify(this)},concat:function(n){var s=this.words,p=n.words,r=this.sigBytes;n=n.sigBytes;this.clamp();if(r%4){for(var m=0;m<n;m++){s[r+m>>>2]|=(p[m>>>2]>>>24-8*(m%4)&255)<<24-8*((r+m)%4)}}else{if(65535<p.length){for(m=0;m<n;m+=4){s[r+m>>>2]=p[m>>>2]}}else{s.push.apply(s,p)}}this.sigBytes+=n;return this},clamp:function(){var m=this.words,n=this.sigBytes;m[n>>>2]&=4294967295<<32-8*(n%4);m.length=B.ceil(n/4)},clone:function(){var m=A.clone.call(this);m.words=this.words.slice(0);return m},random:function(n){for(var p=[],m=0;m<n;m+=4){p.push(4294967296*B.random()|0)}return new t.init(p,n)}}),C=q.enc={},y=C.Hex={stringify:function(n){var s=n.words;n=n.sigBytes;for(var m=[],r=0;r<n;r++){var p=s[r>>>2]>>>24-8*(r%4)&255;m.push((p>>>4).toString(16));m.push((p&15).toString(16))}return m.join("")},parse:function(n){for(var r=n.length,m=[],p=0;p<r;p+=2){m[p>>>3]|=parseInt(n.substr(p,2),16)<<24-4*(p%8)}return new t.init(m,r/2)}},z=C.Latin1={stringify:function(n){var r=n.words;n=n.sigBytes;for(var m=[],p=0;p<n;p++){m.push(String.fromCharCode(r[p>>>2]>>>24-8*(p%4)&255))}return m.join("")},parse:function(n){for(var r=n.length,m=[],p=0;p<r;p++){m[p>>>2]|=(n.charCodeAt(p)&255)<<24-8*(p%4)}return new t.init(m,r)}},o=C.Utf8={stringify:function(m){try{return decodeURIComponent(escape(z.stringify(m)))}catch(n){throw Error("Malformed UTF-8 data")}},parse:function(m){return z.parse(unescape(encodeURIComponent(m)))}},w=x.BufferedBlockAlgorithm=A.extend({reset:function(){this._data=new t.init;this._nDataBytes=0},_append:function(m){"string"==typeof m&&(m=o.parse(m));this._data.concat(m);this._nDataBytes+=m.sigBytes},_process:function(n){var F=this._data,m=F.words,E=F.sigBytes,s=this.blockSize,p=E/(4*s),p=n?B.ceil(p):B.max((p|0)-this._minBufferSize,0);n=p*s;E=B.min(4*n,E);if(n){for(var r=0;r<n;r+=s){this._doProcessBlock(m,r)}r=m.splice(0,n);F.sigBytes-=E}return new t.init(r,E)},clone:function(){var m=A.clone.call(this);m._data=this._data.clone();return m},_minBufferSize:0});x.Hasher=w.extend({cfg:A.extend(),init:function(m){this.cfg=this.cfg.extend(m);this.reset()},reset:function(){w.reset.call(this);this._doReset()},update:function(m){this._append(m);this._process();return this},finalize:function(m){m&&this._append(m);return this._doFinalize()},blockSize:16,_createHelper:function(m){return function(p,n){return(new m.init(n)).finalize(p)}},_createHmacHelper:function(m){return function(n,p){return(new D.HMAC.init(m,p)).finalize(n)}}});var D=q.algo={};return q}(Math);(function(){var s=f,n=s.lib,r=n.WordArray,q=n.Hasher,o=[],n=s.algo.SHA1=q.extend({_doReset:function(){this._hash=new r.init([1732584193,4023233417,2562383102,271733878,3285377520])},_doProcessBlock:function(w,m){for(var z=this._hash.words,u=z[0],v=z[1],x=z[2],p=z[3],t=z[4],A=0;80>A;A++){if(16>A){o[A]=w[m+A]|0}else{var y=o[A-3]^o[A-8]^o[A-14]^o[A-16];o[A]=y<<1|y>>>31}y=(u<<5|u>>>27)+t+o[A];y=20>A?y+((v&x|~v&p)+1518500249):40>A?y+((v^x^p)+1859775393):60>A?y+((v&x|v&p|x&p)-1894007588):y+((v^x^p)-899497514);
t=p;p=x;x=v<<30|v>>>2;v=u;u=y}z[0]=z[0]+u|0;z[1]=z[1]+v|0;z[2]=z[2]+x|0;z[3]=z[3]+p|0;z[4]=z[4]+t|0},_doFinalize:function(){var t=this._data,u=t.words,m=8*this._nDataBytes,p=8*t.sigBytes;u[p>>>5]|=128<<24-p%32;u[(p+64>>>9<<4)+14]=Math.floor(m/4294967296);u[(p+64>>>9<<4)+15]=m;t.sigBytes=4*u.length;this._process();return this._hash},clone:function(){var m=q.clone.call(this);m._hash=this._hash.clone();return m}});s.SHA1=q._createHelper(n);s.HmacSHA1=q._createHmacHelper(n)})();var f=f||function(H,x){var z={},A=z.lib={},y=function(){},o=A.Base={extend:function(m){y.prototype=this;var n=new y;m&&n.mixIn(m);n.hasOwnProperty("init")||(n.init=function(){n.$super.init.apply(this,arguments)});n.init.prototype=n;n.$super=this;return n},create:function(){var m=this.extend();m.init.apply(m,arguments);return m},init:function(){},mixIn:function(m){for(var n in m){m.hasOwnProperty(n)&&(this[n]=m[n])}m.hasOwnProperty("toString")&&(this.toString=m.toString)},clone:function(){return this.init.prototype.extend(this)}},w=A.WordArray=o.extend({init:function(m,n){m=this.words=m||[];this.sigBytes=n!=x?n:4*m.length},toString:function(m){return(m||G).stringify(this)},concat:function(m){var q=this.words,n=m.words,p=this.sigBytes;m=m.sigBytes;this.clamp();if(p%4){for(var r=0;r<m;r++){q[p+r>>>2]|=(n[r>>>2]>>>24-8*(r%4)&255)<<24-8*((p+r)%4)}}else{if(65535<n.length){for(r=0;r<m;r+=4){q[p+r>>>2]=n[r>>>2]}}else{q.push.apply(q,n)}}this.sigBytes+=m;return this},clamp:function(){var m=this.words,n=this.sigBytes;m[n>>>2]&=4294967295<<32-8*(n%4);m.length=H.ceil(n/4)},clone:function(){var m=o.clone.call(this);m.words=this.words.slice(0);return m},random:function(m){for(var p=[],n=0;n<m;n+=4){p.push(4294967296*H.random()|0)}return new w.init(p,m)}}),E=z.enc={},G=E.Hex={stringify:function(m){var n=m.words;m=m.sigBytes;for(var r=[],q=0;q<m;q++){var p=n[q>>>2]>>>24-8*(q%4)&255;r.push((p>>>4).toString(16));r.push((p&15).toString(16))}return r.join("")},parse:function(m){for(var n=m.length,q=[],p=0;p<n;p+=2){q[p>>>3]|=parseInt(m.substr(p,2),16)<<24-4*(p%8)}return new w.init(q,n/2)}},D=E.Latin1={stringify:function(m){var n=m.words;m=m.sigBytes;for(var q=[],p=0;p<m;p++){q.push(String.fromCharCode(n[p>>>2]>>>24-8*(p%4)&255))}return q.join("")},parse:function(m){for(var n=m.length,q=[],p=0;p<n;p++){q[p>>>2]|=(m.charCodeAt(p)&255)<<24-8*(p%4)}return new w.init(q,n)}},F=E.Utf8={stringify:function(m){try{return decodeURIComponent(escape(D.stringify(m)))}catch(n){throw Error("Malformed UTF-8 data")}},parse:function(m){return D.parse(unescape(encodeURIComponent(m)))}},C=A.BufferedBlockAlgorithm=o.extend({reset:function(){this._data=new w.init;this._nDataBytes=0},_append:function(m){"string"==typeof m&&(m=F.parse(m));this._data.concat(m);this._nDataBytes+=m.sigBytes},_process:function(p){var r=this._data,u=r.words,t=r.sigBytes,s=this.blockSize,n=t/(4*s),n=p?H.ceil(n):H.max((n|0)-this._minBufferSize,0);p=n*s;t=H.min(4*p,t);if(p){for(var q=0;q<p;q+=s){this._doProcessBlock(u,q)}q=u.splice(0,p);r.sigBytes-=t}return new w.init(q,t)},clone:function(){var m=o.clone.call(this);m._data=this._data.clone();return m},_minBufferSize:0});A.Hasher=C.extend({cfg:o.extend(),init:function(m){this.cfg=this.cfg.extend(m);this.reset()},reset:function(){C.reset.call(this);this._doReset()},update:function(m){this._append(m);this._process();return this},finalize:function(m){m&&this._append(m);return this._doFinalize()},blockSize:16,_createHelper:function(m){return function(n,p){return(new m.init(p)).finalize(n)}},_createHmacHelper:function(m){return function(n,p){return(new B.HMAC.init(m,p)).finalize(n)}}});var B=z.algo={};return z}(Math);(function(F){function x(r,s,p,u,q,t,n){r=r+(s&p|~s&u)+q+n;return(r<<t|r>>>32-t)+s}function z(r,s,p,u,q,t,n){r=r+(s&u|p&~u)+q+n;return(r<<t|r>>>32-t)+s}function A(r,s,p,u,q,t,n){r=r+(s^p^u)+q+n;return(r<<t|r>>>32-t)+s}function y(r,s,p,u,q,t,n){r=r+(p^(s|~u))+q+n;return(r<<t|r>>>32-t)+s}for(var o=f,w=o.lib,C=w.WordArray,E=w.Hasher,w=o.algo,B=[],D=0;64>D;D++){B[D]=4294967296*F.abs(F.sin(D+1))|0}w=w.MD5=E.extend({_doReset:function(){this._hash=new C.init([1732584193,4023233417,2562383102,271733878])},_doProcessBlock:function(U,R){for(var Z=0;16>Z;Z++){var T=R+Z,G=U[T];U[T]=(G<<8|G>>>24)&16711935|(G<<24|G>>>8)&4278255360}var Z=this._hash.words,T=U[R+0],G=U[R+1],S=U[R+2],P=U[R+3],N=U[R+4],L=U[R+5],J=U[R+6],I=U[R+7],H=U[R+8],p=U[R+9],n=U[R+10],m=U[R+11],Q=U[R+12],O=U[R+13],M=U[R+14],K=U[R+15],Y=Z[0],X=Z[1],W=Z[2],V=Z[3],Y=x(Y,X,W,V,T,7,B[0]),V=x(V,Y,X,W,G,12,B[1]),W=x(W,V,Y,X,S,17,B[2]),X=x(X,W,V,Y,P,22,B[3]),Y=x(Y,X,W,V,N,7,B[4]),V=x(V,Y,X,W,L,12,B[5]),W=x(W,V,Y,X,J,17,B[6]),X=x(X,W,V,Y,I,22,B[7]),Y=x(Y,X,W,V,H,7,B[8]),V=x(V,Y,X,W,p,12,B[9]),W=x(W,V,Y,X,n,17,B[10]),X=x(X,W,V,Y,m,22,B[11]),Y=x(Y,X,W,V,Q,7,B[12]),V=x(V,Y,X,W,O,12,B[13]),W=x(W,V,Y,X,M,17,B[14]),X=x(X,W,V,Y,K,22,B[15]),Y=z(Y,X,W,V,G,5,B[16]),V=z(V,Y,X,W,J,9,B[17]),W=z(W,V,Y,X,m,14,B[18]),X=z(X,W,V,Y,T,20,B[19]),Y=z(Y,X,W,V,L,5,B[20]),V=z(V,Y,X,W,n,9,B[21]),W=z(W,V,Y,X,K,14,B[22]),X=z(X,W,V,Y,N,20,B[23]),Y=z(Y,X,W,V,p,5,B[24]),V=z(V,Y,X,W,M,9,B[25]),W=z(W,V,Y,X,P,14,B[26]),X=z(X,W,V,Y,H,20,B[27]),Y=z(Y,X,W,V,O,5,B[28]),V=z(V,Y,X,W,S,9,B[29]),W=z(W,V,Y,X,I,14,B[30]),X=z(X,W,V,Y,Q,20,B[31]),Y=A(Y,X,W,V,L,4,B[32]),V=A(V,Y,X,W,H,11,B[33]),W=A(W,V,Y,X,m,16,B[34]),X=A(X,W,V,Y,M,23,B[35]),Y=A(Y,X,W,V,G,4,B[36]),V=A(V,Y,X,W,N,11,B[37]),W=A(W,V,Y,X,I,16,B[38]),X=A(X,W,V,Y,n,23,B[39]),Y=A(Y,X,W,V,O,4,B[40]),V=A(V,Y,X,W,T,11,B[41]),W=A(W,V,Y,X,P,16,B[42]),X=A(X,W,V,Y,J,23,B[43]),Y=A(Y,X,W,V,p,4,B[44]),V=A(V,Y,X,W,Q,11,B[45]),W=A(W,V,Y,X,K,16,B[46]),X=A(X,W,V,Y,S,23,B[47]),Y=y(Y,X,W,V,T,6,B[48]),V=y(V,Y,X,W,I,10,B[49]),W=y(W,V,Y,X,M,15,B[50]),X=y(X,W,V,Y,L,21,B[51]),Y=y(Y,X,W,V,Q,6,B[52]),V=y(V,Y,X,W,P,10,B[53]),W=y(W,V,Y,X,n,15,B[54]),X=y(X,W,V,Y,G,21,B[55]),Y=y(Y,X,W,V,H,6,B[56]),V=y(V,Y,X,W,K,10,B[57]),W=y(W,V,Y,X,J,15,B[58]),X=y(X,W,V,Y,O,21,B[59]),Y=y(Y,X,W,V,N,6,B[60]),V=y(V,Y,X,W,m,10,B[61]),W=y(W,V,Y,X,S,15,B[62]),X=y(X,W,V,Y,p,21,B[63]);
Z[0]=Z[0]+Y|0;Z[1]=Z[1]+X|0;Z[2]=Z[2]+W|0;Z[3]=Z[3]+V|0},_doFinalize:function(){var p=this._data,q=p.words,m=8*this._nDataBytes,r=8*p.sigBytes;q[r>>>5]|=128<<24-r%32;var n=F.floor(m/4294967296);q[(r+64>>>9<<4)+15]=(n<<8|n>>>24)&16711935|(n<<24|n>>>8)&4278255360;q[(r+64>>>9<<4)+14]=(m<<8|m>>>24)&16711935|(m<<24|m>>>8)&4278255360;p.sigBytes=4*(q.length+1);this._process();p=this._hash;q=p.words;for(m=0;4>m;m++){r=q[m],q[m]=(r<<8|r>>>24)&16711935|(r<<24|r>>>8)&4278255360}return p},clone:function(){var m=E.clone.call(this);m._hash=this._hash.clone();return m}});o.MD5=E._createHelper(w);o.HmacMD5=E._createHmacHelper(w)})(Math);var k=function(){j=this};k.prototype={payRequest:function(m,p,r,s,t,q,u,o,n,v){if(typeof WeixinJSBridge=="undefined"){console.log("error WeixinJSBridge is undefined");return}WeixinJSBridge.invoke("getBrandWCPayRequest",{"appId":m,"timeStamp":j._getTimeStamp(),"nonceStr":j._getNonceStr(),"package":j._getPackage(r,s,t,q,u,o,n),"signType":"SHA1","paySign":j._getSign(m,p)},function(w){if(w.err_msg=="get_brand_wcpay_requegetPackagest:ok"||w.err_msg=="get_brand_wcpay_request:ok"){v(true)}else{console.log(JSON.stringify(w));v()}})},_getPackage:function(u,v,x,s,y,r,o){var m="WX";var w="1";var z="GBK";var q=o;var t="bank_type="+m+"&body="+x+"&fee_type="+w+"&input_charset="+z+"&notify_url="+q+"&out_trade_no="+s+"&partner="+u+"&spbill_create_ip="+r+"&total_fee="+y+"&key="+v;var n=(""+f.MD5(t)).toUpperCase();m=encodeURIComponent(m);x=encodeURIComponent(x);w=encodeURIComponent(w);z=encodeURIComponent(z);q=encodeURIComponent(q);s=encodeURIComponent(s);u=encodeURIComponent(u);r=encodeURIComponent(r);y=encodeURIComponent(y);var p="bank_type="+m+"&body="+x+"&fee_type="+w+"&input_charset="+z+"&notify_url="+q+"&out_trade_no="+s+"&partner="+u+"&spbill_create_ip="+r+"&total_fee="+y;p=p+"&sign="+n;h=p;return p},_getSign:function(s,r){var p=s;var q=r;var t=g;var n=h;var o=l;var m="appid="+p+"&appkey="+q+"&noncestr="+t+"&package="+n+"&timestamp="+o;sign=f.SHA1(m).toString();return sign},_getTimeStamp:function(){if(l){return l}var m=new Date().getTime();var n=m.toString();l=n;return n},_getNonceStr:function(){if(g){return g}var o="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";var m=o.length;var n="";for(i=0;i<32;i++){n+=o.charAt(Math.floor(Math.random()*m))}g=n;return n}};return new k()})();var d=(function(){var g="undefined";function f(){WeixinJSBridge.invoke("getNetworkType",{},function(j){g=j.err_msg})}function h(){return g}if(typeof WeixinJSBridge=="undefined"){if(document.addEventListener){document.addEventListener("WeixinJSBridgeReady",f,false)}else{if(document.attachEvent){document.attachEvent("WeixinJSBridgeReady",f);document.attachEvent("onWeixinJSBridgeReady",f)}}}else{f()}return h})();var b=(function(){return function(){WeixinJSBridge.call("hideOptionMenu")}})();var e=(function(){return function(){WeixinJSBridge.invoke("closeWindow",{},function(f){})}})();window.WX={Share:c,Pay:a,getNetworkType:d,hideMenu:b,closeWindow:e}})();