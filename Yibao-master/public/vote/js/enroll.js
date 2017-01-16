
var mediaId;
var onFileUpload;
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
			'uploadImage',
			'downloadImage'
		]
	});
	wx.ready(function(){
		onFileUpload = function() {
			wx.chooseImage({
				count: 1, // 默认9
				sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
				sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
				success: function (res) {
					var localIds = res.localIds; // 返回选定照片的本地ID列表，localId可以作为img标签的src属性显示图片
					
					$('#upload_work').html('<img src="'+localIds+'" />');
					wx.uploadImage({
						localId: localIds[0], // 需要上传的图片的本地ID，由chooseImage接口获得
						isShowProgressTips: 1, // 默认为1，显示进度提示
						success: function (res) {
							var serverId = res.serverId; // 返回图片的服务器端ID
							mediaId = serverId;
						},error:function(err) {
							alert('图片上传失败,请重试');
						}
					});		
				}
			});

			
		}


		
	});
}



$(document).ready(function(){
	$("#grade").click(function(){
		$('#dialog').fadeToggle(300);
	});

	$("#grade2, #grade1, #grade3").click(function(e){
		$(this).addClass("active");
		$("#grade3").removeClass("active");
		$("#grade").text(this.innerText);
		$('#dialog').fadeOut(200);		
	});
	

	$(".skip").click(function(){
		$("#share").removeClass("hidden");
		$("#subscribe").addClass("hidden");
	});

});

// function readAsDataURL(origin,dest){
//     var file = document.getElementById(origin).files[0];
//     var dest = document.getElementById(dest);
//     var reader = new FileReader(); //文件以Data URL的形式传入
//     reader.readAsDataURL(file);
//     var url = "http://pic4.nipic.com/20091104/2645351_152840096265_2.jpg";
//     reader.onload = function(e){
//         dest.innerHTML = '<img src = "' + url + '"/>';
//     }
// }

function submit(){
    var name = $("#name").val();
    var phone = $("#phone").val();
    var workName = $("#workName").val();
    // var work = $("#upload_work img").attr("src");
    // var work = serverId;    //work为服务端返回的图片ID
    var grade = $("#grade").text().trim();

    if(!(name && phone && workName && grade && mediaId))
        return alert("请输入和上传完整信息");
    
    var data = {
        nickname : name,
        telephone : phone,
        workname : workName,
	    detailGrade : grade,
            grade : (grade == "高三应届生" || grade == "学生") ? "学生" : "老师",
	    mediaId : mediaId
    };

    $.post("/wechat/signUp",data,function(data,status){
        $("#subscribe").removeClass("hidden");
        // location.href("/page/VOTE_INVITE?&serverId=" + mediaId);
        // console.log(data.newuser);
        // alert(status);
	var user = data.newuser;

	    
	var shareObj = {
	    title: '我是'+name+'，看看我的画怎么样?',
	    desc: '帮我拉拉票吧!',
	    link: 'http://yibaoedu.com/wechat/auth?page=VOTE_INVITE&memberid='+user._id,
	    imgUrl : user.picUrl
	};
	wx.onMenuShareAppMessage(shareObj);
	wx.onMenuShareTimeline({
	    title: '我是'+name+'，看看我的画怎么样?',
	    link: 'http://yibaoedu.com/wechat/auth?page=VOTE_INVITE&memberid='+user._id,
	    imgUrl : user.picUrl
	});

    });
}
