var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
	//共有属性
	role : String, 	 //TEACHER, STUDENT，STUDIO
	work:[{type:Schema.Types.ObjectId, ref : 'Work'}],
	uid : {type: String}, //微信用户识别id
	telephone : {type : String},
	nickname : {type : String, default: ""},
	address:{type:String},  //省份
	photo:{type:String},
    	role :  {type: String, default: "STUDENT"},
	createTime :  {type: Date, default: Date.now},
	editTime :  {type: Date, default: Date.now},
    	followNum : {type: Number},  //关注数
	fansNum: {type: Number},  //粉丝数
	workNum: {type: Number},   //画作数
	verify : {					//For verifying the telephone
		ing : {type : Boolean, default : false},
		uid : String,
		telephone : String,
		code : String,
		sendTime : Date,
		tryCount : Number,
		tryTime : Date
	},

},{
	strict : false
});

// validations for user schema

var User = mongoose.model('User', userSchema);




// validate before saving
// `保存`用户前的检测
User.schema.pre('save', function(next) {
	var user = this;
	user.editTime = new Date();
	next();
});

User.create = function(userobj) {
	var user = new User(userobj);
	return user.save();
};

module.exports = User;
