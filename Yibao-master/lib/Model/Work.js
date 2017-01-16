/**
 * Created by tzr4032369 on 2015/10/18.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var workSchema = new Schema({
	publishTime : {type: Date, default: Date.now},
	picUrl  : {type: String},
	content : {type: String},
	commentNum : {type: Number},
	like:{type: Number}, 
	viewNum:{type: Number},
	collectNum:{type: Number}, 
	flowerNum:{type: Number},
	tags : [{type:Schema.Types.ObjectId, ref : 'Tag'}],
	createTime :  {type: Date, default: Date.now},
	editTime :  {type: Date, default: Date.now}
},{
	strict : false
});

// validations for user schema

var Work = mongoose.model('Work', workSchema);




// validate before saving
// `±£´æ`ÓÃ»§Ç°µÄ¼ì²â
Work.schema.pre('save', function(next) {
	var work = this;
	work.editTime = new Date();
	next();
});

Work.create = function(workobj) {
	var work = new Work(workobj);
	return work.save();
};

module.exports = Work;
