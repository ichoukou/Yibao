(function(){
	var app = angular.module('user', []);
	app.c = app.controller;
	app.c('userCtrl', ['$scope','User',function(s,User) {
        //所有用户信息
        s.info=[];
        //查询用户的信息
        s.user_infos=[];
        User.getAll().then(function(info) {
            s.info = info;
        });

        s.insert = function() {
            User.insert().then(function(user) {
                s.info.push(user);
            });
        };
        s.remove = function($index,key) {
            User.remove(key).then(function() {
                s.info.splice($index,1);
            });
        };
        s.query=function(){
            var input=document.getElementById("key").value;
            if(document.getElementById("select_user").value=="address"){
                User.getbyAddress(input).then(function(user_info) {
					if(user_info)
						s.user_infos = user_info;
                });
            }
            else if(document.getElementById("select_user").value=="nickname"){
                User.getbyNickname(input).then(function(user_info) {
                    if(user_info)
                        s.user_infos = [user_info];
                });
            }
        }
        /*
        s.queryByType=function(){
            if(document.getElementById("user_type").value=="student"){
                User.getStudent().then(function(info) {
                    if(info)
                        s.info = [info];
                });
            }
            else if(document.getElementById("user_type").value=="teacher"){
                User.getTeacher().then(function(info) {
                    if(info)
                        s.info = [info];
                });
            }
            else
            {
                User.getStudio().then(function(info) {
                    if(info)
                        s.info = [info];
                });
            }
        }
        */
    }]);


/* User service*/
    app.service('User',['$q','$http',function(q,http){
        var user = this;
        user.list = [];

        //获得所有user
        this.getAll = function() {
            var d = q.defer();
            http.get('/manager/getAllUser').success(function(obj) {
                d.resolve(obj.UserList);
            });
			return d.promise;
        };
        this.insert = function() {
            var d = q.defer();
            http.post('/manager/addUser').success(function(result) {
                d.resolve(result.user);
            });
            return d.promise;
        };
        //删除某个User
        this.remove = function(obj) {
            var d = q.defer();
            http.get('/manager/removeUser/'+obj._id).success(function(result) {
                d.resolve();
            });
            return d.promise;
        };
        this.getbyUid=function(key){
            var user=this;
            user.user_list=[];
            var d = q.defer();
            http.get('/manager/getUserById/'+key).then(function(result) {
            user.user_list = result.data.user;
            d.resolve(user.user_list);
        });
        return d.promise;
    }
		this.getbyNickname=function(key){
            var user=this;
            user.user_list=[];
            var d = q.defer();
            http.get('/manager/getUserByName/'+key).then(function(result) {
                user.user_list = result.data.user;
                d.resolve(user.user_list);
            });
            return d.promise;
        }
        this.getbyAddress=function(key){
            var user=this;
            user.user_list=[];
            var d = q.defer();
            http.get('/manager/getUserByAddress/'+key).then(function(result) {
                user.user_list = result.data.user;
                d.resolve(user.user_list);
            });
            return d.promise;
        }
        /*
        this.getStudent=function(){
            var user=this;
            user.user_list=[];
            var d = q.defer();
            http.get('/manager/getStudent').then(function(result) {
                user.user_list = result.data;
                d.resolve(user.user_list);
            });
            return d.promise;
        }
        this.getTeacher=function(){
            var user=this;
            user.user_list=[];
            var d = q.defer();
            http.get('/manager/getTeacher').then(function(result) {
                user.user_list = result.data;
                d.resolve(user.user_list);
            });
            return d.promise;
        }
        this.getStudio=function(){
            var user=this;
            user.user_list=[];
            var d = q.defer();
            http.get('/manager/getStudio').then(function(result) {
                user.user_list = result.data;
                d.resolve(user.user_list);
            });
            return d.promise;
        }
        */
    }]);


		/* userdetailCtrl */
    app.c('userdetailCtrl', ['$scope','User','$stateParams', function(s,User,$stateParams){
        s.user_detail=[];
        s.$parent.rightShow = true;
        s.$on('$destroy',function() {
            s.$parent.rightShow = false;
        });
        User.getbyUid($stateParams.id).then(function(user) {
            if(user)
                s.user_detail = user;
        });

    }]);

})();
