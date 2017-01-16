var sms = this;
var Q = require('q');
var querystring = require('querystring');
var https = require('https');


// 发送短信至手机号
sms.send = function(phone,text) {
	var d = Q.defer();
	var postData = {
		mobile: phone,
		message: text
	};
	var content = querystring.stringify(postData);
	var options = {
		host:'sms-api.luosimao.com',
		path:'/v1/send.json',
		method:'POST',
		auth:'api:key-291412fe82e29ea05e6891e45c25e868',
		agent:false,
		rejectUnauthorized : false,
		headers:{
			'Content-Type' : 'application/x-www-form-urlencoded', 
			'Content-Length' :content.length
		}
	};
	/* var req = https.request(options,function(res){
	   res.setEncoding('utf8');
	   res.on('data', function (chunk) {
	   var result = JSON.parse(chunk);
	   if(result.error == '0'){
	   d.resolve();
	   }else{
	   d.reject(new Error('send error'));
	   }
	   });
	   res.on('end',function(){	
	   
	   });
	   });
	   req.write(content);
	   req.end(); */

	d.resolve();
	return d.promise;
};


module.exports = sms;
