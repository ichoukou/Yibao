/**
 * Created by tzr4032369 on 2015/12/9.
 */
var express = require('express');
var cookieParser = require('cookie-parser');
var router = express.Router();
var WechatUser = require('../lib/Model/WechatUser');
var WechatVote = require('../lib/Model/WechatVote');


//使用一个指定用户进行测试
router.get('/debugLogin', function(req,res,next) {
	var openid = req.query.openid || "";
	res.cookie('sessionid', openid + "@" + Date.now(), {signed:true});
	res.send('你获得了一个合法的cookie').end();
});


var util = require('util');
var querystring = require('querystring');
var Q = require('q');
var wechat = require('../lib/wechatApi');
var wxapi = wechat.wxAPI;
var oauthapi = wechat.oauthAPI;
var config = require('../config');
var upload = require('../lib/upload');

//报名
router.use('/signUp', cookieParser('yibao2015'));
router.post('/signUp',function(req,res,next){
	if(!req.signedCookies.sessionid)
		return next(new Error('no Auth'));
	
	var openid = req.signedCookies.sessionid.split('@')[0];	
	var nickname = req.body.nickname;
	var telephone = req.body.telephone;
	var workname = req.body.workname;
	var grade = req.body.grade;
	var detailGrade = req.body.detailGrade;
	var mediaId = req.body.mediaId;

	if(!mediaId)
		return next(new Error('no Auth'));


	wxapi.getMedia(mediaId,function(err, result, response) {
		upload.imageBuffer(result).then(function(imgUrl) {
			
			console.log('uploaded To oss, url :', imgUrl);
			if(openid && nickname && telephone && workname && grade && imgUrl){
				var updateObj =  {
					nickname : nickname,
					grade : grade,
					detailGrade : detailGrade,
					telephone : telephone,
					workname : workname,
					picUrl : imgUrl,
					createTime : Date.now(),
					editTime : Date.now()
				};
				WechatUser.findOneAndUpdate({_id : openid}, {$set : updateObj}, {new : true}).then(function(user){
					console.log('User create ok');
					res.f(0,{newuser:user});
				}).then(null,function(err){
					console.log('User create error', err);
					res.f(1007,{msg:err});
				});
			}else{
				var err = new Error('no enough params');
				err.status = 500;
				next(err);
			}
		});
	});
	
	

});

//投票
router.use('/vote', cookieParser('yibao2015'));
router.post('/vote',function(req,res,next){
	if(!req.signedCookies.sessionid)
		return next(new Error('no Auth'));
	
	var openid = req.signedCookies.sessionid.split('@')[0];	
	var voted_id = req.body.voted_id;
	if(openid==voted_id){
		return res.f(0,{msg:"不能为自己投票"});
	}
	var newVote = {
		voter:openid,
		voted:voted_id,
	};
	if(openid){
		WechatUser.findOne({openid:openid}).then(function(user){

			console.log('voting user', user);
			if(user.voteTimes>=3){
				return res.f(0,{msg:"不能超过3次"});
			}
			WechatVote.findOne({voter:openid , voted:voted_id}).then(function(vote){

				if(vote)
					return res.f(0,{msg : "DUPLICATE"});
				
				WechatVote.create(newVote).then(function(newvote){
					WechatUser.findOne({_id:voted_id}).then(function(votedUser){
						user.voteTimes++;
						user.save();
						votedUser.voteNum++;
						votedUser.save();
						return res.f(0,{newvote:newvote});
					});
				}).then(null,function(err){
					res.f(1010,{msg:err});
				})
			});
		});
	}else
	{
		var err = new Error('no enough params');
		err.status = 500;
		next(err);
	}
});

//获取用户画作
router.use('/allWorks', cookieParser('yibao2015'));
router.post('/allWorks',function(req,res,next){

	if(!req.signedCookies.sessionid)
		return next(new Error('no Auth'));
	
	var openid = req.signedCookies.sessionid.split('@')[0];	
	//var openid = 'oFjuPjkZcXLYxamJNcPXQbfDiB54';


	console.log('req.body : ', req.body);
	var uid = openid;
	var type = req.body.type || 'time';
	var start = req.body.start || "1900-01-01 00:00:00";
	var end = req.body.end  || "2299-01-01 00:00:00";
	var num = req.body.num || 100;
	var query = {createTime : {"$gt" : start, "$lt" : end}};
	if(openid && type){
		if(type == 'time'){
			WechatUser.find(query).limit(num).sort({'createTime':-1}).then(function(userWorks){
				console.log('all works : ', userWorks);

				WechatVote.find({voter:uid}).then(function(votes){
					console.log('found votes : ', votes);
					for(var i in userWorks){
						userWorks[i] = userWorks[i].toJSON();
						userWorks[i].isVote = false;
						for(var j in votes){
							if(votes[j].voted == userWorks[i]._id){
								userWorks[i].isVote = true;
							}
						}
					}
					res.f(0,{userWorks:userWorks});
				},function(err) {
					console.log('Vote find error ', err);
				})
			}).then(null,function(err){
				res.f(1009,{msg:err});
			})
		}else{
			WechatUser.find(query).limit(num).sort({'voteNum':-1}).then(function(userWorks){
				WechatVote.find({voter:uid}).then(function(votes){
					for(var i in userWorks){
						userWorks[i] = userWorks[i].toJSON();
						userWorks[i].isVote = false;
						for(var j in votes){
							if(votes[j].voted == userWorks[i]._id ){
								userWorks[i].isVote = true;
							}
						}

					}
					res.f(0,{userWorks:userWorks});
				})
			}).then(null,function(err){
				res.f(1009,{msg:err});
			})
		}
	}else{
		var err = new Error('no type parameter');
		err.status = 500;
		next(err);
	}
});


//获取用户信息
router.use('/userById', cookieParser('yibao2015'));
router.post('/userById', function (req,res,next) {
	if(!req.signedCookies.sessionid)
		return next(new Error('no Auth'));
	
	var openid = req.signedCookies.sessionid.split('@')[0];	
	var voter_id = openid;
	var voted_id = req.body.voted_id;

	console.log('userById : ', openid, req.body);
	if (voted_id) {
		WechatUser.findOne({_id: voted_id}).then(function (userWork) {
			
			WechatVote.find({voter: voter_id}).then(function (votes) {
				if (!userWork) {
					return res.f(0,{userWork : {}});
				}

				
				userWork = userWork.toJSON();
				userWork.isVote = false;
				for (var j in votes) {
					if (votes[j].voted== userWork._id) {
						userWork.isVote = true;
					}
				}
				res.f(0, {userWork: userWork});
			})
		})
	}else if(openid){
		console.log('openid : ', openid);
		WechatUser.findOne({_id : openid}).then(function(user) {
			return res.f(0,{userWork : user});
		});
	}else{
		var err = new Error('no enough parameters');
		err.status = 500;
		next(err);
	}
});


// 客户端的接口，用于客户访问的时候使用cookie进行登录
//   如果存在cookie则相信cookie中的openid,
//   如不存在cookie则去访问weixin Oauth获取openid
//   e.g.   http://yibaoedu.com/wechat/auth?page=HOME&scope=BASE 访问home页面
//   page - 需要跳转的页面
//   scope - BASE 只获得基本的openid信息, INFO 可获得用户的姓名，头像、等等高级信息
router.use('/auth', cookieParser('yibao2015'));
router.get('/auth', function(req,res,next) {
	var openid;
	var querys = {};
	querys = util._extend(querys, req.query);
	var page = querys.page = req.query.page || 'HOME';
	var scope = querys.scope = req.query.scope || 'BASE';
	var baseUrl = "http://yibaoedu.com/wechat";
	var code = req.query.code || "";
	var appid = config.wxClient.appid;
	var redirectUrl = baseUrl + "/auth?" + querystring.stringify(querys);
	redirectUrl = encodeURIComponent(redirectUrl);
	
	console.log('[Wechat.js /auth] redirectUrl : ', redirectUrl);
	
	var oauthUrl = "https://open.weixin.qq.com/connect/oauth2/authorize?appid="+
		appid+"&redirect_uri="+redirectUrl+
		"&response_type=code&scope="+ (scope==="INFO"?'snsapi_userinfo' : "snsapi_base") +"&state=0";
	var oDefer = Q.defer(); 	//获得openid用的defer
	var uDefer = Q.defer();		//获得userinfo用的defer
	var cachedUser;
	if(req.signedCookies.sessionid && !code){
		openid = req.signedCookies.sessionid.split('@')[0];
		if(openid && scope === "BASE")
			oDefer.resolve(openid);
		else if(openid && scope === "INFO"){
			if(req.signedCookies.nickname){
				cachedUser = {
					nickname : req.signedCookies.nickname,
					headimgurl : req.signedCookies.headimgurl
				};
				oDefer.resolve(openid);
			}else{
				oDefer.reject();
			}
		}else
		oDefer.reject();
	}else{
		if(!code) oDefer.reject();
		else
			oauthapi.getAccessToken(code,function(err,result) {
				if(err) return oDefer.reject(err);
				return oDefer.resolve(result.data.openid);
			});
	}
	
	// 通过各种验证获得openid
	oDefer.promise.then(function(openid) {
		res.cookie("sessionid", openid+'@'+Date.now(), {signed:true});
		req.openid = openid;
		if(scope === 'INFO'){
			if(!cachedUser)
				oauthapi.getUser(openid,function(err,result) {
					if(err) return uDefer.reject(err);
					return uDefer.resolve(result);
				});
			else
				uDefer.resolve(cachedUser);
		}else{
			uDefer.resolve();
		}
	}).then(null,function(err) {
		// 如果获取失败则访问oauthUrl
		res.redirect(oauthUrl);
	});
	// 获得userinfo或为空
	uDefer.promise.then(function(userinfo) {
		if(userinfo){
			res.cookie("nickname", userinfo.nickname, {signed:true});
			res.cookie("headimgurl", userinfo.headimgurl, {signed:true});
		}
		req.userinfo = userinfo;
		req.url = '/page/'+page + '?' + querystring.stringify(querys);
		next();
	});
});
// '/page/PAGE_NAME' 这种形式的链接用于将
// http://herong.huasheng.io/client/auth?page=VOTEHOME&scope=BASE 这种页面route至此

// debug 的时候可以使用/page/VOTEHOME?openid=1232xxs 这种形式进行登录
router.use('/page/VOTE_HOME', function(req,res,next){
	var openid = req.openid || req.query.openid;
	
	console.log('[/page/VOTEHOME] user\'s openid is : ', openid);
	if(!openid)
		return next(new Error('no auth'));

	
	
	// query user
	/* upsert: true  如果存在则取出，不在则创建 */
	WechatUser.findOneAndUpdate({_id : openid},{$set : {openid : openid}}, {upsert:true}).then(function(user) {
		
		/* 在这将相关的user的信息render到前端 */
		res.render('../public/vote/index',{
			/* 填入相关对象 */	
			layout : false
		});
	}).then(null, function(err) {
		next(err);
	});
});

// '/page/PAGE_NAME' 这种形式的链接用于将
// debug 的时候可以使用/page/VOTEHOME?openid=1232xxs 这种形式进行登录
router.use('/page/VOTE_INVITE', function(req,res,next){
	var openid = req.openid || req.query.openid;
	var memberid = req.query.memberid || "";
	
	console.log('[/page/VOTEHOME] user\'s openid is : ', openid);
	if(!openid || !memberid)
		return next(new Error('no auth'));

	/* upsert: true  如果存在则取出，不在则创建 */
	WechatUser.findOneAndUpdate({_id : openid},{$set : {openid : openid}}, {upsert:true}).then(function(user) {

		/* 在这将相关的user的信息render到前端 */
		res.render('../public/vote/vote',{
			/* 填入相关对象 */
			memberid : memberid,
			layout : false
		});
	}).then(null, function(err) {
		next(err);
	});

	
});


router.use('/page/VOTE_ENROLL', function(req,res,next){
	var openid = req.openid || req.query.openid;
	/* upsert: true  如果存在则取出，不在则创建 */
	WechatUser.findOneAndUpdate({openid : openid},{$set : {openid : openid}}, {upsert:true}).then(function(user) {


		if(user.picUrl && user.nickname){
			return res.redirect('/wechat/auth?page=VOTE_INVITE&memberid='+user._id);
		}
		
		/* 在这将相关的user的信息render到前端 */
		res.render('../public/vote/enroll',{
			/* 填入相关对象 */
			layout : false
		});
	}).then(null, function(err) {
		next(err);
	});
	
});




// 用于js-sdk 的签名
router.get('/jssdkSign', function(req,res,next) {
	var tosign = req.query.url;
	wechat.signInfo(tosign).then(function(signObj) {
		return res.f(0,signObj);
	}).then(null, function(err) {
		next(err);
	});
});





module.exports=router;
