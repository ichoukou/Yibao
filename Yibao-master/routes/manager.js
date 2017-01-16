var express = require('express');
var router = express.Router();
var User = require('../lib/Model/User');
var Post = require('../lib/Model/Post');
var Category = require('../lib/Model/Category');
var Tag = require('../lib/Model/Tag');
var Feed =require('../lib/Model/Feed');
var Work=require('../lib/Model/Work');
var Manager=require('../lib/Model/Manager');
var Upload = require('../lib/upload');
var School=require('../lib/Model/School');
var Comment=require('../lib/Model/Comment');
var _ = require('underscore');

// 获得所有类别
router.get('/getAllCategory',function(req,res,next) {
	Category.find({}).populate('parent').then(function(cats) {
		res.f(0,{categoryList : cats});
	}).then(null,function(err) {
		res.status(500).end();
	});
});

router.get('/getCategory/:id', function(req, res, next){
	var cateid = req.params.id;
	Category.findOne({_id : cateid}).then(function(cate) {
		res.f(0,{cate:cate});
	}).then(null,function(err) {
		res.status(500).end();
	});
});

// 更新某一个category
router.post('/updateCategory',function(req,res,next) {
	var cate = req.body;
	Category.findOne({name:cate.name}).then(function(baseCategory){
		if(baseCategory){
			res.f(0, {cate:null});
		}else{
			Category.findOne({_id : cate._id}).then(function(oldcate) {
				oldcate.name = cate.name;
				oldcate.save().then(function(newcate) {
					res.f(0,{cate : newcate});
				});
			});
		}
	});
});

// 添加一个Category
router.post('/addCategory', function(req, res, next){
	var new_category = req.body.name;
	Category.findOne({name : new_category}).then(function(baseCategory){
		if(!baseCategory){
			var newCat = {
				name: new_category,
				status: 'DEACTIVE', //默认初始非激活态
				createTime: new Date(),
				editTime: new Date()
			};
			Category.create(newCat).then(function(newCate){
				res.f(0,{cate : newCate});
			}).then(null, function(err){
				res.status(500).end();
			});
		}else{
			res.f(0, {cate : null});
		}
	});
});

// 删除category
router.get('/removeCategory/:id', function(req, res, next){
	var id = req.params.id;
	Category.remove({_id: id}).then(function(data){
		Post.remove({category_id: id}).then(function(data){
			res.f(0);
		});
	});

});

// 添加post
router.post('/addPost', function(req, res, next){
	var post = req.body;
	Post.create(post).then(function(post){
		Post.findOne({_id:post._id}).populate('category').then(function(returnpost) {
			res.f(0,{post:returnpost});
		});

	}).then(null, function(err){
		res.status(500).end();
	});
});

router.post('/updatePost', function(req, res, next){
	var post = req.body;
	Post.findOne({_id : post._id}).then(function(oldPost){
		for(var key in post){
			oldPost[key] = post[key];
		}
		oldPost.save().then(function(newPost){
			Post.findOne({_id:newPost._id}).populate("category").then(function(post){
				res.f(0, {post:post});
			});
		});
	});
});

// 删除post
router.get('/removePost/:id', function(req, res, next){
	var id = req.params.id;
	Post.remove({_id: id}).then(function(){
			res.f(0);
		}).then(null, function(err){
			res.status(500).end();
		});
});

// 用id获得某个特定post
router.get('/getPost/:_id',function(req,res,next) {
	var postid = req.params._id;
	Post.findOne({_id : postid}).populate("category").populate("tags").then(function(post) {
		res.f(0,{post:post});
	}).then(null,function(err) {
		res.status(500).end();
	});
});

//获得所有的文章
router.get('/getAllPosts',function(req,res,next) {
	Post.find({}).select('_id title category viewNum likeNum FavourNum status').sort({'createTime': -1 } ).populate("category").populate("tags").then(function(posts) {
		res.f(0,{posts:posts});
	}).then(null,function(err) {
		console.log(err.stack);
		res.status(500).end();
	});
});

// 找到特定category的所有post
router.get('/getPosts',function(req,res,next) {
	var name = req.query.category || "";
	var query = name ? {category : name} : {};
	Post.find(query).sort('createTime').populate("category").then(function(posts) {
		res.f(0,{posts: posts});
	}).then(null,function(err) {
		res.status(500).end();
	});
});


//获得所有用户
router.get('/getAllUser',function(req,res,next) {
	User.find({}).then(function(users) {
		res.f(0,{UserList : users});
	}).then(null,function(err) {
		res.status(500).end();
	});
});


// 用id获得某个特定用户
router.get('/getUserById/:id',function(req,res,next) {
	var user_id = req.params.id;
	User.findOne({_id : user_id}).then(function(user) {
		res.f(0,{user:user});
	}).then(null,function(err) {
		res.status(500).end();
	});
});
// 用省份获得某个特定用户
router.get('/getUserByAddress/:address',function(req,res,next) {
	var address = req.params.address;
	User.find({address: address}).then(function(user) {
		res.f(0,{user:user});
	}).then(null,function(err) {
		res.status(500).end();
	});
});

// 用昵称获得某个特定用户
router.get('/getUserByName/:nickname',function(req,res,next) {
	var name = req.params.nickname;
	User.findOne({nickname: name}).then(function(user) {
		res.f(0,{user:user});
	}).then(null,function(err) {
		res.status(500).end();
	});
});
//
////获取学生
//router.get('/getStudent',function(req,res,next) {
//	User.find({role: "STUDENT"}).then(function(user) {
//		res.f(0,{user:user});
//	}).then(null,function(err) {
//		res.status(500).end();
//	});
//});
router.post('/addUser', function(req, res, next){
	var newUser = {
		//共有属性
		role :"TEACHER", 	 //TEACHER, STUDENT，STUDIO
		work:["563213ec4f0479e46b2b8340"],
		uid : "0002",
		telephone :"18810543702",
		nickname :"刘习文",
		address:"北京",  //省份
		city : "海淀",   //具体城市
		QQ:"303143652",
		rank:4,    //排名
		createTime : Date.now(),
		editTime :  Date.now(),
		is_qualified:true,   //是否认证
		followNum : 200,  //关注数
		fansNum :15,
		workNum : 0,
		commentNum: 23,
		photo:"http://www.touxiang.cn/uploads/20131114/14-065802_226.jpg",
		category:'564a91b09efd30d81bf13f56',
		studio:"朝恒美术学校",
		//老师特有属性
        //
		//teacher_profile:"张三，李四老师",   //老师简介
		////environment:[{type: String}],  //教学环境（图片数组）
		//sign_upNum:2560,  //报名数
		//responsible_person:{    //负责人
		//	name:{type:String},
		//	ID_card:{type:String},   //身份证号
		//	ID_card_Pic:[{type: String}],   //两面身份证图片数组
		//	validity_period:{type:Date},   //有效期限
		//	contact:{type: String},   //联系方式
		//},
		//email:{type: String},
		//website:{type: String},
		//is_selected:true,   //是否为条件筛选画室
		//feature:"报名最多"     //画室特点；如：过线率最高等。
	};
	User.create(newUser).then(function(newUser){
		res.f(0,{user : newUser});
	}).then(null, function(err){
		res.status(500).end();
	});
});
// 删除某个用户
router.get('/removeUser/:id', function(req, res, next){
	var id = req.params.id;
	User.remove({_id: id}).then(function(){
		res.f(0);
	}).then(null, function(err){
		res.status(500).end();

	});

});

// 获取所有的动态
router.get('/getAllFeed',function(req,res,next) {
	Feed.find({}).populate('tags').populate('owner').then(function(feeds) {
		res.f(0,{FeedList : feeds});
	}).then(null,function(err) {
		res.status(500).end();
	});
});

router.post('/addFeed', function(req, res, next){
	var newFeed = {
		createTime :Date.now(),
		editTime :  Date.now(),
		picUrl : "http://img5.duitang.com/uploads/item/201310/16/20131016202334_uuMHn.jpeg",
		content : "大家打个中肯的分吧",
		kudoNum : 121,
		isKudo :true,
		favourNum : 11,
		isFavour : true,
		commentNum : 22,
		viewNum : 156,
		tags : ['5634cb0e172c1060815edf71'],
		owner :'563f41524ca9972105653aff'

		//"fid" : "12350",
		//"picUrl" : "http://demo.jinguoyuan.com/pzlinfomng/PZLUPLOAD/WZFBW1001/jpg/XZLADMIN121011104957.jpg",
		//"content" : "hi, 我是一名小学生，想请教一下关于如何更好地成为一名超能陆战队的战士?",
		//"kudoNum" : 1281,
		//"isKudo" : true,
		//"favourNum" : 100,
		//"isFavour" : true,
		//"commentNum" : 110,
		//"viewNum" : 21830,
		////"tags" : ["素描"],
		//"createTime" : "2015-09-01 20:01:08",
		//"editTime" : "2015-09-01 20:01:08",
		//"owner" : {
		//	"profile" : "http://img5.duitang.com/uploads/item/201508/12/20150812204032_eiAQk.thumb.224_0.jpeg",
		//	"nickname" : "tangzhirong",
		//	"grade" : "高三",
		//	"district" : "山西",
		//	"city" : "临汾"
		//}
	};
	Feed.create(newFeed).then(function(newFeed){
		//Feed.findOne({fid:newFeed.fid}).populate('tags').then(function(returnfeed) {
		//	res.f(0,{feed:returnfeed});
		//});
		res.f(0,{feed : newFeed});
	}).then(null, function(err){
		res.status(500).end();
	});
});

router.get('/removeFeed/:_id', function(req, res, next){
	var fid = req.params._id;
	Feed.remove({_id: fid}).then(function(){
		res.f(0);
	}).then(null, function(err){
		res.status(500).end();

	});

});
router.get('/getFeedById/:_id',function(req,res,next) {
	var fid = req.params._id;
	Feed.findOne({_id : fid}).populate('tags').populate('owner').sort({createTime : -1}).then(function(feed) {
		res.f(0,{feedlist:feed});
	}).then(null,function(err) {
		res.status(500).end();
	});
});

router.get('/getFeedByTag/:tag',function(req,res,next) {
	var tag_name = req.params.tag;
	Tag.findOne({name:tag_name}).then(function (tag) {
		Feed.findOne({tags:{$all:[tag._id]}}).populate('tags').populate('owner').sort({createTime : -1}).then(function(feed) {
			res.f(0,{feedlist:feed});
		}).then(null,function(err) {
			res.status(500).end();
		});
	})

});

router.get('/getFeedByOwner/:_owner',function(req,res,next) {
	var name= req.params._owner;
	User.findOne({nickname:name}).then(function (user) {
		Feed.find({owner:user._id}).populate('tags').populate('owner').sort({createTime : -1}).then(function(feed) {
			res.f(0,{feedlist:feed});
		}).then(null,function(err) {
			res.status(500).end();
		});
	})

});

//获取所有画室
router.get('/getAllStudio',function(req,res,next) {
	User.find({role:"STUDIO"}).then(function(studio) {
		res.f(0,{StudioList : studio});
	}).then(null,function(err) {
		res.status(500).end();
	});
});

router.get('/removeStudio/:_id', function(req, res, next){
	var id = req.params._id;
	User.remove({_id: id}).then(function(){
		res.f(0);
	}).then(null, function(err){
		res.status(500).end();

	});

});

router.get('/getStudioById/:_id',function(req,res,next) {
	var id = req.params._id;
	User.findOne({_id: id}).then(function(studio) {
		res.f(0,{studiolist:studio});
	}).then(null,function(err) {
		res.status(500).end();
	});
});

router.get('/getStudioByName/:nickname',function(req,res,next) {
	var sname = req.params.nickname;
	User.findOne({nickname: sname}).then(function(studio) {
		res.f(0,{studiolist:studio});
	}).then(null,function(err) {
		res.status(500).end();
	});
});

router.get('/getStudioByDistrict/:district',function(req,res,next) {
	var s_district = req.params.district;
	User.find({address:s_district}).then(function(studio) {
		res.f(0,{studiolist:studio});
	}).then(null,function(err) {
		res.status(500).end();
	});
});

router.post('/addStudio', function(req, res, next){
	var name = req.body.name;
	var phone = req.body.phone;
	var address = req.body.address;
	var chengguo = req.body.chengguo;
	var photo = req.body.photo;
	var website = req.body.website;
	var email = req.body.email;
	var is_selected =req.body.is_selected;
	var feature = req.body.feature;
	var responsible = req.body.responsible;
	var resphone = req.body.resphone;
	var newStudio = {
		role :'STUDIO',
		telephone : phone,
		nickname : name,
		address:address,
		status : "REGISTER",
		photo : photo,
		chengguo :chengguo,
		website:website,
		email :email,
		is_selected :is_selected,
		feature : feature,
		'responsible_person.name':responsible,
		'responsible_person.contact':resphone

	};
	User.create(newStudio).then(function(newStudio){
		res.f(0,{studio : newStudio});
	}).then(null, function(err){
		res.status(500).end();
	});
});
//添加高校
router.post('/addSchool', function(req, res, next){
	var newSchool = {
		name:"天津美术学院",
		district:"天津",
		picture:"http://www.touxiang.cn/uploads/20131114/14-065802_226.jpg",
		profile:"比北大清华都牛逼！",
		FavourNum:456,
		category:'564a93236e2f08741362db40',
	};
	School.create(newSchool).then(function(newStudio){
		res.f(0,{studio : newStudio});
	}).then(null, function(err){
		res.status(500).end();
	});
});
//添加评论
router.post('/addComment', function(req, res, next){
	var newComment = {
		commenter:"5643424a95804f136d5adeb7",
		commented:"5643424a95804f136d5adeb9",
		commentedOwner:"5643424a95804f136d5adeb6",
		isRead:false,   //是否阅读
		createTime:Date.now(),
		editTime: Date.now(),
		content:{
			contentType:"text",
			content:"我们画室很擅长教学生色彩的使用噢！",
			length:100,
			isAsker:false,
		},
		//老师评论特有
		tags:["5643424a95804f136d5adeb2"],
	};
	console.log(newComment);
	Comment.create(newComment).then(function(newStudio){
		console.log(newStudio);
		res.f(0,{studio : newStudio});
	}).then(null, function(err){
		res.status(500).end();
	});
});
router.post('/addCategory', function(req, res, next){
	var newCategory = {
		name : "北京画室",  //类别名
		status : "RIGISTERED",
		type:"热门画室",  //类别名的大类别
		//post:[],  //包含的文章
		user:['5632121230acad706b99d066'],  //包含的老师、画霸、画室
		//school:[{type:Schema.Types.ObjectId, ref : 'School'}],  //包含的高校
		createTime : Date.now(),
		editTime :  Date.now()
	};
	Category.create(newCategory).then(function(newStudio){
		res.f(0,{studio : newStudio});
	}).then(null, function(err){
		res.status(500).end();
	});
});

router.post('/addPostinfo', function(req, res, next){
	var newPost = {
		title : "艺考生的未来",
		content : "http://mp.weixin.qq.com/s?__biz=MzA4MTk5NDg2NQ==&mid=209730276&idx=1&sn=adab6382f988132ecf09a202ef95cfdc&scene=0#rd",			//HTML format
		subtitle : "美术生在十年后将何去何从?美术生在十年后将何去何从?...美术生在十年后将何去何从?美术生在十年后将何去何从?",
		picUrl : "http://pic.nipic.com/2008-02-21/2008221165914385_2.jpg",
		thumbUrl : "http://img1.2345.com/duoteimg/qqTxImg/2013/12/ka_3/04-054658_103.jpg",
		category : '56332fee67a03bd47022a0fd',
		//tags : [{type:Schema.Types.ObjectId, ref : 'Tag'}],
		status : "ACTIVE",
		createTime : Date.now(),
		editTime :  Date.now(),
		likeNum:25,
		FavourNum:36,
		viewNum:65,
		profile:"asdadasdasdasd" //简介
	};
	Post.create(newPost).then(function(newStudio){
		res.f(0,{studio : newStudio});
	}).then(null, function(err){
		res.status(500).end();
	});
});
//添加介绍
router.post('/addProfile/:_id/:profile', function(req, res, next){
	var id=req.params._id;
	var info=req.params.profile;
	User.findOne({_id:id}).then(function(old_studio){
		old_studio.profile = info;
		old_studio.save().then(function(new_studio) {
			res.f(0,{studiolist : new_studio});
		});
	});
});

//添加画作
router.post('/add_studioworks', function(req, res, next){
	var addSrc = req.body.imgSrc;

	Upload.image(addSrc).then(function(url) {
		var studio_id=req.body.studio_id;
		var newWork={
			owner : studio_id,
			createTime :  new Date(),
			editTime :  new Date(),
			picUrl  : url
		};
		Work.create(newWork).then(function(newWork){
			res.f(0,{works : newWork});
		}).then(null,function(err) {
			next(err);
		});
	});
});

router.post('/getImgUrl', function(req, res, next){
	var base64 = req.body.base64;
	Upload.image(base64).then(function(url){
		res.f(0, {url:url});
	}).then(null, function(err){
		res.status(500).end();
	});
});


//获取画室所有画作
router.get('/getallWorks/:id',function(req,res,next) {
    var studio_id=req.params.id;
    Work.find({owner:studio_id}).then(function(works) {
        res.f(0,{worklist : works});
    }).then(null,function(err) {
        res.status(500).end();
    });
});

/****************标签tag管理****************/
//获得所有标签
router.get('/getAllTags', function(req, res, next){
	Tag.find({}).sort({createTime : -1}).then(function(tags){
		res.f(0, {tagList : tags});
	}).then(null, function(err){
		res.status(500).end();
	});
});

router.get('/getTag/:id', function(req, res, next){
	var tagid = req.params.id;
	Tag.findOne({_id : tagid}).then(function(tag) {
		res.f(0,{tag:tag});
	}).then(null,function(err) {
		res.status(500).end();
	});
});

router.get('/getLinkedTags', function(req, res, next){
	Tag.find({parent : {$ne : null}}).select('_id name parent').sort('parent').populate('parent').then(function(tags){
		res.f(0, {linkedTags : tags});
	}).then(null, function(err){
		res.status(500).end();
	});
});

//删除画作
router.get('/removeWork/:id', function(req, res, next){
	var wid = req.params.id;
	Work.remove({_id: wid}).then(function(){
		res.f(0);
	}).then(null, function(err){
		res.status(500).end();
	});
});
// 添加一个tag
router.post('/addTag', function(req, res, next){
	var new_Tag = req.body.name;
	Tag.findOne({name : new_Tag}).then(function(baseTag){
		if(!baseTag){
			var newTag = {
				name : new_Tag,
				status : 'DEACTIVE',
				createTime : new Date(),
				editTime : new Date(),
			};
			Tag.create(newTag).then(function(newTag){
				res.f(0,{tag : newTag});
			}).then(null, function(err){
				res.status(500).end();
			});
		}else{
			res.f(0, {tag : null});
		}
	});
});

// 删除Tag
router.get('/removeTag/:id', function(req, res, next){
	var id = req.params.id;
	Tag.remove({_id: id}).then(function(){
		res.f(0);
	}).then(null, function(err){
		res.status(500).end();
	});
});

//绑定或接触标签关系时，先获取对应的tag对象
router.post('/getTagPair', function(req, res, next){
	var obj = req.body;
	var parent = obj.parent;
	var child = obj.child;
	var result = {};
	Tag.findOne({name : parent}).then(function(parentTag){
		result.parent = parentTag;
		Tag.findOne({name : child}).then(function(childTag){
			result.child = childTag;
			res.f(0, {tagPair : result});
		}).then(null, function(err){
			console.log(err);
			next(err);
		});
	});
});

//更新一个tag
router.post('/updateTag', function(req, res, next){
	var tag = req.body;
	// var id = tag._id;
	// tag = _.omit(tag, '_id');
	// Tag.update({_id : id}, {$set : tag}).then(function(tag){
	// 	console.log(tag);
	// 	res.f(0, {tag: tag});
	// }).then(null, function(err){
	// 	console.log(err.stack);
	// 	return next(err);
	// });
	Tag.findOne({_id:tag._id}).then(function(oldTag){
		for(var key in tag){
			oldTag[key] = tag[key];
		}
		oldTag.save().then(function(newTag){
			res.f(0, {tag:newTag});
		},function(err){
			next(err);
		});
	});
});


//判断是否存在该name的tag
router.post('/getByName', function(req, res, next){
	var name = req.body.name;
	Tag.findOne({name:name}).then(function(baseTag){
		res.f(0, {tag:baseTag});
	});
});

//输入：以，分隔的标签字符串，输出：包含对应tag._id
router.post('/updatePostTags', function(req, res, next){
	if(!req.body.tags)
		return res.f(0, {tagList:null});
	var tags = req.body.tags.split('，');
	var tagList = [];
	updateTags(function(){
		res.f(0, {tagList:tagList});
	});
	function updateTags(callback){
		for(var i in tags){
			(function(tagName){
				Tag.findOne({name:tagName}).then(function(baseTag){
					if(!baseTag){
						var newTag = {
							name : tagName,
							status : 'DEACTIVE',
							createTime : new Date(),
							editTime : new Date()
						};
						Tag.create(newTag).then(function(newTag){
							tagList.push(newTag);
						});
					}else{
						tagList.push(baseTag);

					}
				});
			})(tags[i]);
		}
		setTimeout(function(){
			callback();
		},1000);
	}
});

router.get('/getCategoryByName/:name',function(req,res,next){
	var name=req.params.name;
	Category.findOne({name:name}).then(function(cate){
		res.f(0,{cate:cate});
	}).then(null,function(err){
		res.f(1009,{msg:err});
	})
})

router.post('/updateCateRelation',function(req,res,next){
	var cate = req.body;
	var id = cate._id;
	cate = _.omit(cate, '_id');
	Category.update({_id : id}, {$set : cate}).then(function(newCate){
		res.f(0, {cate: newCate});
	}).then(null, function(err){
		console.log(err.stack);
		return next(err);
	});
})

router.post('/updateStudio',function(req,res,next){
	var id = req.body._id;
	var name = req.body.name;
	var phone = req.body.phone;
	var address = req.body.address;
	var is_qualified = req.body.is_qualified;
	var photo= req.body.photo;
	var website = req.body.website;
	var email = req.body.email;
	var responsible = req.body.responsible;
	var resphone = req.body.resphone;
	var QQ = req.body.QQ;

	User.update({_id : id}, {$set :{name:name}},{$set:{phone:phone}},{$set:{address:address}},{$set:{is_qualified:is_qualified}},
		{$set:{photo:photo}},{$set:{website:website}},{$set:{email:email}},{$set:{'responsible_person.name':responsible}}
		,{$set:{'responsible_person.contact':resphone}},{$set:{QQ:QQ}}).then(function(newStudio){
		res.f(0, {studio: newStudio});
	}).then(null, function(err){
		console.log(err.stack);
		return next(err);
	});
})


//管理员登录验证

router.post('/login',function(req,res,next){
	var user = req.body.uid;
	var psw = req.body.password;
	Manager.findOne({name : user}).then(function(user){
		if(user){
			if(psw === user.password) {
				res.cookie('sessionid',user._id+'@'+Date.now(), {signed:true});
				res.f(0, {isLogined: true});
			}
			else
				res.f(0,{isLogined:false});
		}
		else
			res.f(0,{isLongined:false});

	}).then(null, function(err){next(err)});
});

router.get('/logout',function(req,res,next){
	res.cookie('sessionid','false');
	next();
});
module.exports = router;
