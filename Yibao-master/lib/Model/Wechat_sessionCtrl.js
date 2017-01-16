/**
 * Created by tzr4032369 on 2015/12/14.
 */
var cookieParser = require('cookie-parser');
var Wechat_user = require('./Model/Wechat_user');


module.exports =  function(req,res,next) {
    var sessionid = req.signedCookies.sessionid;
    var noAuthError = new Error('no auth');
    noAuthError.status = 403;
    //如果没有sessionid
    if(!sessionid){
        return next(noAuthError);
    }
    //如果有sessionid，解析获取openid
    var openid = sessionid.split('@')[0];
    if(!openid)
        return next(noAuthError);

    Wechat_user.findOne({openid : openid}).then(function(user) {
        if(!user)
            return next(noAuthError);
        req.user = user;
        return next();
    });
};
