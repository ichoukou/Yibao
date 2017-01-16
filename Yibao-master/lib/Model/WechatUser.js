/**
 * Created by tzr4032369 on 2015/12/9.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
	_id : String,
	nickname : {type : String, default: ""},
	openid  : {type : String , requried : true},
	grade :{type :String},
	telephone : {type : String},
	voteNum :{ type : Number,
		default:0},  //获得票数
    voteTimes :{type:Number,default:0}, //投票次数，一个用户投票次数最多为3
    workname :{type:String},    //作品名称
    picUrl :{type:String},   //作品url
    createTime :  {type: Date, default: Date.now},
    editTime :  {type: Date, default: Date.now},
},{
    strict : false
});

// validations for user schema

var WechatUser = mongoose.model('WechatUser', userSchema);




// validate before saving
// `保存`用户前的检测
WechatUser.schema.pre('save', function(next) {
    var user = this;
    user.editTime = new Date();
    next();
});

WechatUser.create = function(userobj) {
    var user = new WechatUser(userobj);
    return user.save();
};

module.exports = WechatUser;
