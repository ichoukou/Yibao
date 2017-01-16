var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var postSchema = new Schema({
	title : String,
	content : String,			//HTML format
	subtitle : String,
	picUrl : String,
	thumbUrl : String,
	category : {type:Schema.Types.ObjectId, ref : 'Category'},
	tags : [{type:Schema.Types.ObjectId, ref : 'Tag'}],
	status : {type : String, default: "ACTIVE"},
	createTime :  {type: Date, default: Date.now},
	editTime :  {type: Date, default: Date.now},
	likeNum: {type: Number, default: 0},
	favourNum: {type: Number, default: 0},
	viewNum: {type: Number, default: 0},
	profile:String   //简介
},{
	strict : false
});

// validations for user schema

var Post = mongoose.model('Post', postSchema);


// validate before saving
// `保存`用户前的检测
Post.schema.pre('save', function(next) {
	var post = this;	
	post.editTime = new Date();
	next();
});

Post.create = function(obj) {
	var post = new Post(obj);
	return post.save();
};

Post.formatDate = function (date){
	var format = "";
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    format = year + '-' + month + '-' + day;
    return format;
};

module.exports = Post;
