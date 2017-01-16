var mongoose = require('mongoose');
var config = require('../../config');
mongoose.connect('mongodb://'+config.db.username+':'
		 +config.db.password+'@'+config.db.host+
		 ':'+config.db.port+'/'+config.db.dbname, config.db.options);
mongoose.connection.once('open',function() {
    console.log('[app.js] Database connect successfully.');
    dbReady();
}).on('error', function(err) {
    console.log('[app.js] Database connect failed.');
    console.error(err);
});

var q = require('Q');
var Q = q;

function dbReady(){
    /* import the related data model */
    /* 引入相关的数据模型 */
    var Feed = require('./Feed');
    var Comment = require('./Comment');
    var User = require('./User');
    var Tag = require('./Tag');
    var Category=require('./Category');
    var Dianzan=require('./Dianzan');
    var Favour=require('./Favour');
    var Follow=require('./Follow');
    var Manager=require('./Manager');
    var Message=require('./Message');
    var Post=require('./Post');
    var School=require('./School');
    var Work=require('./Work');

    /* Clear all the collection */
    /* 清空所有数据表以方便测试 */

    var feedRemove = Feed.remove();
    var commentRemove = Comment.remove();
    var tagRemove = Tag.remove();
    var userRemove = User.remove();
    var categoryRemove = Category.remove();
    var dianzanRemove = Dianzan.remove();
    var favourRemove = Favour.remove();
    var followRemove = Follow.remove();
    var messageRemove = Message.remove();
    var postRemove = Post.remove();
    var schoolRemove = School.remove();
    var workRemove = Work.remove();
    
    /*  Manager仍保留  */
    q.all([userRemove, feedRemove, commentRemove, tagRemove,categoryRemove,dianzanRemove,favourRemove,
	   followRemove,messageRemove,postRemove,schoolRemove,workRemove]).then(function(){
	       console.log('Remove operations done ...');

	       // 清除之后，创建相关的测试数据
	       
	       createTags()
		   .spread(createUsers)
		   .spread(createFeeds)
		   .spread(createComments)
		   .spread(createCategorys)
		   .spread(createPosts)
		   .spread(createDianzans)
		   .spread(createFavours)
		   .spread(createSchools)
		   .spread(createFollows)
		   .spread(createWorks)
		   .spread(createMessages).then(function() {
		       console.log('数据库 测试数据 初始化完毕');
		   }).then(null, function(err){
		       console.log('数据库 测试数据 加载发生错误', err.stack);
		       
		   });
	   });



    // 以下是分步创建数据的函数

    function createTags(){
	var tag1 = new Tag({
	    name : "色彩"
	});
	var tag2 = new Tag({
	    name : "素描"
	});
	// 创建问题相关的Tag
	var tag3 = new Tag({
	    name : "刻画不深"
	});
	var tag4 = new Tag({
	    name : "色彩问题"
	});
	console.log('creating Tags ...');
	return Q.all([tag1.save(), tag2.save(),tag3.save(), tag4.save()]);
    }


    // 创建用户
    function createUsers(tag1, tag2, tag3, tag4){

	console.log('start create user ...');

	
	var user1 = new User({
	    role : "STUDENT",
	    telephone : "15678602900",
	    nickname : "小螺号",
	    address : "中南海",
	    city : "北京",
	    birthday : new Date('1990-01-01 12:12:12'),
	    gender : "MALE",
	    status : "READY",
	    photo : "http://img5.duitang.com/uploads/item/201508/12/20150812204032_eiAQk.thumb.224_0.jpeg",
	    followNum : 0,
	    degree : 3,
	    identify : "三年级"
	});
	var user2 = new User({
	    role : "TEACHER",
	    telephone : "15678602902",
	    nickname : "小老师",
	    address : "中南海",
	    city : "北京",
	    birthday : new Date('1990-01-01 12:12:12'),
	    gender : "FEMALE",
	    photo : "http://www.touxiang.cn/uploads/20131114/14-065802_226.jpg",
	    status : "READY",
	    followNum : 2,
	    graduate_school : "清华美院"
	});
	var user3 = new User({
	    role : "TEACHER",
	    telephone : "15678602902",
	    nickname : "大老师",
	    address : "玉溪",
	    city : "北京",
	    photo : "http://img5.duitang.com/uploads/item/201508/12/20150812204032_eiAQk.thumb.224_0.jpeg",
	    birthday : new Date('1990-01-01 12:12:12'),
	    gender : "MALE",
	    status : "READY",
	    followNum : 3,
	    graduate_school : "中央美院"
	});
	console.log('creating User ...');
	return Q.all([tag1, tag2,tag3,tag4, user1.save(), user2.save(), user3.save()]);
    }

    function createFeeds(tag1, tag2, tag3, tag4, user1, user2, user3){
	var feed1 = new Feed({
	    picUrl : "http://demo.jinguoyuan.com/pzlinfomng/PZLUPLOAD/WZFBW1001/jpg/XZLADMIN121011104957.jpg",
	    content : "",
	    kudoNum : 100,
	    favourNum : 100,
	    commentNum : 2,
	    viewNum : 300,
	    tags : [tag1._id],
	    owner : user1._id
	});
	var feed2 = new Feed({
	    picUrl : "http://img5.duitang.com/uploads/item/201310/16/20131016202334_uuMHn.jpeg",
	    content : "Test infddaf  fadfadfd",
	    kudoNum : 200,
	    favourNum : 300,
	    commentNum : 4,
	    viewNum : 500,
	    tags : [tag2._id],
	    owner : user2._id
	});
	console.log("creating feeds...");
	return Q.all([tag1, tag2, tag3, tag4, user1, user2, user3,
		      feed1.save(), feed2.save()]);
    }

    function createComments(tag1, tag2, tag3, tag4, user1, user2, user3, feed1, feed2) {
	var comment11 = new Comment({
	    commenter : user2._id,
	    commented : feed1._id,
	    content : {
		contentType : "text",
		content : "测试数据123456666",
		isAsker : false
	    }
	});

	var comment12 = new Comment({
	    commenter : user2._id,
	    commented : feed1._id,
	    content : {
		contentType : "text",
		content : "回复文字回复，我是文字回复",
		isAsker : true
	    }
	});

	var comment13 = new Comment({
	    commenter : user2._id,
	    commented : feed1._id,
	    content : {
		contentType : "voice",
		url : "http://yuyin.com/test.amr",
		length : 15000,
		isAsker : false
	    }
	});


	var comment21 = new Comment({
	    commenter : user3._id,
	    commented : feed1._id,
	    content : {
		contentType : "text",
		content : "回复文字回复，我是文字回复",
		isAsker : false
	    }
	});

	var comment22 = new Comment({
	    commenter : user3._id,
	    commented : feed1._id,
	    content : {
		contentType : "text",
		content : "回复文字回复，我是文字回复",
		isAsker : false
	    }
	});

	// Comments for feed2 is here
	// TODO ...
	console.log("creating comments...");

	return Q.all([tag1, tag2, tag3, tag4, user1, user2, user3,feed1,feed2,
		      comment11.save(), comment12.save(),comment13.save(), comment21.save(), comment22.save()]);
    }

    function createCategorys(tag1, tag2, tag3, tag4, user1, user2, user3,feed1,feed2){
	//攻略与艺考资讯
	var Zixun=new Category({
	    name:"艺考咨讯"
	});
	var Gonglue=new Category({
	    name:"攻略"
	});
	//艺考资讯的子Category
	var Bidu=new Category({
	    name:"考生必读"
	});
	var Meishu=new Category({
	    name:"高二美术"
	});
	//发现里的Category
	var Teacher=new Category({
	    name:"老师"
	});
	var Studio=new Category({
	    name:"画室"
	});
	var Master=new Category({
	    name:"画霸"
	});
	var School=new Category({
	    name:"高校"
	});
	//Teacher下的子Category
	var Jinpai=new Category({
	    name:"金牌名师"
	});
	var Sumiao=new Category({
	    name:"素描老师"
	});
	//Studio下的子Category
	var Beijing=new Category({
	    name:"北京画室"
	});
	var Zhejiang=new Category({
	    name:"浙江画室"
	});
	var Select=new Category({
	    name:"条件筛选"
	});
	//School下的子Category
	var Jiuda=new Category({
	    name:"九大美院"
	});
	var School_13=new Category({
	    name:"13所院校"
	});
	console.log("creating category...");
	return Q.all([tag1, tag2, tag3, tag4, user1, user2, user3,feed1,feed2,
		      Zixun.save(), Gonglue.save(),Bidu.save(), Meishu.save(), Teacher.save(),Studio.save(),Master.save(),
		      School.save(),Jinpai.save(),Sumiao.save(), Beijing.save(),Zhejiang.save(),Select.save(),Jiuda.save(),School_13.save()]);

    }

    function createPosts(tag1, tag2, tag3, tag4,user1, user2, user3,feed1,feed2,Zixun,Gonglue,Bidu,Meishu,
			 Teacher,Studio,Master,School,Jinpai,Sumiao,Beijing,Zhejiang,Select,Jiuda,School_13){
	//攻略的文章
	var post_gonglue1=new Post({
	    title : "艺考生的未来1",
	    content : "http://mp.weixin.qq.com/s?__biz=MzA4MTk5NDg2NQ==&mid=209730276&idx=1&sn=adab6382f988132ecf09a202ef95cfdc&scene=0#rd",			//HTML format
	    subtitle : "美术生在十年后将何去何从?美术生在十年后将何去何从?...美术生在十年后将何去何从?美术生在十年后将何去何从?",
	    picUrl : "http://pic.nipic.com/2008-02-21/2008221165914385_2.jpg",
	    thumbUrl : "http://img1.2345.com/duoteimg/qqTxImg/2013/12/ka_3/04-054658_103.jpg",
	    category : Gonglue._id,
	    tags : [tag1._id,tag2._id],
	    status : "ACTIVE",
	    createTime : Date.now(),
	    editTime :  Date.now(),
	    likeNum:25,
	    FavourNum:36,
	    viewNum:65,
	    profile:"asdadasdasdasd" //简介
	});

	var post_gonglue2=new Post({
	    title : "艺考生的未来2",
	    content : "http://mp.weixin.qq.com/s?__biz=MzA4MTk5NDg2NQ==&mid=209730276&idx=1&sn=adab6382f988132ecf09a202ef95cfdc&scene=0#rd",			//HTML format
	    subtitle : "美术生在十年后将何去何从?美术生在十年后将何去何从?...美术生在十年后将何去何从?美术生在十年后将何去何从?",
	    picUrl : "http://pic.nipic.com/2008-02-21/2008221165914385_2.jpg",
	    thumbUrl : "http://img1.2345.com/duoteimg/qqTxImg/2013/12/ka_3/04-054658_103.jpg",
	    category : Gonglue._id,
	    tags : [tag1._id,tag2._id],
	    status : "ACTIVE",
	    createTime : Date.now(),
	    editTime :  Date.now(),
	    likeNum:25,
	    FavourNum:36,
	    viewNum:65,
	    profile:"asdadasdasdasd" //简介
	});

	//资讯的文章
	var post_zixun1=new Post({
	    title : "艺考生的未来3",
	    content : "http://mp.weixin.qq.com/s?__biz=MzA4MTk5NDg2NQ==&mid=209730276&idx=1&sn=adab6382f988132ecf09a202ef95cfdc&scene=0#rd",			//HTML format
	    subtitle : "美术生在十年后将何去何从?美术生在十年后将何去何从?...美术生在十年后将何去何从?美术生在十年后将何去何从?",
	    picUrl : "http://pic.nipic.com/2008-02-21/2008221165914385_2.jpg",
	    thumbUrl : "http://img1.2345.com/duoteimg/qqTxImg/2013/12/ka_3/04-054658_103.jpg",
	    category : Zixun._id,
	    tags : [tag1._id,tag2._id],
	    status : "ACTIVE",
	    createTime : Date.now(),
	    editTime :  Date.now(),
	    likeNum:25,
	    FavourNum:36,
	    viewNum:65,
	    profile:"asdadasdasdasd" //简介
	});

	var post_zixun2=new Post({
	    title : "艺考生的未来4",
	    content : "http://mp.weixin.qq.com/s?__biz=MzA4MTk5NDg2NQ==&mid=209730276&idx=1&sn=adab6382f988132ecf09a202ef95cfdc&scene=0#rd",			//HTML format
	    subtitle : "美术生在十年后将何去何从?美术生在十年后将何去何从?...美术生在十年后将何去何从?美术生在十年后将何去何从?",
	    picUrl : "http://pic.nipic.com/2008-02-21/2008221165914385_2.jpg",
	    thumbUrl : "http://img1.2345.com/duoteimg/qqTxImg/2013/12/ka_3/04-054658_103.jpg",
	    category : Zixun._id,
	    tags : [tag1._id,tag2._id],
	    status : "ACTIVE",
	    createTime : Date.now(),
	    editTime :  Date.now(),
	    likeNum:25,
	    FavourNum:36,
	    viewNum:65,
	    profile:"asdadasdasdasd" //简介
	});

	//必读的文章
	var post_bidu=new Post({
	    title : "艺考生的未来5",
	    content : "http://mp.weixin.qq.com/s?__biz=MzA4MTk5NDg2NQ==&mid=209730276&idx=1&sn=adab6382f988132ecf09a202ef95cfdc&scene=0#rd",			//HTML format
	    subtitle : "美术生在十年后将何去何从?美术生在十年后将何去何从?...美术生在十年后将何去何从?美术生在十年后将何去何从?",
	    picUrl : "http://pic.nipic.com/2008-02-21/2008221165914385_2.jpg",
	    thumbUrl : "http://img1.2345.com/duoteimg/qqTxImg/2013/12/ka_3/04-054658_103.jpg",
	    category : Bidu._id,
	    tags : [tag1._id,tag2._id],
	    status : "ACTIVE",
	    createTime : Date.now(),
	    editTime :  Date.now(),
	    likeNum:25,
	    FavourNum:36,
	    viewNum:65,
	    profile:"asdadasdasdasd" //简介
	});

	//美术的文章
	var post_meishu=new Post({
	    title : "艺考生的未来",
	    content : "http://mp.weixin.qq.com/s?__biz=MzA4MTk5NDg2NQ==&mid=209730276&idx=1&sn=adab6382f988132ecf09a202ef95cfdc&scene=0#rd",			//HTML format
	    subtitle : "美术生在十年后将何去何从?美术生在十年后将何去何从?...美术生在十年后将何去何从?美术生在十年后将何去何从?",
	    picUrl : "http://pic.nipic.com/2008-02-21/2008221165914385_2.jpg",
	    thumbUrl : "http://img1.2345.com/duoteimg/qqTxImg/2013/12/ka_3/04-054658_103.jpg",
	    category : Meishu._id,
	    tags : [tag1._id,tag2._id],
	    status : "ACTIVE",
	    createTime : Date.now(),
	    editTime :  Date.now(),
	    likeNum:25,
	    FavourNum:36,
	    viewNum:65,
	    profile:"asdadasdasdasd" //简介
	});
	console.log("creating posts...");
	return Q.all([tag1, tag2, tag3, tag4,user1, user2, user3,feed1,feed2,Zixun,Gonglue,Bidu,Meishu,
		      Teacher,Studio,Master,School,Jinpai,Sumiao,Beijing, Zhejiang,Select,Jiuda,School_13,post_gonglue1.save(),
		      post_gonglue2.save(),post_zixun1.save(), post_zixun2.save(), post_bidu.save(),post_meishu.save()]);
    }


    function createDianzans(tag1, tag2, tag3, tag4,user1, user2, user3,feed1,feed2,Jiuda,School_13,
			    post_gonglue1,post_gonglue2,post_zixun1,post_zixun2,post_bidu,post_meishu){
	//创建动态点赞
	var dianzan_feed11=new Dianzan({
	    user:user1._id,
	    feed:feed1._id,
	    type:"feed"
	});
	var dianzan_feed12=new Dianzan({
	    user:user1._id,
	    feed:feed2._id,
	    type:"feed"
	});
	var dianzan_feed22=new Dianzan({
	    user:user2._id,
	    feed:feed2._id,
	    type:"feed"
	});

	//创建文章点赞
	var dianzan_post1=new Dianzan({
	    user:user1._id,
	    post:post_gonglue1._id,
	    type:"post"
	});
	var dianzan_post2=new Dianzan({
	    user:user1._id,
	    post:post_zixun1._id,
	    type:"post"
	});
	var dianzan_post3=new Dianzan({
	    user:user2._id,
	    post:post_zixun1._id,
	    type:"post"
	});
	console.log("creating dianzans...");
	return Q.all([tag1, tag2, tag3, tag4,user1, user2, user3,feed1,feed2,Jiuda,School_13,
		      post_gonglue1,post_gonglue2,post_zixun1,post_zixun2,post_bidu,post_meishu,dianzan_feed11.save(), dianzan_feed12.save(),dianzan_feed22.save(),
		      dianzan_post1.save(), dianzan_post2.save(),dianzan_post3.save()]);

    }

    function createFavours(tag1, tag2, tag3, tag4,user1, user2, user3,feed1,feed2,Jiuda,School_13,
			   post_gonglue1,post_gonglue2,post_zixun1,post_zixun2,post_bidu,post_meishu){
	//收藏动态
	var favour_feed11=new Favour({
	    user:user1._id,
	    favoured_feed:feed1._id,
	    type:"feed"
	});
	var favour_feed12=new Favour({
	    user:user1._id,
	    favoured_feed:feed2._id,
	    type:"feed"
	});
	var favour_feed22=new Favour({
	    user:user2._id,
	    favoured_feed:feed2._id,
	    type:"feed"
	});

	//收藏文章
	var favour_post1=new Favour({
	    user:user1._id,
	    favoured_post:post_gonglue1._id,
	    type:"post"
	});
	var favour_post2=new Favour({
	    user:user2._id,
	    favoured_post:post_meishu._id,
	    type:"post"
	});
	var favour_post3=new Favour({
	    user:user2._id,
	    favoured_post:post_zixun1._id,
	    type:"post"
	});
	console.log("creating favours...");
	return Q.all([tag1, tag2, tag3, tag4,user1, user2, user3,feed1,feed2,Jiuda,School_13,
		      post_gonglue1,post_gonglue2,post_zixun1,post_zixun2,post_bidu,post_meishu,favour_feed11.save(),favour_feed12.save(),favour_feed22.save(),
		      favour_post1.save(), favour_post2.save(),favour_post3.save()]);
    }

    function createSchools(tag1, tag2, tag3, tag4,user1, user2, user3,feed1,feed2,Jiuda,School_13,
			   post_gonglue1,post_gonglue2,post_zixun1,post_zixun2,post_bidu,post_meishu){
	//九大美院
	var school1=new School({
	    name:"中央美院",
	    district:"北京",
	    picture:"http://www.touxiang.cn/uploads/20131114/14-065802_226.jpg",
	    profile:"比北大清华都牛逼！",
	    FavourNum:456,
	    category:Jiuda._id
	});

	var school2=new School({
	    name:"清华美术学院",
	    district:"北京",
	    picture:"http://www.touxiang.cn/uploads/20131114/14-065802_226.jpg",
	    profile:"最优质的教学！",
	    FavourNum:200,
	    category:Jiuda._id
	});

	//13所美院
	var school3=new School({
	    name:"四川美院",
	    district:"四川",
	    picture:"http://www.touxiang.cn/uploads/20131114/14-065802_226.jpg",
	    profile:"四川最好的美院！",
	    FavourNum:156,
	    category:School_13._id
	});
	var school4=new School({
	    name:"鲁迅美院",
	    district:"江苏",
	    picture:"http://www.touxiang.cn/uploads/20131114/14-065802_226.jpg",
	    profile:"冲刺高分的宝地！",
	    FavourNum:295,
	    category:School_13._id
	});
	console.log("creating schools...");
	return Q.all([tag1, tag2, tag3, tag4,user1, user2, user3,school1.save(),school2.save(),school3.save(),
		      school4.save()]);

    }


    function createFollows(tag1, tag2, tag3, tag4,user1,user2,user3,school1,school2,school3){
	//用户间关注
	var follow_user12=new Follow({
	    follower:user1._id,
	    followed:user2._id,
	});
	var follow_user13=new Follow({
	    follower:user1._id,
	    followed:user3._id,
	});
	var follow_user23=new Follow({
	    follower:user2._id,
	    followed:user3._id,
	});
	var follow_user32=new Follow({
	    follower:user3._id,
	    followed:user2._id,
	});

	//用户关注高校
	var follow_school1=new Follow({
	    follower:user1._id,
	    followed_school:school1._id,
	});
	var follow_school2=new Follow({
	    follower:user1._id,
	    followed_school:school3._id,
	});
	var follow_school3=new Follow({
	    follower:user3._id,
	    followed_school:school2._id,
	});
	console.log("creating follows...");
	return Q.all([tag1, tag2, tag3, tag4,user1, user2, user3,follow_school1.save(),follow_school2.save(),follow_school3.save(),
		      follow_user12.save(),follow_user13.save(),follow_user23.save(),follow_user32.save()]);

    }

    function createWorks(tag1,tag2,tag3,tag4,user1, user2, user3){
	var work1=new Work({
	    picUrl  :"http://demo.jinguoyuan.com/pzlinfomng/PZLUPLOAD/WZFBW1001/jpg/XZLADMIN121011104957.jpg",
	    content :"",
	    commentNum : 2,
	    like:100,
	    viewNum:300,
	    collectNum:100,
	    flowerNum:0,
	    tags : [tag1._id],
	})

	var work2=new Work({
	    picUrl  :"http://demo.jinguoyuan.com/pzlinfomng/PZLUPLOAD/WZFBW1001/jpg/XZLADMIN121011104957.jpg",
	    content :"Test infddaf  fadfadfd",
	    commentNum : 4,
	    like:200,
	    viewNum:500,
	    collectNum:300,
	    flowerNum:0,
	    tags : [tag2._id]
	})
	console.log("creating works...");
	return Q.all([tag1, tag2, tag3, tag4,user1, user2, user3,work1.save(),work2.save()]);

    }

    function createMessages(user1,user2,user3,work1,work2){
	var message1=new Message({
	    is_read:false,
	    publish_user:user1._id,
	    receive_user:[user2._id,user3._id],
	    publish_time:Date.now(),
	    content:work1
	});
	var message2=new Message({
	    is_read:false,
	    publish_user:user1._id,
	    receive_user:[user2._id,user3._id],
	    publish_time:Date.now(),
	    content:work2
	});
	console.log("creating messages...");
	return Q.all([message1.save(),message2.save()]);

    }
}
