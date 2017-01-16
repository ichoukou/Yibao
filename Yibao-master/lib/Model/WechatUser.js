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
		default:0},  //���Ʊ��
    voteTimes :{type:Number,default:0}, //ͶƱ������һ���û�ͶƱ�������Ϊ3
    workname :{type:String},    //��Ʒ����
    picUrl :{type:String},   //��Ʒurl
    createTime :  {type: Date, default: Date.now},
    editTime :  {type: Date, default: Date.now},
},{
    strict : false
});

// validations for user schema

var WechatUser = mongoose.model('WechatUser', userSchema);




// validate before saving
// `����`�û�ǰ�ļ��
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
