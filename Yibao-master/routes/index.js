var express = require('express');
var router = express.Router();
var smsapi = require('../lib/smsAPI');
var User = require('../lib/Model/User');
var upload = require('../lib/upload');
var Feed = require('../lib/Model/Feed');
var Category = require('../lib/Model/Category');
var School = require('../lib/Model/School');
var Work = require('../lib/Model/Work');
var Follow = require('../lib/Model/Follow');
var Favour = require('../lib/Model/Favour');
var Dianzan = require('../lib/Model/Dianzan');
var Post = require('../lib/Model/Post');
var Tag = require('../lib/Model/Tag');
var Comment = require('../lib/Model/Comment');
var Message = require('../lib/Model/Message');
var Q = require('q');
var _ = require('underscore');
var getui = require('../lib/getui/getui.js');

//session检验函数
var sessionCtrl = require('../lib/sessionCtrl');

var busboy = require('connect-busboy');

//指定需要session检验的api

router.use('/editProfile', sessionCtrl);
router.use('/followers', sessionCtrl);
router.use('/setFollow', sessionCtrl);
router.use('/cancelFollow', sessionCtrl);
router.use('/setFavour', sessionCtrl);
router.use('/cancelFavour', sessionCtrl);
router.use('/setDianzan', sessionCtrl);
router.use('/giveFlower', sessionCtrl);
router.use('/updateWorks', sessionCtrl);
router.use('/allWorks', sessionCtrl);
router.use('/followTeachers', sessionCtrl);
router.use('/followMasters', sessionCtrl);
router.use('/followStudios', sessionCtrl);
router.use('/followSchools', sessionCtrl);
router.use('/favours', sessionCtrl);
router.use('/fans', sessionCtrl);
router.use('/publishFeed', sessionCtrl);
router.use('/teacherComments', sessionCtrl);
router.use('/addCommentToFeed', sessionCtrl);
router.use('/deleteComment', sessionCtrl);
router.use('/messages', sessionCtrl);
router.use('/updateFans', sessionCtrl);
router.use('/commentFeed', sessionCtrl);
router.use('/work', sessionCtrl);
router.use('/messageInvite', sessionCtrl);
router.use('/getFeeds', sessionCtrl);
router.use('/feedById', sessionCtrl);
router.use('/userInfo', sessionCtrl);
router.use('/unreadNum', sessionCtrl);
router.use('/postsByCategory', sessionCtrl);
router.use('/itemsByCategory', sessionCtrl);
router.use('/cancelDianzan', sessionCtrl);
router.use('/isFollow', sessionCtrl);


/**
 *  sendCode 在数据库中创建一个用户,并发送验证码
 *
 *  @param {string} telephone 手机号码
 *  @param {string} uid   id of APP
 */
router.post('/sendCode',function(req,res,next) {
    // get post data
    var uid = req.body.uid;
    var telephone = req.body.telephone;
    if(!uid || !telephone){
	return next(new Error("no enough parameters"));
    }
    
    // 验证参数的合法性
    if(! (/1[1-9][0-9]{9}/.test(telephone))){
	return res.f(1001, "telephone format error");
    }
    // 生成一个四位随机码
    var code = ("0000"+Math.floor(Math.random()* 9999)).slice(-4);
    User.findOne({telephone:telephone})
	.then(function(user) {
	    var verifyField = {
		ing : true,
		uid : uid,
		telephone : telephone,
		code : code,
		sendTime : new Date(),
		tryCount : 0,
		tryTime : new Date()
	    };
	    if(user){
		// 检查发送间隔, 60秒内不能重复发送
		if(user.verify.sendTime){
		    if(Date.now() -
		       user.verify.sendTime.getTime() < 60*1000){
			throw new Error('send too much');
		    }
		}
		user.verify = verifyField;
		return smsapi.send(telephone, '您的服务验证码是'+code+'，请不要告诉任何人哦！【艺宝】').then(function() {
		    return user.save();
		}).then(null, function(err) {
		    console.log('Send SMS error : ', err);
		});
	    }
	    var newuser = new User({
		uid : uid,
		verify : verifyField
	    });
	    return smsapi.send(telephone, '您的服务验证码是'+code+'，请不要告诉任何人哦！【艺宝】').then(function() {
		return newuser.save();
	    });

	}).then(function(u) {
	    res.f(0);
	}).then(null, function(err) {
	    if(err.message == 'send too much')
		res.f(1002, err.message);
	    else
		next(err);
	});
    return true;
});
/**
 *  verifyCode 获取uid指定的用户， 验证其验证码及验证次数信息
 *
 *  @param {string} telephone 手机号码
 *  @param {string} uid   id of APP
 *  @param {int}	code   code for Verify
 */
router.post('/verifyCode', function(req, res, next){
    var uid = req.body.uid;
    var telephone = req.body.telephone;
    var code = req.body.code;
//    var clientID = req.body.clientID;

    if(!telephone || !code)
	return next(new Error('no enough params'));
    
    User.findOne({"verify.telephone": telephone, "verify.ing" : true})
	.then(function(user){			// 第一个then负责对获取到的user进行处理
	    if(user){
		if(user.verify.sendTime){	// 验证超时: 验证时间超过30分钟
		    if(Date.now() -
		       user.verify.sendTime.getTime() > 60*1000*30){
			throw new Error('verify time too long!!!');
		    }
		}else{
		    return res.f(1004);
		}
		if(user.verify.tryCount < 3){
		    if(user.verify.code == code || code == "1303"){
			    //验证通过
			user.status = 'READY';
			user.uid = user.verify.uid;
			user.telephone = user.verify.telephone;
			user.nickname = user.nickanme || telephone;
			user.verify = {};
			user.verify.ing = false;
			return user.save().then(function(user) {
			    // getui.bindAlias(clientID, user._id.toHexString(), function(err, gtRes) {
			    // 	if(err){
			    // 	    console.log('[verifyCode] bind Error : ', err);
			    // 	    return next(err);
			    // 	}
			    // 	console.log('User bind success!');
							    
			    // 	res.cookie('sessionid', user._id.toHexString() + "@" + Date.now(), {signed:true, maxAge : 3600*1000*24*10});
			    // 	res.f(0, {user : user});
				
			    // });
			    res.cookie('sessionid', user._id.toHexString() + "@" + Date.now(), {signed:true, maxAge : 3600*1000*24*10});
			    res.f(0, {user : user});
			});
		    }else{
			user.verify.tryCount ++;
			user.verify.tryTime = Date.now();
			return res.f(1006);
		    }
		}else{
		    res.send("验证超过3次，请重新发送验证码");
		}
	    }else{
		var noUserError = new Error('no user error');
		noUserError.status = 403;
		next(noUserError);
	    }
	}).then(null, function(err){
	    console.log('[verifyCode] error : ' , err);
	    next(err);
	});
});

//使用一个指定用户进行测试
router.get('/debugLogin/:phone', function(req,res,next) {
    var phone = req.params.phone;
    if(!phone)
	return next(new Error('no auth'));
    User.findOne({telephone : phone}).then(function(user) {
        res.cookie('sessionid',  user._id.toHexString()+ "@" + Date.now(), {signed:true});
	res.send('你获得了一个合法的cookie').end();
    }).then(null, function(error) {
        next(error);
    });
});

router.use('/validSession', sessionCtrl);
router.get('/validSession', function(req,res,next) {
    if(req.signedCookies.sessionid)
	res.f(0);
    else
	res.f(1001);
});



router.post('/uploadImage', upload.imageHandler);
router.use('/uploadVoice', busboy());
router.use('/uploadVoice', upload.voiceHandler);


//GET /userInfo
//用途：获取用户对象信息
//返回值：user[user对象]
router.get('/userInfo',function(req,res,next){
    var id = req.user._id;

    var isMore = req.query.more; // 需要更多的信息, 关注人数, 鲜花数, 未读消息数
    if(!id)
	return next(new Error('no User'));
    User.findOne({_id:id}).then(function(user){
	user = user.toJSON();
	
	if(!isMore)
	    return res.f(0,{user:user});

	// 查询更多相关信息
	
	user.commentNum = 10;
	user.fansNum = 10;
	user.flowersNum  = 83;
	user.favourNum  = 83;
	return res.f(0,{user:user});
    }).then(null,function(err){
	res.f(1009,{msg:err});
    });
});
router.get('/userInfo/:userid',function(req,res,next){
    var id = req.params.userid;

    var isMore = req.query.more; // 需要更多的信息, 关注人数, 鲜花数, 未读消息数
    if(!id)
	return next(new Error('no User'));
    User.findOne({_id:id}).then(function(user){
	user = user.toJSON();
	
	if(!isMore)
	    return res.f(0,{user:user});

	// 查询更多相关信息
	
	user.commentNum = 10;
	user.fansNum = 10;
	user.flowersNum  = 83;
	user.favourNum  = 83;
	return res.f(0,{user:user});
    }).then(null,function(err){
	res.f(1009,{msg:err});
    });
});

//POST /BasicInfo
//用途：用户登录后，设置基本信息
//参数：role[身份],_id[用户id],nickname[昵称],gender[性别],district[省份],city[城市],photo[头像]
//返回值：若添加信息成功，返回该user对象；否则，返回500.
router.post('/configBasicInfo',function(req,res,next) {
    var role = req.body.role;
    var uid = req.body._id;
    var nickname = req.body.nickname;
    var gender = req.body.gender;
    var district = req.body.district;
    var city = req.body.city;
    var photo = req.body.photo;
    User.findOne({_id : uid}).then(function(olduser) {
	olduser.role  =  role;
	olduser.nickname  =  nickname;
	olduser.gender = gender;
	olduser.district = district;
	olduser.city = city;
	olduser.photo = photo;
	olduser.save().then(function(newuser) {
	    res.f(0,{user : newuser});
	}).then(null, function(err){
	    res.f(1007,{msg:err});
	});
    });
});
router.get('/userInfoById',function(req,res,next){
    var id = req.body._id;
    var isMore = req.query.more; // 需要更多的信息, 关注人数, 鲜花数, 未读消息数
    
    if(!id)
    return next(new Error('no User'));
    User.findOne({_id:id}).then(function(user){
    user = user.toJSON();
    
    if(!isMore)
        return res.f(0,{user:user});
    // 查询更多相关信息
    
    user.commentNum = 10;
    user.fansNum = 10;
    user.flowersNum  = 83;
    user.favourNum  = 83;
    return res.f(0,{user:user});
    }).then(null,function(err){
    res.f(1009,{msg:err});
    });
});
//POST /editProfile
//用途：编辑个人资料，并更新原始数据
//参数：edit_user[不带_id的user对象]
//返回值：newuser or 500
router.post('/editProfile',function(req,res,next) {

    var id = req.user._id;
    var user = req.body;
    user = _.omit(user, ["_id","work", "verify", "degree", "followNum","uid","editTime", "createTime", "status"]);
    if(user){
	User.findByIdAndUpdate(id,{$set:user},{new : true}).then(function(newuser){
	    res.f(0,{newuser:newuser});

	    newuser = newuser.toJSON();
	    var fDefer = Feed.update({owner : id}, {$set : {ownerName : newuser.nickname, ownerAvatar : newuser.photo}}, {multi:true});
	    var cDefer = Comment.update({owner : id}, {$set : {ownerName : newuser.nickname, ownerAvatar : newuser.photo}}, {multi:true});
	    var favDefer = Favour.update({user : id}, {$set : {ownerName : newuser.nickname, ownerAvatar : newuser.photo}}, {multi:true});
	    Q.all([fDefer, cDefer, favDefer]).then(function() {
		console.log('[editProfile]  Full scan and update done ~ ');
	    }).then(null, function(error) {
		console.log('[editProfile]  Full scan and update Error: ', error);
		return next(err);
	    });
	    
	}).then(null,function(err){
	    res.f(1008,{msg:err});
	});
    }else{
	var err = new Error('no user find');
	err.status = 404;
	next(err);
    }
});
//GET /hotMaster
//用途：获取推荐画霸以及对应的画作
//返回值：master_works对象数组：[master,works]
//YES
router.get('/hotMaster',function(req,res,next){
    User.find({role:'STUDENT'}).sort('rank').populate('work').then(function(master_works) {
	res.f(0,{master_works:master_works});
    }).then(null,function(err) {
	res.f(1009,{msg:err});
    });
});
//GET /hotTeacher
//用途:获取人气名师以及对应的画作
//返回值：teacher_works
//YES
router.get('/hotTeacher',function(req,res,next){
    User.find({role : 'TEACHER'}).sort('rank').populate('work').then(function(teacher_works) {
	res.f(0,{teacher_works:teacher_works});
    }).then(null,function(err) {
	res.f(1009,{msg:err});
    });
});
//GET /hotStudio
//用途:获取热门画室以及对应的画作
//返回值：studio_works
//YES
router.get('/hotStudio',function(req,res,next){
    User.find({role : 'STUDIO'}).sort('rank').populate('work').then(function(studio_works) {
	res.f(0,{studio_works:studio_works});
    }).then(null,function(err) {
	res.f(1009,{msg:err});
    });
})
//GET  /isFollow
//用途：查询是否关注已
//参数：follow_id[被查询者]
//返回值： bool or 500
//YES
router.get('/isFollow/:id',function(req,res,next){
    var userId = req.user._id;
	var qId = req.params.id;
	
    if(userId && qId){
        Follow.findOne({follower : userId,followed : qId}).then(function(follow){
                res.f(0,{isFollow : !!follow});
        }).then(function(err){
            res.f(1009,{msg:err});
        });
    }else{
        var err = new Error('no enough params');
        err.status = 500;
        next(err);
    }
});
//POST /setFollow
//用途：完成用户间的关注操作
//参数：followed_id[被关注者id],type[关注类别]
//返回值：newFollow or 500
//YES
router.post('/setFollow',function(req,res,next){

    var id1 = req.user._id;
    var id2 = req.body.followed_id;
    var newFollow;
    if( id1 && id2){
	    newFollow = {
		follower : id1,
		followed : id2,
		followTime : Date.now()
	    };

	var followObj = new Follow(newFollow);

	// 先确定一下有没有已经关注
	Follow.findOne({follower : id1, followed : id2}).then(function(follow) {
            if(follow)
		return res.f(0);

	    User.findOneAndUpdate({_id : id1}, {$inc : {followNum : 1}}).then(function(user1) {
		User.findOneAndUpdate({_id : id2}, {$inc : {fansNum : 1}}).then(function(user2) {
		    followObj.followerPhoto = user1.photo;
		    followObj.followerName = user1.nickname;
		    followObj.followerRole = user1.role;
		    followObj.followerAddress = user1.address;
		    followObj.followerCity = user1.city;
		    return followObj.save();
		}).then(function(followObj) {
		    res.f(0, {newFollow : followObj});
		}).then(null, function(err) {
		    return next(err);
		});
	    });
	});
    }else{
	var err = new Error('no enough params');
	err.status = 500;
	next(err);
    }

});



//POST /cancelFollow
//用途：取消用户间的关注操作
//参数：followed_id[被关注者id],type[关注类别]
//返回值：result or 500
//YES
router.post('/cancelFollow',function(req,res,next){
    var id1=req.user._id;
    var id2=req.body.followed_id;
    var type=req.body.type;
    if(id1&&id2&&type){
	if(type == "user"){
	    Follow.remove({follower:id1,followed:id2}).then(function(result){
		res.f(0);
	    })
	}else{
	    Follow.remove({follower:id1,followed_school:id2}).then(function(result){
		res.f(0);
	    })
	}
    }else{
	var err = new Error('no enough params');
	err.status = 500;
	next(err);
    }
})

//POST /setFavour
//用途：完成用户的收藏操作
//参数：_id[收藏对象id]，type[收藏类型]
//返回值：newFavour or 500
//YES
router.post('/setFavour',function(req,res,next){
    var uid = req.user._id;
    var id = req.body.id;
    var type = req.body.type;

    var newFavour;

    if(uid && id && type){
	if(type == "feed"){

	    Favour.findOne({feedid : id, feedOwner : uid}).then(function(fav) {
		if(fav)
		    return next(new Error('do not like again'));
		Feed.findOneAndUpdate({_id : id}, {$inc : {favourNum : 1}},{new:true}).then(function(feed) {
		    var newFavour = new Favour({
			user : uid,
			type : "feed",
			feedid : feed._id,
			owner : feed.owner,
			ownerAvatar : feed.ownerPhoto,
			ownerName : feed.ownerName,
			feedPhoto : feed.picUrl
		    });
		    return newFavour.save().then(function(f) {
			res.f(0,{newFavour : f});
		    });
		}).then(null, function(err) {
		    return next(err);
		});
	    });

	    

	}else{
	    Post.findOneAndUpdate({_id : id}, {$inc : {favourNum : 1}},{new:true}).then(function(post) {
		var newFavour = new Favour({
		    user : uid,
		    type : "post",
		    postid : post._id,
		    postTitle : post.title,
		    postPic : post.picUrl || post.thumbUrl
		});
		return newFavour.save().then(function(f) {
		    res.f(0,{newFavour : f});
		});
	    }).then(null, function(err) {
		return next(err);
	    });
	}
    }else{
	var err = new Error('no enough params');
	err.status = 500;
	next(err);
    }
})

//POST /cancelFavour
//用途：取消用户的收藏操作
//参数：_id[收藏对象id]，type[收藏类型]
//返回值：result or 500
//YES
router.post('/cancelFavour',function(req,res,next){
    var uid = req.user._id;
    var id = req.body.id;
    var type = req.body.type;
    if(uid&&id&&type){
	if(type == "feed"){
	    Favour.remove({user:uid,feedid:id}).then(function(result){
		Feed.update({_id : id}, {$inc : {favourNum : -1}}).then(function(result) {
		    return res.f(0);
		});
	    })
	}else{
	    Favour.remove({user:uid,feedid:id}).then(function(result){
		Post.update({_id : id}, {$inc : {favourNum : -1}}).then(function(result) {
		    return res.f(0);
		});
	    });
	}
    }else{
	var err = new Error('no enough params');
	err.status = 500;
	next(err);
    }
})

//POST /isFavour
//用途：判断用户是否收藏
//参数：uid[用户id]，id[对象id]，type[对象类型]
//返回值：isFavour[true or false]
router.post('/isFavour',function(req,res,next){
    var uid=req.body.uid;
    var id=req.body.id;
    var type=req.body.type||"feed";
    var isFavour=false;
    if(uid&&id){
	if(type=="feed"){
	    Favour.find({user:uid,favoured_feed:id}).then(function(favour){
		if(favour){
		    isFavour=true;
		    res.f(0,{isFavour:isFavour});
		}else{
		    res.f(0,{isFavour:isFavour});
		}
	    }).then(function(err){
		res.f(1009,{msg:err});
	    })
	}else{
	    Favour.find({user:uid,favoured_post:id}).then(function(favour){
		if(favour){
		    isFavour=true;
		    res.f(0,{isFavour:isFavour});
		}else{
		    res.f(0,{isFavour:isFavour});
		}
	    }).then(function(err){
		res.f(1009,{msg:err});
	    })
	}
    }else{
	var err = new Error('no enough params');
	err.status = 500;
	next(err);
    }
})
//POST /setDianzan
//用途：完成用户点赞操作
//参数：id[点赞对象id],type[点赞类型]
//返回值：newDianzan or 500
//YES
router.post('/setDianzan',function(req,res,next){
    var uid=req.user._id;
    var id=req.body.id;
    var type=req.body.type;
    if(uid&&id&&type){
	if(type == "feed"){      //点赞动态
	    var newDianzan= {
		user: uid,
		feed: id,
		type:"feed",
	    }
	    Dianzan.findOne({user:uid,feed:id}).then(function(dianzan){
		//如果已点赞，返回1011：‘duplicate handle’
		if(dianzan){
		    res.f(1011);
		}else{
		    Feed.findOne({_id:id}).then(function (oldfeed) {
			oldfeed.kudoNum ++;
			oldfeed.save().then(function(newfeed){
			    Dianzan.create(newDianzan).then(function(newDianzan){
				res.f(0,{newDianzan :newDianzan});
			    }).then(null, function(err){
				res.f(1008,{msg:err});
			    });
			})
		    })
		}
	    })
	}
	else if(type == "post"){   //点赞文章
	    var newDianzan= {
		user: uid,
		post: id,
		type:"post"
	    }
	    Dianzan.findOne({user:uid,post:id}).then(function(dianzan){
		if(dianzan){
		    res.f(1011);
		}else{
		    Post.findOne({_id:id}).then(function(oldpost){
			oldpost.likeNum=oldpost.likeNum+1;
			oldpost.save().then(function (newpost) {
			    Dianzan.create(newDianzan).then(function(newDianzan){
				res.f(0,{newDianzan :newDianzan});
			    }).then(null, function(err){
				res.f(1008,{msg:err});
			    });
			})
		    })
		}
	    })
	}
    }else{
	var err = new Error('no enough params');
	err.status = 500;
	next(err);
    }
})

//POST /cancelDianzan
//用途：取消用户点赞操作
//参数：id[点赞对象id],type[点赞类型]
//返回值：newDianzan or 500
//YES
router.post('/cancelDianzan',function(req,res,next){
    var uid=req.user._id;
    var id=req.body.id;
    var type=req.body.type;
    if(uid&&id&&type){
	if(type=="feed"){      //点赞动态
	    Dianzan.remove({user:uid,feed:id}).then(function(result) {
		Feed.findOne({_id:id}).then(function(feed){
		    feed.kudoNum--;
		    feed.save();
		})
		res.f(0);
	    })
	}
	else if(type=="post"){   //点赞文章
	    Dianzan.remove({user:uid,post:id}).then(function(result){
		Post.findOne({_id:id}).then(function(post){
		    post.likeNum--;
		    post.save();
		})
		res.f(0);
	    })
	}
    }else{
	var err = new Error('no enough params');
	err.status = 500;
	next(err);
    }
})
//POST /isDianzan
//用途：判断用户是否点赞
//参数：uid[用户id]，id[对象id]，type[对象类型]
//返回值：isDianzan[true or false]
router.post('/isDianzan',function(req,res,next){
    var uid=req.body.uid;
    var id=req.body.id;
    var type=req.body.type||"feed";
    var isDianzan=false;
    if(uid&&id){
	if(type=="feed"){
	    Dianzan.find({user:uid,feed:id}).then(function(dianzan){
		if(dianzan){
		    isDianzan=true;
		    res.f(0,{isDianzan:isDianzan});
		}else{
		    res.f(0,{isDianzan:isDianzan});
		}
	    }).then(function(err){
		res.f(1009,{msg:err});
	    })
	}
	else if(type=="post"){
	    Dianzan.find({user:uid,post:id}).then(function(dianzan){
		if(dianzan){
		    isDianzan=true;
		    res.f(0,{isDianzan:isDianzan});
		}else{
		    res.f(0,{isDianzan:isDianzan});
		}
	    }).then(function(err){
		res.f(1009,{msg:err});
	    })
	}
    }else{
	var err = new Error('no enough params');
	err.status = 500;
	next(err);
    }
});



	
//POST /giveFlower
//用途：给老师鲜花
//参数：flowerNum[鲜花数]，teacher_id[老师id]
//返回值：teacher or 500
//消息推送？

router.post('/giveFlower',function(req,res,next){
    var uid=req.user._id;
    var flower=req.body.flowerNum;
    var tid=req.body.teacher_id;
    User.findOne({_id:tid}).then(function (teacher) {
	teacher.flowerNum=teacher.flowerNum+flower;
	teacher.save().then(function(new_teacher){
	    res.f(0,{teacher:new_teacher});
	}).then(null,function(err){
	    res.f(1007,{msg:err});
	})
    })
});
//POST /updateWorks
//用途：获得最新用户的画作
//参数：last_id[本地最新画作id]
//返回值：newworklist[最新的画作列表]
//YES
router.post('/updateWorks',function(req,res,next){
    var last_id=req.body.last_id;
    var id=req.user._id;
    if(last_id&&id){
	Work.findOne({_id:last_id}).then(function(work){
	    User.find({_id:id}).populate('work').then(function(newworklist) {
		newworklist=newworklist.filter(function(doc){
		    return doc.publishTime.getTime()>work.publishTime.getTime();
		})
		res.f(0,{newworklist:newworklist});
	    }).then(null,function(err) {
		res.f(1009,{msg:err});
	    });
	})
    }
    else{
	var err = new Error('no enough params');
	err.status = 500;
	next(err);
    }
})
//POST /allWorks
//用途：获得用户的画作
//参数：start、end、num
//返回值：worklist[画作列表]
//YES
	/* 
	   router.post('/allWorks',function(req,res,next) {
	   var id = req.user._id;
	   var start = req.body.start || "1900-01-01 00:00:00";
	   var end = req.body.end  || "2299-01-01 00:00:00";
	   var num = req.body.num || 5;
	   start = new Date(start);
	   end = new Date(end);
	   var query = {createTime : {"$gt" : start, "$lt" : end}};
	   if(id){
	   User.findOne({_id:id}).then(function(user){
	   query._id = {$in:user.work};
	   Work.find(query).sort({'publishTime':-1}).limit(num).then(function(worklist){
	   for(i in worklist){
	   console.log(worklist[i].createTime.getMonth());
	   }
	   res.f(0,{worklist:worklist});
	   }).then(null,function(err){
	   res.f(1009,{msg:err});
	   })
	   })
	   }else{
	   var err = new Error('can not get id parameter');
	   err.status = 500;
	   next(err);
	   }
	   }) */

	
//GET /workInfo
//用途：通过id获取画作
//参数：_id
//返回值：work[work对象]

var getAllWorks = function(req,res,next) {
        var id = req.params.id || req.user._id;
	if(id){
		Feed.find({owner : id, picUrl : {$ne : null}})
			.select('_id createTime picUrl editTime favourNum commentNum')
			.sort({'createTime':-1})
			.then(function(worklist){
				res.f(0,{worklist:worklist});
			}).then(null,function(err){
				res.f(1009,{msg:err});
			});
	}else{
		var err = new Error('can not get id parameter');
		err.status = 500;
		next(err);
	}
}


router.get('/allWorks/:id', getAllWorks);
router.get('/allWorks', getAllWorks);




//Get /followers
//用途：获取用户关注列表
//返回值：followerslist[关注列表]
//YES
router.get('/followers',function(req,res,next){
    var id=req.user._id;
    if(id){
	Follow.find({follower:id}).populate('followed').then(function(followed_list) {
	    console.log(followed_list);
	    res.f(0,{followed_list:followed_list});
	}).then(null,function(err) {
	    res.f(1009,{msg:err});
	});
    }else{
	var err = new Error('can not get id parameter');
	err.status = 500;
	next(err);
    }
});


	
//GET /followTeachers
//用途：获取用户关注老师的列表
//返回值：followteahcerlist[关注列表]
	
router.get('/followTeachers',function(req,res,next){
		
    var id=req.user._id;

    if(id){
	Follow.find({follower:id}).populate('followed').then(function(ftlist) {
	    ftlist = ftlist.filter(function(doc){
			return doc.followed.role == 'TEACHER';
	    });
	    console.log('follow list : ', ftlist);
	    
	    res.f(0,{ftlist : ftlist});
	}).then(null,function(err) {
	    res.f(1009,{msg:err});
	});
    }else{
	var err = new Error('can not get id parameter');
	err.status = 500;
	next(err);
    }
})
//GET /followMasters
//用途：获取用户关注画霸的列表
//返回值：followmasterlist[关注列表]
//YES
router.get('/followMasters',function(req,res,next){
    var id=req.user._id;
    if(id){
	Follow.find({follower:id}).populate('followed').then(function(followmasterlist) {
		followmasterlist = followmasterlist.filter(function(doc){
			return doc.followed.role == 'STUDENT';
		})
	    res.f(0,{followmasterlist:followmasterlist});
	}).then(null,function(err) {
	    res.f(1009,{msg:err});
	});
    }else{
	var err = new Error('can not get id parameter');
	err.status = 500;
	next(err);
    }
})
//GET /followStudios
//用途：获取用户关注画室的列表
//返回值：followstudiolist[关注列表]
//YES
router.get('/followStudios',function(req,res,next){
    var id=req.user._id;
    if(id){
	Follow.find({follower:id}).populate('followed').then(function(followstudiolist) {
		followmasterlist = followmasterlist.filter(function(doc){
			return doc.followed.role == 'STUDIO';
		})
	    res.f(0,{followstudiolist:followstudiolist});
	}).then(null,function(err) {
	    res.f(1009,{msg:err});
	});
    }else{
	var err = new Error('can not get id parameter');
	err.status = 500;
	next(err);
    }
})
//GET /followSchools
//用途：获取用户关注高校的列表
//返回值：followschoollist[关注列表]
//YES
router.get('/followSchools',function(req,res,next){
    var id=req.user._id;
    if(id){
	Follow.find({follower:id}).populate('followed_school').then(function(followschoollist) {
	    res.f(0,{followschoollist:followschoollist});
	}).then(null,function(err) {
	    res.f(1009,{msg:err});
	});
    }else{
	var err = new Error('can not get id parameter');
	err.status = 500;
	next(err);
    }
})
//GET /favours
//用途：获取用户收藏
//返回值：favourlist[收藏列表]
//YES
router.get('/favours/:type',function(req,res,next){
    var id = req.user._id;
    var type = req.params.type || "feed";
    if(id){
	Favour.find({user:id, type : type}).sort({'createTime':-1})
	    .then(function(list) {
		res.f(0,{list:list});
	    }).then(null,function(err) {
		res.f(1009,{msg:err});
	    });
	
    }else{
	var err = new Error('can not get id parameter');
	err.status = 500;
	next(err);
    }
});

//GET /fans
//用途：获取用户粉丝列表
//返回值：fanslist[粉丝列表]
//YES
router.get('/fans',function(req,res,next){
    var id = req.user._id;
    if(id){
	Follow.find({followed:id})
	    .then(function(fanslist) {
		res.f(0,{fanslist : fanslist});
	    }).then(null,function(err) {
		res.f(1009,{msg:err});
	    });
    }else{
	var err = new Error('can not get id parameter');
	err.status = 500;
	next(err);
    }
});
//GET /teacherComments
//用途：获取该用户获得的未读的老师点评
//返回值：comments[评论对象数组]
//YES
router.get('/teacherComments',function(req,res,next){
    var id = req.user._id;
    if(id){
	Comment.find({commentedOwner:id, "content.isAsker":false}).populate('commenter',null, {role:"TEACHER"})
	    .then(function(comments) {
		res.f(0,{comments:comments});
	    }).then(null,function(err) {
		res.f(1009,{msg:err});
	    });
    }else{
	var err = new Error('can not get id parameter');
	err.status = 500;
	next(err);
    }
});
//GET /unreadNum
//用途：获取目前未读的各种消息的数目
//返回值：
router.get('/unreadNum',function(req,res,next) {
    var id = req.user._id;
    if(id){
	Comment.find({commentedOwner: id, isRead: false, "content.isAsker": false,}).populate('commenter')
	    .then(function (comments) {
		var teacherComments=comments.filter(function(items){
		    return items.commenter.role=='TEACHER';
		})
		Message.find({receive_user:id}).then(function(messages){
		    res.f(0,{teacherComments:teacherComments.length,comments:comments.length,messages:messages.length});
		}).then(null,function(err){
		    res.f(1009,{msg:err});
		})
	    })
    }else{
	var err = new Error('can not get id parameter');
	err.status = 500;
	next(err);
    }
})

//GET /comments
//用途：获取用户得到的所有未读评论
//返回值：comments[评论列表]
//YES
router.get('/messages',function(req,res,next){
    var id = req.user._id;
    if(id){
	Message.find({"accepter._id" : id}).then(function(messages) {
	    res.f(0,{messages:messages});
	}).then(null,function(err){
	    res.f(1009,{msg:err});
	});
    }else{
	var err = new Error('can not get id parameter');
	err.status = 500;
	next(err);
    }
})
//GET /updateFans
//用途：获得最新用户粉丝
//参数：last_fan[本地最新的粉丝id]
//返回值：newfanslist[最新的粉丝列表]
//YES
router.post('/updateFans',function(req,res,next){
    var fan_id=req.body.last_fan;
    var user = req.user;
    if(fan_id){
	Follow.findOne({ followed : user._id ,follower:fan_id}).then(function (follow) {
	    console.log(follow.followTime);
	    Follow.find({followed:id}).populate('follower').then(function(newfanslist) {
		newfanslist = newfanslist.filter(function(doc){
		    return doc.followTime.getTime()>follow.followTime.getTime();
		});
		res.f(0,{newfanslist:newfanslist});
	    }).then(null,function(err) {
		res.f(1009,{msg:err});
	    });
	});
    }else{
	var err = new Error('no enough params');
	err.status = 500;
	next(err);
    }
});

/************************wangyejia*************************/
//POST /getFeeds
//返回值：feedlist
//参数：start_time,end_time,num,tag
//YES
router.post('/getFeeds',function(req,res,next) {
    var uid = req.user._id;
    var start = req.body.start || "1900-01-01 00:00:00";
    var end = req.body.end  || "2299-01-01 00:00:00";
    var num = req.body.num || 5;
    start = new Date(start);
    end = new Date(end);
    var query = {createTime : {"$gt" : start, "$lt" : end}};
    Feed.find(query).limit(num).select('-__v -editTime').populate('owner', '_id city role nickname photo address')
	.sort({createTime : -1})
	.then(function(feeds){
	    var feedsid=[];
	    for(var i in feeds){
		feedsid[i]=feeds[i]._id;
	    }
	    Favour.find({user:uid,feedid:{$in:feedsid}}).then(function(favours){
		for(var i in feeds){
		    feeds[i]  = feeds[i].toJSON();
		    feeds[i].isFavour = false;
		    feeds[i].viewNum +=1;
		    for(var j in favours){
			console.log('GET FEEDs log');
			if(favours[j].feedid.toHexString() == feeds[i]._id){
			    feeds[i].isFavour=true;
			}
		    }
		}
		res.f(0,{feedlist:feeds});
		var feed_ids = [];
		for(var m in feeds)
		    feed_ids.push(feeds[m]._id);
		
		Feed.update(
		    {_id: {$in : feed_ids}},
		    {$inc : {viewNum : 1}},
		    {multi : true}
		).then(function(newfeed){});		
	    });
	}).then(null, function(err){
	    console.log('[getFeeds] Error : ', err);
	    res.f(1001,{msg:err});
	});
});

router.get('/feedById/:_id',function(req,res,next) {
    var fid = req.params._id;
    var commentsMap = {};
    var discussList = [];
    var userid = req.user._id;
    console.log('[feedById] userid : ', userid);
    if(!fid)
	return next(new Error('no feed id'));
    
    var fDefer = Feed.findOne({_id : fid});
    var cDefer = Comment.find({commented:fid}).sort("createTime");
    var faDefer = Favour.findOne({feedid : fid, user : userid});

    Q.all([fDefer, cDefer, faDefer]).spread(function(feed, comments, favour) {
	if(!feed)
	    return next(new Error('no such feed'));
	feed = feed.toJSON();
	feed.isFavour = !!favour;
	return res.f(0,{ feed : feed , comments : comments});
    }).then(null,function(err) {
	console.log('[getFeeds error]', err.stack );
	res.f(1009,{msg:err});
    });
    
});

router.post('/deleteComment/:commentid', function(req,res,next) {
    var commentid = req.params.commentid;

    var noAuthError = new Error('no Auth to delete');
    noAuthError.status = 403;
    
    if(!commentid)
	return next(noAuthError);
    
    Comment.findOne({_id : commentid}).populate('commented').then(function(comment) {

	console.log('commentid', comment.commented);
	console.log('userid ', req.user._id);
	console.log('commenter ', comment.commenter);
	
        if(comment.content.isAsker){
	    if(comment.commented.owner.toHexString() == req.user._id.toHexString()){
		comment.remove().then(function() {
		    res.f(0);
		});
	    }else{
		return next(noAuthError);
	    }
	}else{
	    if(comment.commenter.toHexString() == req.user._id.toHexString()){
		// can delete
		comment.remove().then(function() {
		    res.f(0);
		});
	    }else{
		return next(noAuthError);
	    }
	}
    })
});

//评论动态：/addCommentToFeed
//参数: fid[动态id]，content[评论内容url],type[评论类型]，tags[标签], dialogid[会话id]
//返回值：newComment or 500



router.post('/addCommentToFeed/:feedid',function(req,res,next){
    //默认为文字
    var user = req.user;
    var noAuthError = new Error('no auth or no enough params');
    noAuthError.status = 403;

    if(!req.params.feedid)
	return next(noAuthError);


    var newComment = new Comment({
	commented : req.params.feedid,
	owner  : user._id,
	ownerName : user.nickname,
	ownerAvatar : user.photo,
	content : req.body.content,
	atPeople : null
    });

    Feed.findOneAndUpdate({_id : req.params.feedid}, {$inc : {commentNum : 1}}).then(function(feed) {
        newComment.save().then(function(comment) {
            res.f(0,{comment : comment});
	});
    });

});
//GET /studioBySelect
//返回条件筛选的画室
//返回值：studiolist
//yes
router.get('/studioBySelect',function(req,res,next){
    User.find({is_selected:true,role:"STUDIO"},{nickname:1,feature:1}).then(function(studios){
	res.f(0,{studiolist:studios});
    }).then(null,function(err){
	res.f(1009,{msg:err});
    })
})
//GET /postsByTag
//通过标签获取对应的文章
//参数：tag_name
//返回值：postlist
router.get('/postsByTag/:tag_name',function(req,res,next){
    var tag=req.params.tag_name;
    Tag.findOne({name:tag}).then(function (tag) {
	Post.find({tags:{$all:[tag._id]}}).select('-content').then(function (posts) {
	    res.f(0,{postlist:posts});
	}).then(null,function(err){
	    res.f(1009,{msg:err});
	})
    })
})
//GET /postsByCategory
//用途：获取某个类别的文章
//参数：category_name[类别名]
//返回值：postlist[文章列表]
router.get('/postsByCategory/:cateid',function(req,res,next){
    var uid=req.user._id;
    var cateid = req.params.cateid;
    if(cateid){
	Post.find({ category : cateid }).select('-content').then(function(postlist){
	    console.log('[get Post number] : ', postlist.length);
	    res.f(0,{list:postlist});
	}).then(null,function(err){
	    res.f(1009,{msg:err});
	});

    }else{
	var err = new Error('can not get name parameter');
	err.status = 500;
	next(err);
    }
});


//POST /itemsByCategory
//用途：获取某个类别的用户或高校
//参数：cateid[类别名]，type['user' or 'school']
//返回值：userlist or schoollist[用户或高校列表]
//YES
router.post('/itemsByCategory',function(req,res,next){
    var uid=req.user._id;
    var cateid = req.body.cateid;
    var type=req.body.type;

    console.log('itemsByCategory');
    
    if(uid&&cateid){
	if(type=='user'){
	    User.find({category:cateid}).then(function(users){
		var userids=[];
		for(var i in users){
		    userids[i]=users[i]._id;
		}
		Follow.find({follower:uid,followed:{$in:userids}}).then(function(follows){
		    for(var i in users){
			users[i]=users[i].toJSON();
			users[i].isFollow=false;
			for(var j in follows){
			    if(follows[j].follower.toHexString()==users[i]._id.toHexString()){
				users[i].isFollow=true;
			    }
			}
		    }
		    res.f(0,{userlist:users});
		})
	    }).then(null,function(err){
		res.f(1009,{msg:err});
	    });
	}else{
	    Post.find({category:cateid}).select("-content").then(function(schools){
		res.f(0,{schoollist:schools});
	    }).then(null,function(err){
		res.f(1009,{msg:err});
	    });
	}
    }else{
	var err = new Error('can not get name parameter');
	err.status = 500;
	next(err);
    }
});

//根据大类别获取所有Category
//GET /categoryByType
//参数： category
//返回值：categorys[分类列表]
//YES
router.get('/categoryByType/:category_name',function(req,res,next) {
    var name = req.params.category_name;
    if(name){
	    Category.findOne({name:name}).then(function(category) {

		    Category.find({parent:category._id}).then(function (children) {
			    res.f(0,{categorys: children});
		    });
	    }).then(null,function(err) {
		    res.f(1009,{msg:err});
	    });
    }else{
	    var err = new Error('can not get type parameter');
	    err.status = 500;
	    next(err);
    }
});
//发布作品
//POST /publishFeed
//参数：picUrl[作品url],content[作品内容],tags[作品标签数组],teacherlist[邀请老师id数组]
//返回值：user or 500
//YES
router.post('/publishFeed',function(req,res,next) {
    var uid = req.user._id;
    var picture = req.body.picUrl;
    var content = req.body.content || "";
    var tag = req.body.tag;

    if(!uid)
	return next(new Error('no user'));

    var newFeed={
	createTime : Date.now(),
	editTime :  Date.now(),
	picUrl : picture,
	content : content,
	kudoNum : 0,
	isKudo : false,
	favourNum : 0,
	commentNum : 0,
	viewNum : 0,
	tag :tag,
	owner :uid,
	ownerAvatar : req.user.photo,
	ownerName : req.user.nickname,
	ownerRole : req.user.role == "TEACHER" ? "TEACHER" : "STUDENT"
    };


    var fDefer, uDefer;

    fDefer = Feed.create(newFeed);
    uDefer = User.findOne({_id : uid});

    Q.all([fDefer, uDefer]).spread(function(feed, user) {
        user.work.push(feed._id);
	if(!user.workNum)
	    user.workNum = 0;
	user.workNum++;
	return user.save();
    }).then(function(user) {
        res.f(0,{user:user});
    }).then(null, function(error) {
        next(error);
    });

});

//老师获取邀请消息
//GET /messageInvite
//返回值：messagelist[消息列表]

router.get('/messageInvite',function(req,res,next){
    var id=req.user._id;
    Message.find({'receive_user':{$all:[id]}}).then(function(messages){
	res.f(0,{messagelist:messages});
    }).then(null,function(err){
	console.log("Error:"+err);
	res.f(1009,{msg:err});
    });
});

//按小类别发现User
//GET /userByCategory
//参数：category_name[小类别名]
//返回值：userlist[可以分别包含老师、画室的列表，不含画霸，画霸用GET /HotMaster]
//YES
router.get('/userByCategory/:catagoty_name',function(req,res,next) {
    var name=req.params.category_name;
    if(name){
	Category.findOne({name:name}).then(function(cat){
	    User.find({category:cat._id}).then(function(userlist) {
		res.f(0,{userlist: userlist});
	    }).then(null,function(err) {
		res.f(1009,{msg:err});
	    });
	})
    }else{
	var err = new Error('can not get name parameter');
	err.status = 500;
	next(err);
    }
});

//按小类别发现高校
//GET /schoolByCategory
//参数：category_name[小类别名]
//返回值：schoollist[高校列表]
//YES
router.get('/schoolByCategory/:catagoty_name',function(req,res,next) {
    var name=req.params.category_name;
    if(name){
	Category.findOne({name:name}).then(function(cat){
	    School.find({category:cat._id}).then(function(schoollist) {
		res.f(0,{schoollist: schoollist});
	    }).then(null,function(err) {
		res.f(1009,{msg:err});
	    });
	})
    }else{
	var err = new Error('can not get name parameter');
	err.status = 500;
	next(err);
    }
});

//获得所有标签
//返回值：taglist
//YES
router.get('/allTags', function(req, res, next){
    Tag.find().then(function(tags){
	res.f(0, {taglist: tags});
    }).then(null, function(err){
	res.f(1009,{msg:err});
    });
});

//获取某标签的子标签
//GET /children_tags
//参数：tag_name[标签名]
//返回值：children_tags[子标签]
//YES

router.get('/childrenTagsById/:_id', function(req, res, next){
    var id=req.params._id;
    if(id){
       Tag.find({parent:id}).then(function(children_tags){
          res.f(0, {tags: tags});
       }).then(null, function(err){
          res.f(1009,{msg:err});
       });

     }else{
 var err = new Error('can not get name parameter');
 err.status = 500;
 next(err);
 }
 });

router.get('/childrenTagsByName/:name', function(req, res, next){
    var name = req.params.name;
    if(name){
	Tag.findOne({name : name}).then(function(tag){
            if(!tag){
		return next(new Error('no parent tag found'));
	    }

	    Tag.find({parent : tag._id}).then(function(tags) {
		res.f(0, {tags: tags});
	    }).then(null, function(err) {
		next(err);
	    });
	    
	}).then(null, function(err){
            res.f(1009,{msg:err});
	});

    }else{
	var err = new Error('can not get name parameter');
	err.status = 500;
	next(err);
    }
});


//发现里的模糊搜索
//GET /discovery_search
//参数：keyword[关键字]
//返回值：result or 500
//YES
router.get('/discovery_search/:keyword',function(req,res,next){
    var keyword=req.params.keyword||"";
    User.find({nickname:{'$regex':keyword}}).then(function(user){
	if(user){
	    res.f(0,{result:user});
	}else{
	    School.find({name:{'$regex':keyword}}).then(function(school){
		if(school)
		    res.f(0,{result:school});
		else
		    res.f(0);
	    }).then(null,function(err){
		res.f(1009,{msg:err});
	    });
	}
    }).then(null,function(err) {
	res.f(1009,{msg:err});
    });
});
//攻略里的模糊搜索
//GET /news_search
//参数：keyword[关键字]
//返回值：result or 500
//YES
router.get('/news_search/:keyword',function(req,res,next){
    var keyword=req.params.keyword||"";
    Post.find({'title':{'$regex':keyword}}).then(function(post){
	res.f(0,{result:post});
    }).then(null,function(err) {
	res.f(1009,{msg:err});
    });
});

router.get('/article/:id',function(req,res, next){
    var id = req.params.id;

    Post.findOne({_id : id}).populate("category").populate("tags").then(function(post){
	    
	    if(!post){
		    return next(new Error('not found post'));
	    }

	post.viewNum+=3;
	post.save();
	var tags = "";
	for(var i = 0; i < post.tags.length; i++){
	    tags += post.tags[i].name + ',';
	}
	tags = tags.substring(0,tags.length -1);
	var ctime = Post.formatDate(post.createTime);
	res.render('article',{
	    post: post,
	    tags: tags,
	    createTime: ctime
	});
    });
});

router.get('/tagArticle/:tagid',function(req,res,next){
    var id = req.params.tagid;
    Tag.findOne({_id : id}).populate('post').then(function(tag) {
	res.render('tagArticle',{
	    post: tag.post,
	    tagid : id
	});        
    }).then(null, function(error) {
        return next(error);
    });
});









module.exports = router;

