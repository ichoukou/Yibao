var cookieParser = require('cookie-parser');
var User = require('./Model/User');




// sessionCtrl
// 主要作用是验证该请求是否合法，如果不合法则返回403请求
// 如果合法，就将该请求中的User取出，放入req中，以便下一层的Handler使用
module.exports =  function(req,res,next) {
    var sessionid = req.signedCookies.sessionid;
    var noAuthError = new Error('no auth');
    noAuthError.status = 403;

    console.log('cookies', req.signedCookies);
    if(!sessionid)
	return next(new Error('no sessionid error'));
    

    //if there is sessionid
    // encode the user information
    var userid = sessionid.split('@')[0];
    if(!userid)
	return next(noAuthError);

    User.findOne({_id : userid}).then(function(user) {
	if(!user)
	    return next(noAuthError);

	console.log('User session ok : ', user._id);
	
	req.user = user;
    	return next();
    });    
};
