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
                if(tag)
                    s.tags.push(tag);
                else
                    alert('该标签已存在');
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

        s.preview = function(id){
            if(id)
                window.open("/tagArticle/" + id);
            else
                return;
        };

    }]);

    app.c('relaListCtrl',['$scope', '$state', 'Tag', function(s, $state, Tag){
        s.linkedTags = [];
        
        Tag.getLinkedTags().then(function(linkedTags){
            s.linkedTags = linkedTags;
        });
        
        s.release = function($index, tag){
            tag.parent = null;
            Tag.update(tag).then(function(newTag){
                s.linkedTags.splice($index, 1);
            });
        };
    }]);

    app.c('tagRelationCtrl', ['$scope', '$state', 'Tag', function(s, $state, Tag){
        s.parent = "";
        s.child = "";
        s.relationship = "";
        s.relation = {};

        s.clear = function(){
            s.parentTag = "";
            s.subTag = "";
            s.relationship = "";
        };

        s.bind = function(){
            if(s.parent && s.child){
                s.relation.parent = s.parent;
                s.relation.child = s.child;
                Tag.getTagPair(s.relation).then(function(tagPair){
                    if(!tagPair.parent)
                        return alert("不存在父标签");
                    if(!tagPair.child)
                        return alert("不存在子标签");
                    tagPair.child.parent = tagPair.parent._id;
                    Tag.update(tagPair.child).then(function(newTag){
                        if(newTag)
                            return alert("绑定成功");
                        else
                            return alert("绑定失败");
                    });
                }); 
            }else{
                return alert("请输入标签名"); 
            }
            
        };

        s.query = function(){
            if(s.parent && s.child){
                s.relation.parent = s.parent;
                s.relation.child = s.child;
                Tag.getTagPair(s.relation).then(function(tagPair){
                    if(!tagPair.parent)
                        return alert("不存在父标签");
                    if(!tagPair.child)
                        return alert("不存在子标签");
                    if(tagPair.child.parent == tagPair.parent._id)
                        s.relationship = "存在";
                    else
                        s.relationship = "不存在";
                }); 
            }else{
                return alert("请输入标签名"); 
            }
        };

     }]);

    app.c('tagEditCtrl', ['$scope', '$stateParams', '$state', 'Category', 'Tag', 'Post', 'FileUpload',function(s, $stateParams, $state, Category, Tag, Post, FileUpload){
        s.$parent.rightShow = true;
        s.tag = {};
        s.post = {};   
        s.cates = [];
        Category.get().then(function(cates) {
            s.cates = cates;
        });
        s.$on('$destroy',function() {
            s.$parent.rightShow = false;
        });
        
        Tag.get($stateParams.tagid).then(function(tag){
            s.tag = tag;
            if(s.tag.post){
                Post.get(s.tag.post).then(function(post){
                    if(post){
                        s.post = post;
                        $(".summernote").code(s.post.content);
                    }else{
                        s.tag.post = null;
                    }
                });
            }
        });

        $('.summernote').summernote({
            height: 280,
            lang: 'zh-CN',
            onImageUpload: function(files, editor, welEditable) {
                FileUpload.sendFile(files[0], editor, welEditable);
            }
        });
        s.save = function(){
            if(!s.tag.name)
                return alert("请输入标签名");
            if(!s.post.title){
                $state.go('tag.list');
                Tag.update(s.tag).then(function(tag){
                    Tag.tags.splice($stateParams.index,1,tag);
                });
                return;
            }
            if (!s.post.category)
                return alert('请选择文章类别');
            var content = $('.summernote').code();
            s.post.content = content;
            s.post.category = s.post.category._id;
            if(s.tag.post){
                Post.update(s.post).then(function(post){
                    Tag.update(s.tag).then(function(tag){
                        Tag.tags.splice($stateParams.index,1,tag);
                    });
                });
            }else{
                Post.insert(s.post).then(function(post){
                    s.tag.post = post._id;
                    Tag.update(s.tag).then(function(tag){
                        Tag.tags.splice($stateParams.index,1,tag);
                    });
                });
            }
            $state.go('tag.list');
        };
    }]);


    app.service('Tag', ['$http', '$q', function(http, q){
        var Tag = this;
        Tag.tags = [];
        this.get = function(tagid){
            var d = q.defer();
            if(!tagid){
                http.get('/manager/getAllTags').success(function(obj){
                    Tag.tags = obj.tagList;
                    d.resolve(Tag.tags);
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

        this.getByName = function(name){
            var d = q.defer();
            http.post('/manager/getByName', {name:name}).success(function(result){
                d.resolve(result.tag);
            });
            return d.promise;
        };

        this.getTagPair = function(obj){
            var d = q.defer();
            http.post('/manager/getTagPair', obj).success(function(result){
                d.resolve(result.tagPair);
            });
            return d.promise;
        };

        this.getLinkedTags = function(){
            var d = q.defer();
            http.get('/manager/getLinkedTags').success(function(result){
                d.resolve(result.linkedTags);
            });
            return d.promise;
        };

    }]);

})();
