var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
	name : String,
	status : {type : String, default : "ACTIVE"},
	createTime :  {type: Date, default: Date.now},
	editTime :  {type: Date, default: Date.now},
    post: {type: Schema.Types.ObjectId, ref: 'Post'},
	parent:{type:Schema.Types.ObjectId, ref : 'Tag'}  //子标签
},{
	strict : false
});

// validations for user schema

var Tag = mongoose.model('Tag', schema);


// validate before saving
// `保存`用户前的检测
Tag.schema.pre('save', function(next) {
	var tag = this;
	tag._editTime = new Date();
	next();
});


module.exports = Tag;
