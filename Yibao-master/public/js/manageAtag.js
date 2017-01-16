(function () {
    var app = angular.module('tag',[]);
    app.c = app.controller;

    app.c('tagCtrl', ['$scope', 'Tag', function(s, Tag){
        s.tags = [];
        Tag.get().then(function(tags){
            s.tags = tags;
        });

        s.insert = function(){
            Tag.insert('新标签').then(function(tag){
                s.tags.push(tag);
            });
        };

        s.remove = function($index, tag){
            Tag.remove(tag).then(function(){
                s.tags.splice($index, 1);
            });
        };

        s.toggleStatus = function(tag){
            if(tag.status == "DEACTIVE"){
                tag.status = "ACTIVE";
            }else{
                tag.status = "DEACTIVE";
            }
            Tag.update(tag).then(function (newTag) {
                tag = newTag;
            });
        };

    }]);

    app.c('tagEditCtrl', ['$scope', '$stateParams', '$state', 'Tag', function(s, $stateParams, $state, Tag ){
        s.$parent.rightShow = true;
        s.tag = {};
        s.$on('$destroy',function() {
            s.$parent.rightShow = false;
        });
        Tag.get($stateParams.tagid).then(function(tag){
            s.tag = tag;
        });
        s.save = function(){
            if(!s.tag.name)
                return alert("请输入新的名字");
            Tag.update(s.tag);
            history.back();
            $state.reload();
            return ;
        };
    }]);


    app.service('Tag', ['$http', '$q', function(http, q){
        this.get = function(tagid){
            var d = q.defer();
            if(!tagid){
                http.get('/manager/getAllTags').success(function(obj){
                    d.resolve(obj.tagList);
                });
            }else{
                http.get('/manager/getTag/' + tagid).success(function(result){
                    d.resolve(result.tag);
                });
            }
            return d.promise;
        };

        this.insert = function(name){
            var d = q.defer();
            http.post('/manager/addTag', {name: name}).success(function(result){
                d.resolve(result.tag);
            });
            return d.promise;
        };

        this.remove = function(obj){
            var d = q.defer();
            http.get('/manager/removeTag/' + obj._id).success(function(result){
                d.resolve();
            });
            return d.promise;
        };

        this.update = function(obj){
            var d = q.defer();
            http.post('/manager/updateTag', obj).success(function(result){
                d.resolve(result.tag);
            });
            return d.promise;
        };
    }]);

})();
