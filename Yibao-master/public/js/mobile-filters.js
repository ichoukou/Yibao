(function(){
	var app = angular.module('Filters', []);
	// 将数组连接成字符串
	app.filter('arrayConcat', function() {
		return function(arr) {
			var result = '';
			for(var i = 0; i < arr.length; i++)
				result += arr[i];
			return result;
		};
	});
	// 将时间转换成可读的相对时间
	app.filter('HQDate', function() {
		return function(preDate) {
			var editTim = preDate.replace(/-/g,"/");
			var editDate = new Date(editTim);
			
			var nowDate = new Date();
			var nowTime = nowDate.getTime();
			var editTime = editDate.getTime();
			var time = nowTime - editTime;
			time = time / 1000;
			if(time < 60) return "刚刚";
			else if(time < 3600){
				var min = parseInt(time / 60);
				return min + "分钟前";
			}else if(time < 86400){
				var hour = parseInt(time / 3600);
				return hour + "小时前";
			}else if(time < 2592000){
				var day = parseInt(time / (3600 * 24));
				return day + "天前";
			}else if(time < 31536000){
				var month = parseInt(time / (3600 * 24 * 30));
				return month + "月前";
			}else{
				var year = parseInt(time / 31536000);
				return year + "年前";
			}
		};
	});
	//将时间转化为YY-MM格式
	app.filter('YYMMDate',function(){
		return function(preDate){
			var YYMMDate="";
			for(var i =0; i < 7; i++)
				YYMMDate += preDate[i];
			return YYMMDate;
		};
	});
	//编辑和完成按钮切换
	app.filter('EditChange',function(){
		return function(preBool){
			if(preBool)
				return "完成";
			else
				return "编辑";
		};
	});
	
	app.filter('trustAsResourceUrl', ['$sce', function($sce) {
		return function(val) {
			return $sce.trustAsResourceUrl(val);
		};
	}]);
})();
