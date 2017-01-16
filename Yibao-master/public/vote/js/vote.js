/* 获取微信签名 */
$.ajax({
	url : '/wechat/jssdkSign',
	type : "get",
	data : {
		url : location.toString()
	}
}).done(function(result) {
	wxconfig(result.appId, result.timestamp, result.nonceStr, result.signature);
});
function wxconfig(appId, timestamp,nonceStr,signature) {
	wx.config({
		debug: false,
		appId: appId,
		timestamp: timestamp,
		nonceStr: nonceStr,
		signature: signature,
		jsApiList: [
			'onMenuShareTimeline',
			'onMenuShareAppMessage',
			'chooseImage',
			'previewImage',
			'uploadImage'
		]
	});
	wx.ready(function() {
		$('#header-content').on('click', 'img',function(e) {
			var src = $(this).attr('src');
			src = src.split('@')[0];

			wx.previewImage({
				current: src, // 当前显示图片的http链接
				urls: [src] // 需要预览的图片http链接列表
			});
		});
		$('#index-content').on('click', '.contact img',function(e) {
			var src = $(this).attr('src');
			src = src.split('@')[0];

			wx.previewImage({
				current: src, // 当前显示图片的http链接
				urls: [src] // 需要预览的图片http链接列表
			});
		});
	});
}
var globalUser;

var getProductions = function(callback) {
	$.ajax({
		url : "/wechat/allWorks",
		type : "post",
		data :　{
			type : "time",
		},
		success : function(data) {
			callback(data.userWorks);
			console.log(data);
		}
	});
}
var getPersonal = function(callback) {
	$.ajax({
		url : "/wechat/userById",
		type : "post",
		data :　{
			voted_id : window.memberid
		},
		success : function(data) {
			var user = data.userWork;
			globalUser = user;
			var picUrl = user.picUrl;
			if(picUrl){
				picUrl = picUrl.split('/')[3];
				picUrl = "http://yibao.img-cn-beijing.aliyuncs.com/"+picUrl+"@1e_1c_0o_0l_100h_100w_90q.src";
			}
			wx.ready(function() {
				var shareObj = {
					title: '我是'+user.nickname+'，看看我的画怎么样?',
					desc: '帮我拉拉票吧!',
					link: 'http://yibaoedu.com/wechat/auth?page=VOTE_INVITE&memberid='+user._id,
					imgUrl : user.picUrl
				};
				wx.onMenuShareAppMessage(shareObj);
				wx.onMenuShareTimeline({
					title: '我是'+user.nickname+'，看看我的画怎么样?',
					link: 'http://yibaoedu.com/wechat/auth?page=VOTE_INVITE&memberid='+user._id,
					imgUrl : user.picUrl
				});
			});
			callback(user);
		}
	});
}
var productions,production,productionHtml,productionObj,productionTemplate;
var personalwork,personalHtml,personalObj,personalTemplate;
var page_vote = function() {
	var page = this;
	var loadProductions = getProductions;
	var loadPersonal = getPersonal;
	page.init = function() {
		loadProductions(function(data) {
			productions = data;
			console.log(data);
			productionTemplate = $('.feed.template').prop('outerHTML');
			for(var i = 0; i < productions.length; i++) {
				production = productions[i];
				var picUrl = production.picUrl;
				if(picUrl)
				{
					console.log(picUrl);
					picUrl = picUrl.split('/')[3];
					picUrl = "http://yibao.img-cn-beijing.aliyuncs.com/"+picUrl+"@1e_1c_0o_0l_150h_150w_90q.src";
					console.log(picUrl);
				}
				productionHtml = productionTemplate
						.replace(/{#nickname#}/g,production.nickname)
						.replace(/{#title#}/g,production.workname)
						.replace(/{#num#}/g,production.voteNum)
						.replace(/{#_id#}/g,production._id)
						.replace(/{#picUrl#}/g,picUrl);
				productionObj = $(productionHtml);
				if(production.grade == "学生") {	
					productionObj.removeClass('template');	
				}
				$('#index-content').append(productionObj);	
				if(production.isVote == true) {
					$('.feed').eq(i).find('.vote').addClass('display');
					$('.feed').eq(i).find('.voted').removeClass('display');
				}else {
					$('.feed').eq(i).find('.vote').removeClass('display');
					$('.feed').eq(i).find('.voted').addClass('display');
				}			
			}
			//切换学生老师
			var grade = "学生";
			$('#tab1').on('click',function(e) {
				$("#tab1").addClass('tabfocused');
				$("#tab2").removeClass('tabfocused');
				$('#index-content .feed').addClass('template');
				for(var i = 0; i < productions.length; i++) {				
					if(productions[i].grade == "学生") {	
						$(".feed").eq(i).removeClass('template');		
					}					
				}
				grade = "学生";
				console.log(grade);
			});
			$('#tab2').on('click',function(e) {
				$("#tab1").removeClass('tabfocused');
				$("#tab2").addClass('tabfocused');
				$('#index-content .feed').addClass('template');
				for(var i = 0; i < productions.length; i++) {
					if(productions[i].grade == "老师") {	
						$(".feed").eq(i).removeClass('template');
					}
				}
				grade = "老师";
				console.log(grade);
			});
			//投票
			var vote,voted,that;
			$('.vote').on('click',function(e) {
				vote = $(this);
				voted = $(this.nextElementSibling);
				that = this;
				$.ajax({
					url : "/wechat/vote",
					type : "post",
					data :　{
						voted_id : that.parentElement.id
					},
					success : function(data) {
						
						if(data.msg == "不能超过3次") {
							alert("投票不能超过3次");
						}else if(data.msg == "不能为自己投票") {
							alert("不能为自己投票");
						}else {
							$.ajax({
								url : "/wechat/userById",
								type : "post",
								data :　{
									voted_id : that.parentElement.id
								},
								success : function(data) {
									$(that.parentElement.querySelector('.num')).html(data.userWork.voteNum+"票");
									console.log(data.userWork);
								}
							});
							vote.addClass('display');
							voted.removeClass('display');
						}
					}
				});
			});
			//切换按时间和按票数排序
			$('#tabTime').on('click',function() {
				$('#tabTime .fa-dot-circle-o').removeClass('display');
				$('#tabTime .fa-circle-o').addClass('display');
				$('#tabNumber .fa-dot-circle-o').addClass('display');
				$('#tabNumber .fa-circle-o').removeClass('display');
				$('#index-content .feed').remove();
					$.ajax({
						url : "/wechat/allWorks",
						type : "post",
						data :　{
							type : "time",
						},
						success : function(data) {
							productions = data.userWorks;
							productionTemplate = $('.feed.template').prop('outerHTML');
							for(var i = 0; i < productions.length; i++) {
								production = productions[i];
								var picUrl = production.picUrl;
								if(picUrl)
								{
									console.log(picUrl);
									picUrl = picUrl.split('/')[3];
									picUrl = "http://yibao.img-cn-beijing.aliyuncs.com/"+picUrl+"@1e_1c_0o_0l_150h_150w_90q.src";
									console.log(picUrl);
								}
								productionHtml = productionTemplate
										.replace(/{#nickname#}/g,production.nickname)
										.replace(/{#title#}/g,production.workname)
										.replace(/{#num#}/g,production.voteNum)
										.replace(/{#_id#}/g,production._id)
										.replace(/{#picUrl#}/g,picUrl);
								productionObj = $(productionHtml);
								if(production.grade == grade) {	
									productionObj.removeClass('template');	
								}
								$('#index-content').append(productionObj);
								if(production.isVote == true) {
									$('.feed').eq(i).find('.vote').addClass('display');
									$('.feed').eq(i).find('.voted').removeClass('display');
								}else {
									$('.feed').eq(i).find('.vote').removeClass('display');
									$('.feed').eq(i).find('.voted').addClass('display');
								}			
							}
							console.log(data.userWorks);
						}
					});
				
			});
			$('#tabNumber').on('click',function() {
				$('#tabTime .fa-dot-circle-o').addClass('display');
				$('#tabTime .fa-circle-o').removeClass('display');
				$('#tabNumber .fa-dot-circle-o').removeClass('display');
				$('#tabNumber .fa-circle-o').addClass('display');
				$('#index-content .feed').remove();
					$.ajax({
						url : "/wechat/allWorks",
						type : "post",
						data :　{
							type : "vote"
						},
						success : function(data) {
							productions = data.userWorks;
							
							productionTemplate = $('.feed.template').prop('outerHTML');
							for(var i = 0; i < productions.length; i++) {
								production = productions[i];
								var picUrl = production.picUrl;
								if(picUrl)
								{
									console.log(picUrl);
									picUrl = picUrl.split('/')[3];
									picUrl = "http://yibao.img-cn-beijing.aliyuncs.com/"+picUrl+"@1e_1c_0o_0l_150h_150w_90q.src";
									console.log(picUrl);
								}
								productionHtml = productionTemplate
										.replace(/{#nickname#}/g,production.nickname)
										.replace(/{#title#}/g,production.workname)
										.replace(/{#num#}/g,production.voteNum)
										.replace(/{#_id#}/g,production._id)
										.replace(/{#picUrl#}/g,picUrl);
								productionObj = $(productionHtml);
								if(production.grade == grade) {	
									productionObj.removeClass('template');	
								}
								$('#index-content').append(productionObj);	
								if(production.isVote == true) {
									$('.feed').eq(i).find('.vote').addClass('display');
									$('.feed').eq(i).find('.voted').removeClass('display');
								}else {
									$('.feed').eq(i).find('.vote').removeClass('display');
									$('.feed').eq(i).find('.voted').addClass('display');
								}			
							}
							console.log(data.userWorks);
						}
					});
			});
		});

		loadPersonal(function(data) {
			personalwork = data;
			var picUrl = personalwork.picUrl;
			if(picUrl){
				picUrl = picUrl.split('/')[3];
				picUrl = "http://yibao.img-cn-beijing.aliyuncs.com/"+picUrl+"@1e_1c_0o_0l_100h_100w_90q.src";
			}

			personalTemplate = $('.headFeed.headTemplate').prop('outerHTML');
			personalHtml = personalTemplate
					.replace(/{#nickname#}/g,personalwork.nickname)
					.replace(/{#title#}/g,personalwork.workname)
					.replace(/{#num#}/g,personalwork.voteNum)
					.replace(/{#_id#}/g,personalwork._id)
					.replace(/{#picUrl#}/g, picUrl);
			personalObj = $(personalHtml);
			
			personalObj.removeClass('headTemplate');
			$('#header-content').append(personalObj);
			if(personalwork.isVote == true) {
				$('.votebutton').addClass('display');
				$('.votedbutton').removeClass('display');
			}else {
				$('.votebutton').removeClass('display');
				$('.votedbutton').addClass('display');
			}			
			
			
			//投票
			var votebutton,votedbutton;
			$('.votebutton').on('click',function(e) {
				vote = $(this);
				voted = $(this.nextElementSibling);
				that = this;
				$.ajax({
					url : "/wechat/vote",
					type : "post",
					data :　{
						voted_id : that.parentElement.querySelector('.header').id
					},
					success : function(data) {
						
						if(data.msg == "不能超过3次") {
							alert("投票不能超过3次");
						}else if(data.msg == "不能为自己投票") {
							alert("不能为自己投票");
						}else {
							$.ajax({
								url : "/wechat/userById",
								type : "post",
								data :　{
									voted_id : that.parentElement.querySelector('.header').id
								},
								success : function(data) {
									$(that.parentElement.querySelector('.num')).html(data.userWork.voteNum+"票");
									console.log(data.userWork);
								} 
							});
							vote.addClass('display');
							voted.removeClass('display');
						}
					}
				});
			});	
		});

	}
	init();
};

page_vote();

//比赛规则
var openRule = function() {
	$('#ruleTxt').removeClass('display');
}
var closeRule = function() {
	$('#ruleTxt').addClass('display');
}

