(function(){
	var app = angular.module('Services', []);
	app.service('Feed',['$q','$timeout','$http',function(q,$timeout, $http) {
		// 获得所有Feeds
		var Feed = this;
		Feed.list = [];
		this.getAll = function(isForceUpdate) {
			var d = q.defer();
			if(Feed.list.length==0 || isForceUpdate)
				$timeout(function() {
					$http.get('/js/test_data/data_feeds.json').then(function(data) {
						Feed.list = data.data;
						d.resolve(data.data);
					});
				},1000);
			else
				d.resolve(Feed.list);
			return d.promise;
		};
		// 获得某个feed
		this.get = function(feedid) {
			var d = q.defer();
			$timeout(function() {
				$http.get('/js/test_data/data_feeds_'+feedid+'.json').then(function(data) {
					d.resolve(data.data);
				});
			},1000);
			return d.promise;
		};


		// 为其点赞？
		this.dianzan = function(feedid) {}

		// 收藏
		this.collection = function(feedid) {

			var d = q.defer();
			$timeout(function() {
				$http.get('/js/test_data/data_feeds_'+feedid+'.json').then(function(data) {
					data.data.isKudo = true;
					data.data.kudoNum = data.data.kudoNum+1;
					d.resolve(data.data);
				});
			},1000);
			return d.promise;
		};

		

		// 收藏进收藏夹？

		// 点赞


		this.favour = function(feedid) {
			var d = q.defer();
			$timeout(function() {
				$http.get('/js/test_data/data_feeds_'+feedid+'.json').then(function(data) {
						data.data.isFavour = true;
						data.data.favourNum = data.data.favourNum+1;
						d.resolve(data.data);
				});
			},1000);
			return d.promise;
		};
		// 获得问题标签
		this.getTags = function(tagid) {
			var d = q.defer();
			$timeout(function() {
				$http.get('/js/test_data/data_questiontags_'+tagid+'.json').then(function(data) {
					d.resolve(data.data);
				});
			},1000);
			return d.promise;
		};
	}]);
	app.service('User',['$q','$timeout','$http',function(q,$timeout, $http) {

		// 应用启动时，会自动检测本地是否有之前登录的用户信息
		var User = this;
		User.user = null;
		try{
			User.user = localStorage.user ? JSON.parse(localStorage.user) : null;
		}catch(e){
			User.user = null;
		}
		//暂时就加入user;
		User.user = {};
		//发送验证码
		this.sendcode = function(uid,telephone){
			var d = q.defer();
			$http.post('/user/sendCode').then(function(user){
				User.user = user;
				d.resolve(user);
			});
			return d.promise;
		};

		//登录
		this.login = function(form){
			var d = q.defer();
			$http.post('/user/verifyCode',{"uid":user.uid,"telephone":form.telephone,"code":form.code}).then(function(data){
				User.user = data.user;
				d.resolve(data);
			});
			return d.promise;
		};
		// 获得当前应用的用户, 如果为null则未登录
		this.get = function() {
			var d = q.defer();
			d.resolve(User.user);
			return d.promise;
		};

		this.gettest = function() {
			var d = q.defer();
			if(User.user._id) d.resolve(User.user);
			else
			$http.get('/js/test_data/User.json').then(function(data){
				User.user = data.data;
				d.resolve(data.data);
			});
			return d.promise;
		};
		// 从线上更新用户obj信息
		this.pull = function() {
			var d = q.defer();
			if(!this.user) d.reject();
			else{
				$http.get('/js/test_data/newuser.json').then(function(data) {
					localStorage.user = JSON.stringify(data.data);
					d.resolve(data.data);
				});
			}
			return d.promise;
		};
		// 更新了user这个对象时，可以使用该方法保存
		this.save = function(user) {
			var d = q.defer();
			// 此处应向服务器申请保存此user
			$timeout(function() {
				user.editTime = new Date();
				d.resolve(user);
			},1000);
			return d.promise;
		};
	}]);
	//获取推荐画霸，画室和名师
	app.service('Suggest',['$q','$timeout','$http',function(q,$timeout, $http) {
		var Suggest = this;
		Suggest.TeacherList = [];
		Suggest.StudioList = [];
		Suggest.StudentList = [];
		this.getTeacherSuggestList = function() {
			var d = q.defer();
			if(Suggest.TeacherList.length==0 || isForceUpdate)
				{
					$timeout(function() {
					$http.get('/js/test_data/data_suggest_teacher_list.json')
					.then(function(data) {
						Suggest.TeacherList = data.data;
						d.resolve(data.data);
						});
					},1000);
				}
				else d.resolve(Suggest.TeacherList);
			return d.promise;
		};
		this.getStudioSuggestList = function() {
			var d = q.defer();
			if(Suggest.StudioList.length==0 || isForceUpdate)
				{
					$timeout(function() {
					$http.get('/js/test_data/data_suggest_studio_list.json')
					.then(function(data) {
						Suggest.StudioList = data.data;
						d.resolve(data.data);
						});
					},1000);
				}
				else d.resolve(Suggest.StudioList);
			return d.promise;
		};
		this.getStudentSuggestList = function() {
			var d = q.defer();
			if(Suggest.StudentList.length==0 || isForceUpdate)
				{
					$timeout(function() {
					$http.get('/js/test_data/data_suggest_Student_list.json')
					.then(function(data) {
						Suggest.StudentList = data.data;
						d.resolve(data.data);
						});
					},1000);
				}
				else d.resolve(Suggest.StudentList);
			return d.promise;
		};
		this.saveFollow = function(followList){
			//向服务器发送关注列表
		};
	}]);
	app.service('News',['$q','$timeout','$http',function(q,$timeout, $http) {
		var News = this;
		this.cates = [];
		News.news = {};

		this.getCategories = function() {
			var d = q.defer();
			if(News.cates.length==0)
				$timeout(function() {
					$http.get('/js/test_data/data_news_category.json')
						.then(function(data) {
							News.cates = data.data;
							d.resolve(data.data);
						});
				},1);
			else d.resolve(News.cates);
			return d.promise;
		};

		this.getNews = function(newsid) {
			var d = q.defer();
			$timeout(function() {
				$http.get('/js/test_data/data_news_0000.json')
					.then(function(data) {
						var found = false;
						for(var i = 0; i < data.data.length; i++) {
							var news = data.data[i];
							if(news._id == newsid){
								found = true;
								d.resolve(news);
							}
						}
						if(!found){
							d.resolve(news);
						}
					});
			},1);
			return d.promise;
		};
		this.getNewsList = function(cateid) {
			var d = q.defer();

			if(this.news[cateid] && this.news[cateid].length)
				d.resolve(this.news[cateid]);
			else
				$timeout(function() {
					$http.get('/js/test_data/data_news_'+cateid+'.json')
						.then(function(data) {
							News.news[cateid] = data.data;
							d.resolve(data.data);
						});
				},1000);
			return d.promise;
		};
	}]);

	app.service('Discovery',['$q','$timeout','$http',function(q,$timeout, $http) {
		var Discovery = this;
		this.catesCollection = {};
		this.getCategories = function(category) {
			var d = q.defer();
			// 先看看之前有没有缓冲回来当前category的cates
			if(!Discovery.catesCollection[category])
				$timeout(function() {
					$http.get('/js/test_data/data_discovery_category_'+category+'.json')
						.then(function(data) {
							Discovery.catesCollection[category] = data.data;
							d.resolve(data.data);
						});
				},1000);
			// 如果有了，直接用本地的
			else d.resolve(Discovery.catesCollection[category]);

			return d.promise;
		};
		this.getTeacherList = function(cateid) {
			var d = q.defer();
			$timeout(function() {
				$http.get('/js/test_data/data_discovery_teacher_'+cateid+'.json')
					.then(function(data) {
						d.resolve(data.data);
					});
			},1000);
			return d.promise;
		};
		this.getStudioList = function(cateid) {
			var d = q.defer();
			$timeout(function() {
				$http.get('/js/test_data/data_discovery_studio_'+cateid+'.json')
					.then(function(data) {
						d.resolve(data.data);
					});
			},1000);
			return d.promise;
		};
		this.getMasterList = function() {
			var d = q.defer();
			$timeout(function() {
				$http.get('/js/test_data/data_discovery_master.json')
					.then(function(data) {
						d.resolve(data.data);
					});
			},1000);
			return d.promise;
		};
		this.getSchoolList = function(cateid) {
			var d = q.defer();
			$timeout(function() {
				$http.get('/js/test_data/data_discovery_school_'+cateid+'.json')
					.then(function(data) {
						d.resolve(data.data);
					});
			},1000);
			return d.promise;
		};
	}]);
	//信息服务
	app.service('Message',['$q','$timeout','$http',function(q,$timeout, $http) {
		var Message = this;
		//收到邀请
		Message.InvitationList = [];
		Message.YibaoNotingList = [];
		Message.CommentList = [];
		Message.WorkcatesList = [];
		Message.fansList = [];

		this.getFansList = function(isForceUpdate){
			var d = q.defer();
			if(Message.fansList.length == 0 || isForceUpdate)
				$timeout(function() {
					$http.get('/js/test_data/data_fans.json').then(function(data){
						Message.fansList = data.data;
						d.resolve(data,data);
					});
				}, 10);
			else
				d.resolve(Message.fansList);
			return d.promise;
		};

		this.getInvitationList = function(isForceUpdate){
			var d = q.defer();
			if(Message.InvitationList.length==0 || isForceUpdate)
				$timeout(function(){
					$http.get('/js/test_data/data_invitation.json').then(function(data){
						Message.Invitationlist = data.data;
						d.resolve(data,data);
					});
				},1000);
			else
				d.resolve(Message.InvitationList);
			return d.promise;
		};
		this.getWorkcatesList = function(isForceUpdate){
			var d = q.defer();
			if(Message.WorkcatesList.length==0 || isForceUpdate)
				$timeout(function(){
					$http.get('/js/test_data/data_Workcates.json').then(function(data){
						Message.Workcateslist = data.data;
						d.resolve(data,data);
					});
				},1000);
			else
				d.resolve(Message.WorkcatesList);
			return d.promise;
		};
		this.getYibaoNotingList = function(isForceUpdate){
			var d = q.defer();
			if(Message.YibaoNotingList.length==0 || isForceUpdate)
				$timeout(function(){
					$http.get('/js/test_data/data_invitation.json').then(function(data){
						Message.YibaonotingList = data.data;
						d.resolve(data.data);
					});
				},1000);
			else
				d.resolve(Message.YibaonotingList);
			return d.promise;
		};
		this.getCommentList = function(isForceUpdate){
			var d = q.defer();
			if(Message.CommentList.length==0 || isForceUpdate)
				$timeout(function(){
					$http.get('/js/test_data/data_comment.json').then(function(data){
						Message.CommentList = data.data;
						d.resolve(data.data);
					});
				},1000);
			else
				d.resolve(Message.CommentList);
			return d.promise;
		};
	}]);
	//标签获取
	app.service('Tags',['$q','$timeout','$http',function(q,$timeout, $http) {
		var Tags = this;

		Tags.tagsList = [];
		this.getTagsList = function(isForceUpdate){
			var d = q.defer();
			if(Tags.tagsList.length==0 || isForceUpdate)
				$timeout(function(){
					$http.get('/js/test_data/data_tags.json').then(function(data){
						Tags.tagsList = data.data;
						d.resolve(data,data);
					});
				},1000);
			else
				d.resolve(Tags.tagsList);
			return d.promise;
		};
	}]);

	app.service('Search',['$q','$timeout','$http',function(q,$timeout, $http) {
		var Search = this;
		this.getSearchTeaList = function() {
			var d = q.defer();
			$timeout(function() {
				$http.get('/js/test_data/data_search_teacher.json')
					.then(function(data) {
						d.resolve(data.data);
					});
			},1000);
			return d.promise;
		};
		this.getSearchStuList = function() {
			var d = q.defer();
			$timeout(function() {
				$http.get('/js/test_data/data_search_studio.json')
					.then(function(data) {
						d.resolve(data.data);
					});
			},1000);
			return d.promise;
		};
		this.getSearchMasList = function() {
			var d = q.defer();
			$timeout(function() {
				$http.get('/js/test_data/data_search_master.json')
					.then(function(data) {
						d.resolve(data.data);
					});
			},1000);
			return d.promise;
		};
		this.getSearchSchList = function() {
			var d = q.defer();
			$timeout(function() {
				$http.get('/js/test_data/data_search_school.json')
					.then(function(data) {
						d.resolve(data.data);
					});
			},1000);
			return d.promise;
		};
		this.getSearchStrList = function() {
			var d = q.defer();
			$timeout(function() {
				$http.get('/js/test_data/data_search_strategy.json')
					.then(function(data) {
						d.resolve(data.data);
					});
			},1000);
			return d.promise;
		};
		this.getSearchZiList = function() {
			var d = q.defer();
			$timeout(function() {
				$http.get('/js/test_data/data_search_zixun.json')
					.then(function(data) {
						d.resolve(data.data);
					});
			},1000);
			return d.promise;
		};

	}]);
})();
