(function(){

	var app = angular.module('Controllers', []);
	app.c = app.controller;

	app.c('baseCtrl', ['$scope', function(s){

	}]);


	// 一些全局函数的初始化
	app.c('bodyCtrl', ['$scope','$state', "$rootScope",'$timeout',function(s,$state,$rootScope,$timeout){
		// alert函数可以被全局调用
		$rootScope.alert = function(text, time) {
			time = time || 1500;
			var alert = angular.element(document.querySelector('body'))
					.append('<div class="alert"><span>'+text+'</span></div>');
			var alerts = document.querySelectorAll('.alert');
			alert = angular.element(alerts[alerts.length-1]);

			alert.css({display : "block"});
			$timeout(function() {
				alert.css('display','none');
			},time);
		};
		// 记录状态的变化
		$rootScope.previousState = null;
		$rootScope.currentState = null;
		$rootScope.$on('$stateChangeSuccess', function(ev, to, toParams, from, fromParams) {
			$rootScope.previousState = from.name;
			$rootScope.currentState = to.name;
		});
		$rootScope.$on('$stateChangeStart',function(e,toState) {
			console.log('going to state : ', toState);
		});
	}]);

	//启动界面，判断是直接进入feed,还是进入登录界面
	app.c('startCtrl',['$scope','$state','User',function(s,$state,User){
		User.get().then(function(Userstate){
			if(Userstate != null)
				 setTimeout(function(){$state.go('base.feed')},2000);//增加一个进入界面的延时，提供应用初始化时间
			else
				 setTimeout(function(){$state.go('prelogin')},2000);
		});
	}]);

	//预登录界面的controller
	app.c('preloginCtrl',['$scope','$state',function(s,$state){
		s.go = function(){
			$state.go('login');
		}
	}]);

	//登录界面的controller
	app.c('loginCtrl',['$scope','$state','$timeout','User',function(s,$state,$timeout,User){
		s.form = {};
		s.send = true;
		s.isReady = true;
		s.sendcodetxt = "发送验证";

		s.sendcode = function(){
			s.isReady = false;
			if(s.send == true)
				{
					var countdown = 45;
					s.send = false;
					s.settime = function(countdown){
					if (0 == countdown)
					{//计数归零，重新挂载验证
						s.isReady = true;
						s.sendcodetxt = "发送验证";
						s.send = true;
					} else {
						s.sendcodetxt = countdown;
						countdown--;
						$timeout(function()
					{//采用递归调用，进行计数
						s.settime(countdown);
							},1000);
						}
					};
					s.settime(countdown);
					User.sendcode().then(function(data){
						if(0 != data.code)
						{
							alert(data.data);
						}
						else
							alert('发送成功');
					});
				}
		};

		s.login = function(){
			if(s.form.$invalid)
			{
				User.login(s.form).then(function(data){
					if(!data.code && 'OK' == data.user.status)
						$state.go('base.feed');
					else
						alert(data.code);
				});
			}
		};
	}]);

	//新用户首次输入性别名字信息的controller
	app.c('basicinfoCtrl',['$scope','$state','User',function(s,$state,User){
		s.form = {};
		s.form.gender = false;
		s.form.district = "北京";
		s.next = function(){
			User.get().then(function(user){
				user.gender = s.form.gender ? "male":"female";
				user.name = s.form.name;
				User.save(user);
				$state.go('selectIdentity');
			});
		};
		s.select = function(){
			//选择地址
			$state.go('selectAddress');
		};

	}]);

		//新用户首次输入身份的controller
	app.c('selectIdentityCtrl',['$scope','$state','User',function(s,$state,User){
		s.status = 'student_ing';
		s.isShow = true;
		s.finish = function(){
			User.get().then(function(user){
				user.role = s.status;
				User.save(user);
				$state.go('suggested');
			});
		};
	}]);

	//推荐画霸，画室，和名师
	app.c('suggestedCtrl',['$scope','$state','$stateParams','Suggest','User',function(s,$state,$stateParams,Suggest,User){
		s.status = 'student';
		s.persons = [];
		s.follow = [];
		s.getStudentList = function(){
			s.status = 'student';
			Suggest.getStudentSuggestList().then(function(list){
				s.persons = list;
			});
		};
				s.getStudentList();
		s.getTeacherList = function(){
			s.status = 'teacher';
			Suggest.getTeacherSuggestList().then(function(list){
				s.persons = list;
			});
		};
		s.getStudioList = function(){
			s.status = 'studio';
			Suggest.getStudioSuggestList().then(function(list){
				s.persons = list;
			});
		};
		s.addfollow = function(){
			s.follow[$routeParams].type = "USER";
			s.follow[$routeParams].target = $routeParams._id;
			s.follow[$routeParams].user = User.user;
			//标记关注
		};
		s.next =function(){
			//保存关注
			Suggest.saveFollow(s.follow);
			$state.go('base.feed');
		};
	}]);

	// 动态浏览 Feeds 的 controller
	app.c('feedsCtrl', ['$scope','$state','Feed',function(s,$state,Feed){
		s.isLoading = true;
		s.feeds = [];
		Feed.getAll().then(function(feeds) {
			s.isLoading = false;
			s.feeds = feeds;
		});
		s.view = function(feed) {
			$state.go('feedDetail',{feedid: feed._id});
		};
		var element = angular.element(document.querySelector('#menu-contents'));
		s.viewPic = function(feedid) {
			$state.go('base.feed.view',{feedid : feedid});
		};
		s.viewComment = function(feedid) {
			$state.go('base.feed.comment',{feedid : feedid});
		};
		element.css({
			"transform"  : "translate3d(0,0,0)"
		});
	}]);

	// 查看feed detail 的 controller
	app.c('feedsDetailCtrl',['$scope','$stateParams','$state','Feed',function(s,$stateParams,$state,Feed){
		s.isLoading = true;
		s.feed = {};
		s.comments = [];
		s.reviews = [];
		var feedid = $stateParams.feedid;
		Feed.get(feedid).then(function(feed) {
			s.isLoading = false;
			s.feed = feed;
			s.comments = feed.comments;
			s.reviews = feed.reviews;
		});
		s.viewComment = function(feedid) {
			$state.go('base.feed.comment',{feedid : feedid});
		};
	}]);
	// news列表的controller
	app.c('newsCtrl', ['$scope', function(s){
		var element = angular.element(document.querySelector('#menu-contents'));
		element.css({
			"transform"  : "translate3d(-100%, 0,0)"
		});
	}]);
	app.c('newsStrategyCtrl', ['$scope',"$state", 'News',function(s,$state,News){
		s.articles = [];
		s.isLoading = true;
		News.getNewsList('0000').then(function(items) {
			s.isLoading = false;
			s.articles = items;
		});
		// A hack 的方法，使得，假如有一个item被点击之后，其他的item再被点击是无效的
		s.haveView = function(id) {
			var hasModal = document.querySelectorAll('.modal').length > 0;
			if($state.current=="base.news.zixun.view" || hasModal)
				return;
			$state.go('.view',{newsid:id});
		};
		s.goZixun = function() {
			$state.go('^.zixun');
		};
	}]);
	app.c('zixunCtrl', ['$scope', '$stateParams' ,'$state', 'News', function(s, $stateParams, $state, News){
		s.cates = [];
		s.list = [];
		s.isDisabled = false;
		if(!$stateParams.cateid)
			return $state.go('base.news.zixun',{cateid:"0001"});
		s.isLoading = true;
		News.getCategories().then(function(cates) {
			s.isLoading = false;
			s.cates = cates;
		});
		News.getNewsList($stateParams.cateid).then(function(list) {
			s.isLoading = false;
			s.list = list;
		});

		// A hack 的方法，使得，假如有一个item被点击之后，其他的item再被点击是无效的
		s.haveView = function(id) {
			var hasModal = document.querySelectorAll('.modal').length > 0;
			if($state.current=="base.news.zixun.view" || hasModal)
				return;
			$state.go('.view',{newsid:id});
		};
		s.goStrategy = function() {
			$state.go('search');
		};
	}]);

	//发现列表的controller
	app.c('discoveryCtrl', ['$scope', function(s){
		console.log('Enter discoveryCtrl');
	}]);

	app.c('discoveryTeacherCtrl', ['$scope','$stateParams','$state','Discovery', function(s,$stateParams,$state,Discovery){
		s.cates = [];
		s.list = [];
		if(!$stateParams.cateid)
			return $state.go('.',{cateid:"0000"});
		s.isLoading = true;
		Discovery.getCategories("0000").then(function(cates) {
			s.isLoading = false;
			s.cates = cates;
		});

		Discovery.getTeacherList($stateParams.cateid).then(function(list) {
			s.isLoading = false;
			s.list = list;
		});

	}]);
	app.c('discoveryStudioCtrl', ['$scope','$stateParams','$state','Discovery', function(s,$stateParams,$state,Discovery){
		s.cates = [];
		s.list = [];
		if(!$stateParams.cateid)
			return $state.go('.',{cateid:"0000"});
		s.cateid = $stateParams.cateid;
		s.isLoading = true;
		Discovery.getCategories("0001").then(function(cates) {
			s.isLoading = false;
			s.cates = cates;
		});

		Discovery.getStudioList($stateParams.cateid).then(function(list) {
			s.isLoading = false;
			s.list = list;
		});
	}]);
	app.c('discoveryMasterCtrl', ['$scope', 'Discovery',function(s,Discovery){
		s.items = [];
		s.isLoading = true;
		Discovery.getMasterList().then(function(items) {
			s.isLoading = false;
			s.items = items;
		});
	}]);
	app.c('discoverySchoolCtrl', ['$scope','$stateParams','$state','Discovery', function(s,$stateParams,$state,Discovery){
		s.cates = [];
		s.list = [];

		if(!$stateParams.cateid)
			return $state.go('.',{cateid:"0000"});
		s.isLoading = true;
		Discovery.getCategories("0002").then(function(cates) {
			s.isLoading = false;
			s.cates = cates;
		});



		Discovery.getSchoolList($stateParams.cateid).then(function(list) {
			s.isLoading = false;
			s.list = list;
		});
	}]);

	app.c('viewCtrl', ['$scope','$stateParams','News','$state','$timeout' ,function(s,$stateParams,News,$state,$timeout){
		s.newsid = $stateParams.newsid;
		s.news = {};
		News.getNews(s.newsid).then(function(news) {
			// 这里的延迟是为了使得slide-in的时候不卡
			$timeout(function() {
				s.news = news;
			},500);
		});

	}]);

	app.c('picViewCtrl', ['$scope','$stateParams','Feed',function(s,$stateParams,Feed){
		s.feedid = $stateParams.feedid;
		s.picUrl = "";
		Feed.get(s.feedid).then(function(feed) {
			s.picUrl = feed.picUrl;
		});


	}]);

	app.c('commentCtrl', ['$scope','$stateParams','Feed',function(s,$stateParams,Feed){
		s.feedid = $stateParams.feedid;
		s.isLoading = true;
		s.feed = {};
		s.comments = [];
		s.tags = [];
		s.tagid = "0000";
		Feed.get(s.feedid).then(function(feed) {
			s.isLoading = false;
			s.feed = feed;
			s.comments = feed.comments;
		});
		Feed.getTags(s.tagid).then(function(tags) {
			s.tags = tags;
		});
	}]);

	//搜索页面 controller
	app.c('searchCtrl', ['$scope', 'Search',function(s,Search){
		s.teachers = [];
		s.studios = [];
		s.masters = [];
		s.schools = [];
		s.strategys = [];
		s.zixuns = [];
		Search.getSearchTeaList().then(function(teachers) {
			s.teachers = teachers;
		});
		Search.getSearchStuList().then(function(studios) {
			s.studios = studios;
		});
		Search.getSearchMasList().then(function(masters) {
			s.masters = masters;
		});
		Search.getSearchSchList().then(function(schools) {
			s.schools = schools;
		});
		Search.getSearchStrList().then(function(strategys) {
			s.strategys = strategys;
		});
		Search.getSearchZiList().then(function(zixuns) {
			s.zixuns = zixuns;
		});
	}]);

	// 照相上传 controller
	app.c('cameraCtrl', ['$scope', '$stateParams','$state','$rootScope',function(s,$stateParams,$state,$rootScope){
		s.form = {};
		s.goback = function() {
			$state.go($rootScope.previousState || 'base.feed');
		};
		s.next = function() {
			if(!s.form.comment || s.form.comment.length < 4)
				return alert('请至少填写4个字才能进行发布');
			return true;
		};
	}]);

	// 个人中心界面控制
	app.c('meCtrl',['$scope','$state','User',function(s,$state,User){
		s.user = {};
		s.isStudent = true;
		s.invitation = "老师点评";
		s.isIdentited = "未认证";
		User.gettest().then(function(user){
			s.user = user;
			if(s.user.role != 'student')
				{
					s.isStudent = false;
					s.invitation = "收到邀请";
					if(s.user.isIdentited)
						s.isIdentited = "已认证";
					else
						s.isIdentited = "未认证";
				}
		});

	}]);

	//个人信息界面controller
	app.c('meEditCtrl',['$scope','$state','User',function(s,$state,User){
		var user={
			"proUrl" : "/img/head.jpg",
			"name" : "刘习文",
			"identitied" : "去认证",
			"gender" : "女",
			"role" : "教师",
			"telephone" : "18301559673",
			"qq" : "946588655",
			"unit" : "清美博大",
			"district" : "北京",
			"city" : "海淀"
		};
		s.user = user;
	}]);

	app.c('meFansCtrl',['$scope','$state','Message',function(s,$state,Message){
		s.fans=[];
		Message.getFansList(1).then(function(data){
			s.fans = data.data;
		});
		s.view = function(fan){
			$state.go('InvitationDetail',{invitationid: invitation._id});
		};
	}]);

	//邀请界面controller
	app.c('meGetInvitationCtrl',['$scope','$state','Message',function(s,$state,Message){
		s.invitations=[];
		Message.getInvitationList(1).then(function(data){
			s.invitations = data.data;
		});
		s.view = function(invitation){
			$state.go('InvitationDetail',{invitationid: invitation._id});
		};
		s.goback =function(){
			$state.go('base.me');
		};
	}]);

	//我的发布界面controller
	app.c('mePublishCtrl',['$scope','$state','Message',function(s,$state,Message){
		Message.getWorkcatesList(1).then(function(data){
			s.workcates = data.data;
		});
	}])

	//收到评论界面controller
	app.c('meGetCommentCtrl',['$scope','$state','Message',function(s,$state,Message){
		Message.getCommentList(1).then(function(data){
			s.comments = data;
		});
	}]);
	app.c('meHomePageCtrl',['$scope','$state','User','Tags','Message',function(s,$state,User,Tags,Message){
		s.user = {};
		s.isStudent = true;
		s.isEdit = false;
		s.invitation = "老师点评";
		s.isIdentited = "未认证";
		User.gettest().then(function(user){
			s.user = user;
			if(s.user.role != 'student')
				{
					s.isStudent = false;
					s.invitation = "收到邀请";
					if(s.user.isIdentited)
						s.isIdentited = "已认证";
					else
						s.isIdentited = "未认证";
				}
		});
		s.alltags = [];
		Tags.getTagsList().then(function(list){
			s.alltags = list.data;
			//这两个可能占资源，忽略，也没几个标签
			for(var j = 0; j < s.alltags.length; j++)
			{
				s.alltags[j].isSelected = false;
			}
			for(var i = 0; i < s.user.tags.length; i++)
			{
				for(var j = 0; j < s.alltags.length; j++)
				{
					if(s.user.tags[i] == s.alltags[j].name)
						s.alltags[j].isSelected = true;
				}
			}
			//虽然有点长，等雨秾学长压缩下就可以了
		});
		Message.getWorkcatesList(1).then(function(data){
			s.workcates = data.data;
		});
		s.specialityEdit = function(){
			if(s.isEdit)
				s.save();
			else
				s.isEdit = true;
		};
		s.save = function(){
			s.user.tags = [];
			s.isEdit = false;
			var j = 0;
			for(var i = 0; i < s.alltags.length; i++)
			{
				if(s.alltags[i].isSelected)
					s.user.tags[j++] = s.alltags[i].name;
			}
			// User.save(s.user).then(function(){
			// 	alert("保存完毕");
			// });
		};
	}]);
	app.c('meYibaoNotingCtrl',['$scope','$state','Message',function(s,$state,Message){
		// Message.getYibaoNotingList(1).then(function(data){
		// 	s.comments = data;
		// });
	}]);
	app.c('meFavourCtrl',['$scope','$state','Message',function(s,$state,Message){

	}]);
})();
