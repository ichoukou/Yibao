(function(){
	var app = angular.module('studio', []);
	app.c = app.controller;
	/* studioCtrl */
    app.c('studioCtrl', ['$scope','Studio',function(s,Studio) {
        //所有画室的信息
        s.studio_list=[];
        //查询画室的信息
        s.studios=[];
        Studio.getAll().then(function(studio_list) {
            s.studio_list = studio_list;
        });
        s.insert = function() {
            Studio.insert().then(function(studio) {
                s.studio_list.push(studio);
            });
        };
        s.remove = function($index,key) {
            Studio.remove(key).then(function() {
                s.info.splice($index,1);
            });
        };
        s.query=function(){
            var input=document.getElementById("s_type").value;

            if(document.getElementById("select_studio").value=="name"){
                Studio.getbyName(input).then(function(studios) {
                    if(studios)
                        s.studios = [studios];
                });
            }
            else{
                Studio.getbyDistrict(input).then(function(studios) {
                    if(studios)
                        s.studios =studios ;
                });
            }
        }
        s.add_info=function(obj){
            Studio.add_profile(obj).then(function(studio){
                s.studio_list=studio;
            });
        }

        s.goback=function(){
            history.go(-1);
        }
    }]);


	/* Studio service*/
    app.service('Studio',['$q','$http',function(q,http){
        var studio= this;
        studio.list = [];
        //获得所有studio
        this.getAll = function() {
            var d = q.defer();
            http.get('/manager/getAllStudio').success(function(obj) {
                d.resolve(obj.StudioList);
            });
            return d.promise;
        };
        this.insert = function(name,phone,address,chengguo,photo,website,email,is_selected,feature,responsible,resphone) {
            var d = q.defer();
            http.post('/manager/addStudio',{name:name,phone:phone,address:address,chengguo:chengguo,photo:photo,website:website,email:email,
            is_selected:is_selected,feature:feature,responsible:responsible,resphone:resphone}).success(function(result) {
                d.resolve(result.studio);
            });
            return d.promise;
        };
        this.remove = function(obj) {
            var d = q.defer();
            http.get('/manager/removeStudio/'+obj._id).success(function(result) {
                d.resolve();
            });
            return d.promise;
        };
        this.getbySid=function(key){
            var d = q.defer();
            var studio=this;
            studio.studio_list=[];
            http.get('/manager/getStudioById/'+key).then(function(result) {
                studio.studio_list = result.data.studiolist;
                d.resolve(studio.studio_list);
            });
            return d.promise;
        }
        this.getbyName=function(key){
            var d = q.defer();
            var studio=this;
            studio.studio_list=[];
            http.get('/manager/getStudioByName/'+key).then(function(result) {
                studio.studio_list = result.data.studiolist;
                d.resolve(studio.studio_list);
            });
            return d.promise;
        }
        this.getbyDistrict=function(key){
            var d = q.defer();
            var studio=this;
            studio.studio_list=[];
            http.get('/manager/getStudioByDistrict/'+key).then(function(result) {
                studio.studio_list = result.data.studiolist;
                d.resolve(studio.studio_list);
            });
            return d.promise;
        }
        this.add_profile=function(_id,profile){
            var d = q.defer();
            var studio=this;
            studio.studio_list=[];
            http.post('/manager/addProfile/'+_id+"/"+profile).then(function(result) {
                studio.studio_list = result.studiolist;
                d.resolve(studio.studio_list);
            });
            return d.promise;
        }
        this.update=function(_id,name,phone,address,is_qualified,photo,website,email,responsible,resphone,QQ){
            var d = q.defer();
            http.post('/manager/updateStudio',{_id:_id,name:name,phone:phone,address:address,is_qualified:is_qualified,photo:photo,website:website,
            email:email,responsible:responsible,resphone:resphone,QQ:QQ}).success(function(result){
                d.resolve(result.studio);
            });
            return d.promise;

        }
    }]);

    //studio_profileCtrl
    app.c('studio_profileCtrl', ['$scope','Studio',"$state",'$stateParams', function(s,Studio,state,$stateParams){
        s.profile=[];
        s.$parent.rightShow = true;
        s.$on('$destroy',function() {
            s.$parent.rightShow = false;
        });
        s.save=function(){
                Studio.add_profile($stateParams._id, s.profile).then(function (studio_update) {
                    s.$parent.$parent.studio_list=studio_update;
                })
                alert("保存信息成功！");
                state.go("studio.list");
                state.reload();
        }

    }]);

    //studio_addCtrl
    app.c('studio_addCtrl', ['$scope','Studio',"$state", function(s,Studio,state){
        s.name='';
        s.phone='';
        s.address='';
        s.chengguo='';
        s.photo='';
        s.website='';
        s.email='';
        s.is_selected=false;
        s.feature='';
        s.responsible='';
        s.resphone='';
        s.$parent.rightShow = true;
        s.$on('$destroy',function() {
            s.$parent.rightShow = false;
        });
        s.add=function(){
            if(s.feature){
                s.is_selected=true;
            }
            Studio.insert(s.name, s.phone, s.address, s.chengguo, s.photo, s.website, s.email, s.is_selected, s.feature, s.responsible, s.resphone).then(function (new_studio) {
                s.$parent.$parent.studio_list.push(new_studio);
            })
            alert("添加画室成功！");
            state.go("studio.list");
            state.reload();
        }
        s.remove = function($index,key) {
            Studio.remove(key).then(function() {
                s.$parent.$parent.studio_list.splice($index,1);
                state.go("studio.list");
                state.reload();
            });
        };

    }]);

    //studio_editCtrl
    app.c('studio_editCtrl', ['$scope','Studio',"$state","$stateParams", function(s,Studio,state,stateParams){
        s.name='';
        s.phone='';
        s.address='';
        s.is_qualified='';
        s.photo='';
        s.website='';
        s.email='';
        s.responsible='';
        s.resphone='';
        s.QQ='';
        s.$parent.rightShow = true;
        s.$on('$destroy',function() {
            s.$parent.rightShow = false;
        });
        Studio.getbySid(stateParams._id).then(function(studio){
            if(studio){
                s.name = studio.nickname;
                s.phone = studio.phone;
                s.address = studio.address;
                s.is_qualified = studio.is_qualified;
                s.photo = studio.photo;
                s.website = studio.website;
                s.email = studio.email;
                s.responsible = studio.responsible_person.name;
                s.resphone = studio.responsible_person.contact;
                s.QQ = studio.QQ;
            }
        })

        s.save=function(){
            Studio.update(stateParams._id,s.name, s.phone, s.address, s.is_qualified, s.photo, s.website, s.email, s.responsible, s.resphone, s.QQ).then(function (new_studio) {

            })
            state.go("studio.list");
            state.reload();
        }
        s.remove = function($index,key) {
            Studio.remove(key).then(function() {
                s.$parent.$parent.studio_list.splice($index,1);
                state.go("studio.list");
                state.reload();
            });
        };

    }]);

    //画室图片管理的控制器
    app.c('UploaderController',function($scope,$state,Studio,Work,fileReader,$stateParams){

        //保存需要管理的画室
        $scope.studio=[];

        //保存画室的画作资源
        $scope.imageSrc=[];

        //保存需要添加的画作
        $scope.add_imgSrc=[];

        //获取画室
        var sid=$stateParams._id;
        Studio.getbySid(sid).then(function (studio_query) {
            $scope.studio=studio_query;
        })

        //读取画室的画作
        Work.getallWorks(sid).then(function(studio_works) {
            $scope.imageSrc = studio_works;
        });

        //获取文件的getFile方法
        $scope.getFile = function () {
            fileReader.readAsDataUrl($scope.file, $scope)
                .then(function(result) {
                    $scope.add_imgSrc=result;
                });
        };

        //为画室添加画作
        $scope.add_picture=function(img,sid){
            Work.add_work(img,sid).then(function(result) {
                $scope.imageSrc.push(result);
            });
            $state.reload();
        }

        //删除画室的某些画作
        $scope.remove = function($index,key) {
            Work.remove(key).then(function() {
                $scope.imageSrc.splice($index,1);
            });
            $state.reload();
        };
    });

    //定义文件读取的服务fileReader
    app.factory('fileReader', ["$q", "$log", function($q, $log){
            var onLoad = function(reader, deferred, scope) {
                return function () {
                    scope.$apply(function () {
                        deferred.resolve(reader.result);
                    });
                };
            };
            var onError = function (reader, deferred, scope) {
                return function () {
                    scope.$apply(function () {
                        deferred.reject(reader.result);
                    });
                };
            };
            var getReader = function(deferred, scope) {
                var reader = new FileReader();
                reader.onload = onLoad(reader, deferred, scope);
                reader.onerror = onError(reader, deferred, scope);
                return reader;
            };
            var readAsDataURL = function (file, scope) {
                var deferred = $q.defer();
                var reader = getReader(deferred, scope);
                reader.readAsDataURL(file);
                return deferred.promise;
            };
            return {
                readAsDataUrl: readAsDataURL
            };
        }])

    //定义文件上传的指令fileModel
    app.directive('fileModel', ['$parse', function ($parse) {
            return {
                restrict: 'A',
                link: function(scope, element, attrs, ngModel) {
                    var model = $parse(attrs.fileModel);
                    var modelSetter = model.assign;
                    element.bind('change', function(event){
                        scope.$apply(function(){
                            modelSetter(scope, element[0].files[0]);
                        });
                        //附件预览
                        scope.file = (event.srcElement || event.target).files[0];
                        scope.getFile();
                    });
                }
            };
    }]);

    /* Work service*/
    app.service('Work',['$q','$http',function(q,http){
        var work= this;
        work.list = [];

        this.remove = function(img) {
            var d = q.defer();
            http.get('/manager/removeWork/'+img._id).success(function(result) {
                d.resolve();
            });
            return d.promise;
        };

        this.add_work=function(img,sid){
            var d = q.defer();
            http.post('/manager/add_studioworks',{imgSrc:img,studio_id:sid}).success(function(result) {
                work.list=result.works;
                d.resolve(work.list);
            });
            return d.promise;
        }
        this.getallWorks=function(sid){
            var d = q.defer();
            http.get('/manager/getallWorks/'+sid).success(function(result) {
                work.list=result.worklist;
                d.resolve(work.list);
            });
            return d.promise;
        }
    }]);
})();

