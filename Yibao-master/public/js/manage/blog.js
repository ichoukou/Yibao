(function() {
	var app = angular.module('blogApp', []);
	app.c = app.controller;

	app.c('categoryCtrl', ['$scope', 'Category', function(s, Category) {
		s.cates = [];
		Category.get().then(function(cates) {
			s.cates = Category.cates;
		});

		s.insert = function() {
			Category.insert('新类别').then(function(cate) {
				if (cate)
					s.cates.push(cate);
				else
					alert('该类别已存在');
			});
		};
		s.remove = function($index, cate) {
			Category.remove(cate).then(function() {
				s.cates.splice($index, 1);
			});
		};
		s.toggleStatus = function(cate) {
			if (cate.status == "DEACTIVE")
				cate.status = 'ACTIVE';
			else cate.status = 'DEACTIVE';
			Category.update(cate).then(function(newcat) {
				cate = newcat;
			});
		};
	}]);
	app.c('postsCtrl', ['$scope', 'Post', function(s, Post) {
		s.posts = [];
		Post.get().then(function(posts) {
			s.posts = Post.posts;
		});
		s.toggleStatus = function(item) {
			if (item.status == "DEACTIVE")
				item.status = 'ACTIVE';
			else item.status = 'DEACTIVE';
			Post.update(item).then(function(newitem) {
				item = item;
			});
		};

		s.remove = function($index, post) {
			Post.remove(post).then(function() {
				s.posts.splice($index, 1);
			});
		};

		s.preview = function(id){
			window.open("/article/" + id);
		};
	}]);


	app.c('categoryEditCtrl', ['$scope', '$stateParams', '$state', 'Category', function(s, $stateParams, $state, Category) {
		s.$parent.rightShow = true;
		s.cate = {};
		s.$on('$destroy', function() {
			s.$parent.rightShow = false;
		});
		Category.get($stateParams.cateid).then(function(cate) {
			s.cate = cate;
		});
		s.save = function() {
			if (!s.cate.name)
				return alert("请输入新的名字");
			Category.update(s.cate).then(function(newCategory) {
				if (newCategory) {
					$state.go("blog.category");
					Category.cates.splice($stateParams.index, 1, newCategory);
				} else {
					alert("该类别已存在");
				}
			});
			return;
		};
	}]);

	//分类父子关系管理控制器
	app.c('cateRelationCtrl', ['$scope', '$state', 'Category', function(s, $state, Category){
		s.parentCategory = "";
		s.subCategory = "";
		s.isparent = false;

		s.remove=function(){
			s.parentCategory="";
			s.subCategory = "";
			s.isparent = false;
		}

		s.query=function(){
			Category.getByName(s.parentCategory).then(function(pCategory){
				if(!pCategory){
					return alert("父分类不存在");
				}
				Category.getByName(s.subCategory).then(function(sCategory){
					if(!sCategory){
						return alert("子分类不存在");
					}
					else if(sCategory.parent == pCategory._id){
						s.isparent=true;
					}else{
						return alert("不存在父子关系");
					}

				});
			});
		}

		s.bind = function(){
			if(s.parentCategory && s.subCategory){
				Category.getByName(s.parentCategory).then(function(pCategory){
					if(!pCategory)
						return alert("不存在父分类");
					Category.getByName(s.subCategory).then(function(sCategory){
						if(!sCategory)
							return alert("不存在子分类");
						if(sCategory.parent == pCategory._id)
							return alert("已存在父子关系");
						sCategory.parent = pCategory._id;
						Category.updateRelation(sCategory).then(function(newCategory){
							s.isparent = true;
							return alert("绑定成功");
						});
					});
				});
			}else{
				return alert("请输入分类名");
			}
		};

		s.cancel=function(){
			if(s.parentCategory && s.subCategory){
				Category.getByName(s.parentCategory).then(function(pCategory){
					if(!pCategory)
						return alert("不存在父分类");
					Category.getByName(s.subCategory).then(function(sCategory){
						if(!sCategory)
							return alert("不存在子分类");
						if(sCategory.parent == pCategory._id)
							sCategory.parent = null;
						Category.updateRelation(sCategory).then(function(newCategory){
							s.isparent = false;
							return alert("撤销成功");
						});
					});
				});
			}else{
				return alert("请输入分类名");
			}
		}
	}]);
	app.c('articleCtrl', ['$scope', '$stateParams', 'Post', function(s, $stateParams, Post) {
		s.post = {};
		Post.get($stateParams._id).then(function(post) {
			s.post = post;
			$("#mainContent").html(s.post.content);
		});
	}]);

	app.c('postEditCtrl', ['$scope', "$stateParams", 'EditPostService', '$state', 'Category', 'Post', 'Tag', 'FileUpload', '$rootScope', function(s, $stateParams, EditPostService, $state, Category, Post, Tag, FileUpload, $rootScope) {
		s.$parent.rightShow = true;
		s.post = {};
		s.cates = [];
		s.myTags = "";
		s.$on('$destroy', function() {
			s.$parent.rightShow = false;
		});
		s.addCover = function(id) {
			FileUpload.getFileUrl(id).then(function(url) {
				s.post.picUrl = url;
			});
		};
		s.addThumbnail = function(id) {
			FileUpload.getFileUrl(id).then(function(url) {
				s.post.thumbUrl = url;
			});
		};
		$('.summernote').summernote({
			height: 150,
			lang: 'zh-CN',
			onImageUpload: function(files, editor, welEditable) {
				FileUpload.sendFile(files[0], editor, welEditable);
			}
		});
		Category.get().then(function(cates) {
			s.cates = cates;
		});
		Post.get($stateParams.postid).then(function(post) {
			s.post = post;
			$('.summernote').code(s.post.content);
			console.log(s.post.content);
		});

		s.saveTags = function() {
			Post.updateTags(s.myTags).then(function(tagList) {
				for (var i in tagList) {
					if (!has_Tag(s.post.tags, tagList[i])) {
						s.post.tags.unshift(tagList[i]);
					}
				}
			});
			s.myTags = "";
		};
		s.removeTags = function() {
			s.post.tags = [];
		};
		s.save = function() {
			var content = $('.summernote').code();
			s.post.content = content;
			s.post.category = s.post.category._id;
			if (!s.post.title)
				return alert('请添加文章标题');
			if (!s.post.category)
				return alert('请选择文章类别');
			$state.go('blog.posts');
			Post.update(s.post);
			var tagIdlist = [];
			for (var i in s.post.tags)
				tagIdlist.push(s.post.tags[i]._id);
			s.post.tags = tagIdlist;
			Post.update(s.post);
		};
	}]);

	app.c('postCreateCtrl', ['$scope', 'EditPostService','$state', 'Category', 'Post', 'FileUpload', function(s, EditPostService, $state, Category, Post, FileUpload) {
		s.$parent.rightShow = true;
		s.post = {};
		s.post.tags = [];
		s.cates = [];
		Category.get().then(function(cates) {
			s.cates = cates;
		});
		s.$on('$destroy', function() {
			s.$parent.rightShow = false;
		});

		s.addCover = function(id) {
			FileUpload.getFileUrl(id).then(function(url) {
				s.post.picUrl = url;
			});
		};
		s.addThumbnail = function(id) {
			FileUpload.getFileUrl(id).then(function(url) {
				s.post.thumbUrl = url;
			});
		};
		// summernote启动并初始化参数，高度、语言
		$('.summernote').summernote({
			height: 150,
			lang: 'zh-CN',
			onImageUpload: function(files, editor, welEditable) {
				FileUpload.sendFile(files[0], editor, welEditable);
			}
		});

		s.saveTags = function() {
			Post.updateTags(s.myTags).then(function(tagList) {
				for (var i in tagList) {
					if (!has_Tag(s.post.tags, tagList[i])) {
						s.post.tags.push(tagList[i]);
					}
				}
			});
		};
		s.removeTags = function() {
			s.post.tags = [];
		};

		s.save = function() {
			var content = $('.summernote').code();
			s.post.content = content;
			if (!s.post.title)
				return alert('请添加文章标题');
			if (!s.post.category)
				return alert('请选择文章类别');
			$state.go('blog.posts');
			Post.updateTags(s.myTags).then(function(tagList) {
				for (var i in tagList)
					s.post.tags.push(tagList._id);
				return Post.insert(s.post);
			});
		};
	}]);

	app.service('EditPostService', ['$http', '$q', function(http, q) {
		this.editingPost = {};
	}]);

	app.service('FileUpload', ['upload', '$q', function(upload, q) {
		this.getFileUrl = function(id) {
			var d = q.defer();
			var reader = new FileReader();
			reader.onload = function() {
				var base64 = this.result;
				upload.uploadImage(base64).then(function(url) {
					d.resolve(url);
				});

			};
			reader.readAsDataURL(document.getElementById(id).files[0]);
			return d.promise;
		};

		this.sendFile = function(file, editor, welEditable) {
			var reader = new FileReader();
			reader.onload = function() {
				var base64 = this.result;
				upload.uploadImage(base64).then(function(url) {
					$('.summernote').summernote('editor.insertImage', url);
				});

			};
			reader.readAsDataURL(file);
		};
	}]);

	app.service('Category', ['$http', '$q', function(http, q) {
		var Category = this;
		Category.cates = [];
		this.get = function(cateid) {
			var d = q.defer();
			if (!cateid) {
				http.get('/manager/getAllCategory').success(function(obj) {
					Category.cates = obj.categoryList;
					d.resolve(Category.cates);
				});
			} else {
				http.get('/manager/getCategory/' + cateid).success(function(obj) {
					d.resolve(obj.cate);
				});
			}

			return d.promise;
		};
		this.getByName=function(name){
			var d= q.defer();
			http.get('/manager/getCategoryByName/'+name).success(function(obj){
				d.resolve(obj.cate);
			});
			return d.promise;
		}


		this.insert = function(name) {
			var d = q.defer();
			http.post('/manager/addCategory', {
				name: name
			}).success(function(result) {
				d.resolve(result.cate);
			});
			return d.promise;
		};
		this.remove = function(obj) {
			var d = q.defer();
			http.get('/manager/removeCategory/' + obj._id).success(function(result) {
				d.resolve();
			});
			return d.promise;
		};
		this.update = function(obj) {
			var d = q.defer();
			http.post('/manager/updateCategory', obj).success(function(result) {
				d.resolve(result.cate);
			});
			return d.promise;
		};
		this.updateRelation = function(obj) {
			var d = q.defer();
			http.post('/manager/updateCateRelation', obj).success(function(result) {
				d.resolve(result.cate);
			});
			return d.promise;
		};
	}]);

	app.service('Post', ['$http', '$q', function(http, q) {
		var Post = this;
		Post.posts = [];
		Post.post = {};
		this.get = function(postid) {
			var d = q.defer();
			if (!postid) {
				http.get('/manager/getAllPosts').then(function(result) {
					Post.posts = result.data.posts;
					d.resolve(Post.posts);
				});
			} else {
				http.get('/manager/getPost/' + postid).then(function(result) {
					Post.post = result.data.post;
					d.resolve(Post.post);
				});
			}
			return d.promise;
		};
		this.insert = function(post) {
			var d = q.defer();
			http.post('/manager/addPost', post).then(function(result) {
				Post.posts.push(result.data.post);
				d.resolve(result.data.post);
			});
			return d.promise;
		};
		this.update = function(obj) {
			var d = q.defer();
			http.post('/manager/updatePost', obj).success(function(result) {
				d.resolve(result.post);
			});
			return d.promise;
		};

		this.remove = function(obj) {
			var d = q.defer();
			http.get('/manager/removePost/' + obj._id).success(function(result) {
				d.resolve();
			});
			return d.promise;
		};

		this.updateTags = function(tags) { //逗号分隔的字符串
			var d = q.defer();
			http.post('/manager/updatePostTags', {tags: tags}).success(function(result){
				d.resolve(result.tagList);
			});
			return d.promise;
		};

	}]);

	app.directive("contenteditable", function() {
		return {
			restrict: "A",
			require: "ngModel",
			link: function(scope, element, attrs, ngModel) {
				function read() {
					ngModel.$setViewValue(element.html());
				}

				ngModel.$render = function() {
					element.html(ngModel.$viewValue || "");
				};

				element.bind('blur keyup change', function() {
					scope.$apply(read);
				});
			}
		};
	});

	function has_Tag(tags, tag) {
		if (tags == null || tags.length == 0 || tag == null)
			return false;
		for (var i = 0; i < tags.length; i++) {
			if (tags[i].name == tag.name)
				return true;
		}
		return false;
	}

})();
