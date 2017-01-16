(function(){
	var app = angular.module('feeds', []);
	app.c = app.controller;

    /* Feed controller */
    app.c('feedCtrl',['$scope','Feed','Tag','User',function(s,Feed){
        //所有动态
        s.feeds=[];
        //筛选的动态
        s.select_feeds=[];
        Feed.getAll().then(function(feeds) {
            s.feeds = feeds;
		});
        s.select=function(){
            var input=document.getElementById("f_type").value;
            if(document.getElementById("select_feed").value=="tag"){
                Feed.getbyTag(input).then(function(select_feeds) {
                    if(select_feeds)
                        s.select_feeds=[select_feeds];
                });
            }
            else{
                Feed.getbyOwner(input).then(function(select_feeds) {
                    if(select_feeds)
                        s.select_feeds =select_feeds;
                });
            }
        };
        s.insert = function() {
            Feed.insert().then(function(feed) {
                s.feeds.push(feed);
            });
        };
        s.remove = function($index,key) {
            Feed.remove(key).then(function() {
                s.feeds.splice($index,1);
            });
        };

    }]);

	/*Feed service*/
    app.service('Feed',['$q','$http',function(q, http){
        var feed = this;
        feed.list = [];
        //获得所有Feed
        this.getAll = function() {
            var d = q.defer();
            http.get('/manager/getAllFeed').success(function(obj) {
                d.resolve(obj.FeedList);
            });
            return d.promise;
        };
        this.insert = function() {
            var d = q.defer();
            http.post('/manager/addFeed').success(function(result) {
                d.resolve(result.feed);
            });
            return d.promise;
        };
        this.remove = function(obj) {
            var d = q.defer();
            http.get('/manager/removeFeed/'+obj._id).success(function(result) {
                d.resolve();
            });
            return d.promise;
        };
        this.getbyId=function(key){
            var d = q.defer();
            var feed=this;
            feed.feed_list=[];
            http.get('/manager/getFeedById/'+key).then(function(result) {
                feed.feed_list = result.data.feedlist;
                d.resolve(feed.feed_list);
            });
            return d.promise;
        }
        this.getbyTag=function(key){
            var d = q.defer();
            var feed=this;
            feed.feed_list=[];
            http.get('/manager/getFeedByTag/'+key).then(function(result) {
                feed.feed_list = result.data.feedlist;
                d.resolve(feed.feed_list);
            });
            return d.promise;
        }
        this.getbyOwner=function(key){
            var d = q.defer();
            var feed=this;
            feed.feed_list=[];
            http.get('/manager/getFeedByOwner/'+key).then(function(result) {
                feed.feed_list = result.data.feedlist;
                d.resolve(feed.feed_list);
            });
            return d.promise;
        }
    }]);
    app.c('feeddetailCtrl', ['$scope','Feed','$stateParams', function(s,Feed,$stateParams){
        s.feed_detail=[];
        s.$parent.rightShow = true;
        s.$on('$destroy',function() {
            s.$parent.rightShow = false;
        });
        Feed.getbyId($stateParams._id).then(function(feed) {
            if(feed)
                s.feed_detail = feed;
        });

    }]);
})();
