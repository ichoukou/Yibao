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
                    'uploadImage',
                    'downloadImage'
		]
	});
	wx.ready(function(){
		var shareObj = {
			title: '全国优秀画作大赛',
			desc: '画出你的精彩',
			link: 'http://yibaoedu.com/wechat/auth?page=VOTE_HOME'};
		wx.onMenuShareAppMessage(shareObj);		
		wx.onMenuShareTimeline({
			title: '全国优秀画作大赛',
			link: 'http://yibaoedu.com/wechat/auth?page=VOTE_HOME'
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
$.ajax({
	url : "/wechat/userById",
	type : "post",
	success : function(data) {
		globalUser = data.userWork;
		if(globalUser.picUrl && globalUser.nickname){
			$('.enroll').addClass('active');
		}
	}
});


var getProductions = function(callback) {
	$.ajax({
		url : "/wechat/allWorks",
		type : "post",
		data :　{
			type : "time"
		},
		success : function(data) {
			callback(data.userWorks);
			console.log(data);
		}
	});
};
var productions,production,productionHtml,productionObj,productionTemplate;
var page_index = function() {
	var page = this;
	var loadProductions = getProductions;
	page.init = function() {
		loadProductions(function(data) {
			productions = data;
			productionTemplate = $('#feedTemplate').html();
			for(var i = 0; i < productions.length; i++) {
				production = productions[i];
				var picUrl = production.picUrl;
				if(picUrl)
				{
					picUrl = picUrl.split('/')[3];
					picUrl = "http://yibao.img-cn-beijing.aliyuncs.com/"+picUrl+"@1e_1c_0o_0l_150h_150w_90q.src";
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
			});
			//投票
			var vote, voted, that;
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
						}else if(data.msg == "DUPLICATE"){
							alert("不能为同一个人重复投票");
							
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
							type : "time"
						},
						success : function(data) {
							productions = data.userWorks;
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
								productionTemplate = $('#feedTemplate').html();

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
								productionTemplate = $('#feedTemplate').html();
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
						}
					});
			});
		});
	}
	init();
};

page_index();

//比赛规则
var openRule = function() {
	$('#ruleTxt').removeClass('display');
};
var closeRule = function() {
	$('#ruleTxt').addClass('display');
};
