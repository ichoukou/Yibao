var wechat = this;
var wx = require('wechat');
var wechatAPI = require('wechat-api');
var OAuthAPI = require('wechat-oauth');
var config = require('../config');

var tokenApi = require('./token');
//var User = require('../Model/User');
//var messenger = require('../client/message');
var Q = require('q');

// API 的初始化
var oauthapi = new OAuthAPI(
	config.wxClient.appid, config.wxClient.appsec,
	function(openid, cb) {
		tokenApi.readFactory('oauth-token-'+openid)(cb);
	},
	function(openid, token, cb) {
		tokenApi.writeFactory('oauth-token-'+openid)(token, cb);
	});

var wxapi = new wechatAPI(
	config.wxClient.appid,config.wxClient.appsec,
	tokenApi.readFactory('wxapi-token'),
	tokenApi.writeFactory('wxapi-token'));

// For js-sdk
wxapi.registerTicketHandle(function(type, cb) {
	tokenApi.readFactory('js-token')(cb);
}, function(type, token, cb) {
	tokenApi.writeFactory('js-token')(token, cb);
});


var signInfo = function(url) {
	var d = Q.defer();
	var params = {
		debug: false,
		jsApiList: ['onMenuShareTimeline', 'onMenuShareAppMessage'],
		url: url
	};
	wxapi.getJsConfig(params, function(err, result) {
		if(err) return d.reject(err);
		return d.resolve(result);
	});
	return d.promise;
};


wechat.wxAPI = wxapi;
wechat.oauthAPI = oauthapi;
wechat.signInfo = signInfo;


function sendContent(name) {
	var obj = this;
	tokenApi.read(name).then(function(record) {
		obj.reply(record);
	});
}
wxapi.sendCustomKey = function(openid,key) {
	var self = this;
	tokenApi.read(key).then(function(content) {
		self.sendText(openid,content, function(err, result) {
			if(err) 
				return console.log('send Custom msg error: ',err);
			console.log('[sendCustomKey] send success');
			
		});
	});
};






// wxHandler
/* wechat.wxHandler = wx(config.wxClient)
   .text(function(message,req,res,next) {
   console.log('[wechat.js] wxMsg   : ', message);
   var openid = message.FromUserName;
   res.sendContent = sendContent;
   // 文字处理分为`关键字处理` 与 `人工处理部分`
   if(message.Content == '关注'){
   res.sendContent('WELCOME');
   }else{
   res.reply("");
   }
   
   messenger.sendChatToMnger(openid, '558d63051d277a2d021efaf8', message.Content);

   }).event(function(event,req,res,next) {
   console.log('[wechat.js] wxEvent : ', event);
   var openid = event.FromUserName;
   res.sendContent = sendContent;

   if(event.Event == 'subscribe'){
   res.sendContent('WELCOME');
   wxapi.sendCustomKey(openid,'KEFU_WELCOME');
   User.findOne({openid:openid}).then(function(user) {
   if(!user){
   // 用户第一次进入系统，自动为其创建数据库
   var newuser = new User({
   openid : openid,
   verify : {ing : false},
   status : 'CHAT'
   });
   newuser.save();
   }
   });

   
   }
   }).middlewarify(); */
