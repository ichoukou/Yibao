(function(){
	// 定义大的App Module
	var app = angular.module('YibaoApp', ['ui.router','ngTouch','ngAnimate','ui.bootstrap','Controllers','Services','Filters','Directives']);
	// 配置路由
	// e.g. 使用
	app.config(['$stateProvider','$urlRouterProvider',function(stateProvider,url) {
		url.when("", "/prelogin");
		url.when("", "/base/feed");
		url.when('/base/news','/base/news/strategy');
		url.when('/base/news/zixun','/base/news/zixun/0001');
		url.when('/base/discovery','/base/discovery/teacher');
		url.when('/base/discovery/teacher','/base/discovery/teacher/0000');

		//启动界面
		stateProvider.state('welcome',{
			url : '/welcome',
			templateUrl : "views/page_start.html",
			controller : "startCtrl"
		});


		// 登录页面
		stateProvider.state('prelogin',{
			url : '/prelogin',
			templateUrl : "views/page_prelogin.html",
			controller : "preloginCtrl"
		}).state('login',{
			url : '/login',
			templateUrl : "views/page_login.html",
			controller : "loginCtrl"
		});

		//配置新用户子路由
		stateProvider.state('basicinfo',{
			url : "/basicinfo",
			templateUrl : "views/page_basic_info.html",
			controller : "basicinfoCtrl"
		}).state('selectIdentity',{
			url : "/selectIdentity",
			templateUrl : "views/page_selectIdentity.html",
			controller : "selectIdentityCtrl"
		}).state('suggested',{
			url : '/suggested',
			templateUrl : 'views/page_suggested_follow.html',
			controller : 'suggestedCtrl'
		});

		// 主页面
		stateProvider.state('base',{
			url : "/base",
			templateUrl : "views/page_main.html"
		});

		// 配置"动态"子页面的路由
		stateProvider.state('base.feed',{
			url : "/feed",
			templateUrl : "views/page_feeds.html",
			controller : "feedsCtrl"
		}).state('base.feed.detail',{
			url : "/{feedid}",
			controller :
			["$modal","$stateParams","$state","$scope",
			 function($modal,$stateParams,$state,$scope) {
				 var modalInstance = $modal.open({
					 templateUrl: 'views/page_feeds_detail.html',
					 resolve: {
						 feedid: function() {
							 return $stateParams.feedid;
						 }
					 },
					 controller : "feedsDetailCtrl"
				 });
				 $scope.$on('$destroy',function() {
					 modalInstance.close('stateSwitch');
				 }); 
				 modalInstance.result.then(function(reason) {
					 if(reason != 'stateSwitch')
						 $state.go('^');
				 },function(reason) {
					 $state.go('^');
				 });
			 }]
		}).state('base.feed.view',{
			url : "/view/{feedid}",
			controller :
			["$modal","$stateParams","$state","$scope",
			 function($modal,$stateParams,$state,$scope) {
				 var modalInstance = $modal.open({
					 templateUrl: 'views/page_picView.html',
					 resolve: {
						 feedid: function() {
							 return $stateParams.feedid;
						 }
					 },
					 controller : "picViewCtrl"
				 });
				 $scope.$on('$destroy',function() {
					 modalInstance.close('stateSwitch');
				 });
				 modalInstance.result.then(function(reason) {
					 if(reason != 'stateSwitch')
						 $state.go('^');
				 },function(reason) {
					 $state.go('^');
				 });
			 }]
		}).state('base.feed.comment',{
			url : "/comment/{feedid}",
			controller : 
			["$modal","$stateParams","$state","$scope",
			 function($modal,$stateParams,$state,$scope) {
				 var modalInstance = $modal.open({
					 templateUrl: 'views/page_comment.html',
					 resolve: {
						 feedid: function() {
							 return $stateParams.feedid;
						 }
					 },
					 controller : "commentCtrl"
				 });
				 $scope.$on('$destroy',function() {
					 modalInstance.close('stateSwitch');
				 });
				 modalInstance.result.then(function(reason) {
					 if(reason != 'stateSwitch')
						 $state.go('^');
				 },function(reason) {
					 $state.go('^');
				 });
			 }]
		});

		// 配置"攻略"页面下的路由
		stateProvider.state('base.news',{
			url : "/news",
			templateUrl : "views/page_news.html",
			controller : "newsCtrl"
		}).state('base.news.strategy',{
			url : '/strategy',
			templateUrl : 'views/page_news_strategy.html',
			controller : 'newsStrategyCtrl'
		}).state('base.news.zixun',{
			url : '/zixun/{cateid}',
			templateUrl : 'views/page_news_zixun.html',
			controller : 'zixunCtrl'
		});

		// [暂时冗余的]查看文章详情的view
		stateProvider.state('base.news.strategy.view',{
			url : '/view/{newsid}',
			controller :
			["$modal","$stateParams","$state","$scope",
			 function($modal,$stateParams,$state,$scope) {
				 if(document.querySelectorAll('.modal').length>0)
					 return;
				 var modalInstance = $modal.open({
					 templateUrl: 'views/page_news_view.html',
					 resolve: {
						 feedid: function() {
							 return $stateParams.feedid;
						 }
					 },
					 controller : "viewCtrl"
				 });
				 $scope.$on('$destroy',function() {
					 modalInstance.close('stateSwitch');
				 });
				 modalInstance.result.then(function(reason) {
					 if(reason != 'stateSwitch')
						 $state.go('^');
				 },function(reason) {
					 $state.go('^');
				 });
			 }]
		}).state('base.news.zixun.view',{
			url : '/view/{newsid}',
			controller :
			["$modal","$stateParams","$state","$scope",
			 function($modal,$stateParams,$state,$scope) {
				 if(document.querySelectorAll('.modal').length>0)
					 return;
				 var modalInstance = $modal.open({
					 templateUrl: 'views/page_news_view.html',
					 resolve: {
						 feedid: function() {
							 return $stateParams.feedid;
						 }
					 },
					 controller : "viewCtrl"
				 });
				 $scope.$on('$destroy',function() {
					 modalInstance.close('stateSwitch');
				 });
				 modalInstance.result.then(function(reason) {
					 if(reason != 'stateSwitch')
						 $state.go('^');
				 },function(reason) {
					 $state.go('^');
				 });
			 }]
		});



		// 配置发现界面
		stateProvider.state('base.discovery',{
			url : "/discovery",
			templateUrl : "views/page_discovery.html",
			controller : "discoveryCtrl"
		}).state('base.discovery.teacher',{
			url : '/teacher/{cateid}',
			templateUrl : "views/page_discovery_teacher.html",
			controller : "discoveryTeacherCtrl"
		}).state('base.discovery.studio',{
			url : '/studio/{cateid}',
			templateUrl : "views/page_discovery_studio.html",
			controller : "discoveryStudioCtrl"
		}).state('base.discovery.master',{
			url : '/master',
			templateUrl : "views/page_discovery_master.html",
			controller : "discoveryMasterCtrl"
		}).state('base.discovery.school',{
			url : '/school/{cateid}',
			templateUrl : "views/page_discovery_school.html",
			controller : "discoverySchoolCtrl"
		});
		//配置搜索页面
		stateProvider.state('base.search',{
			url : "/search",
			templateUrl : "views/page_search.html",
			controller : "searchCtrl"
		})
		// 上传作品页面
		stateProvider.state('camera',{
			url : '/camera',
			templateUrl : "views/page_camera.html",
			controller : "cameraCtrl"
		});

		//配置个人中心界面
		stateProvider.state('base.me',{
			url : '/me',
			templateUrl : "views/page_info.html",
			controller : "meCtrl"
		}).state('edit',{
			url : '/edit',
			templateUrl : "views/page_info_edit.html",
			controller : "meEditCtrl"
		}).state('getInvitation',{
			url : '/getInvitation',
			templateUrl : "views/page_invitation.html",
			controller : "meGetInvitationCtrl"
		}).state('publish',{
			url : '/publish',
			templateUrl : "views/page_publish.html",
			controller : "mePublishCtrl"
		}).state('getComment',{
			url : '/getComment',
			templateUrl : "views/page_getComment.html",
			controller : "meGetCommentCtrl"
		}).state('homePage',{
			url : '/homePage',
			templateUrl : "views/page_homepage.html",
			controller : "meHomePageCtrl"
		}).state('yibaoNoting',{
			url : '/yibaoNoting',
			templateUrl : "views/page_yibao_noting.html",
			controller : "meYibaoNotingCtrl"
		}).state('contacts',{
			url : '/contacts',
			templateUrl : "views/page_contacts.html",
			controller : "meContactsCtrl"
		}).state('chat',{
			url : '/chat',
			templateUrl : "views/page_chat.html",
			controller : "meChatCtrl"
		}).state('favour',{
			url : '/favour',
			templateUrl : "views/page_favour.html",
			controller : "meFavourCtrl"
		}).state('focus',{
			url : '/focus',
			templateUrl : "views/page_focus.html",
			controller : "meFocusCtrl"
		}).state('fans',{
			url : '/fans',
			templateUrl : "views/page_fans.html",
			controller : "meFansCtrl"
		});
	 }]);
})();
