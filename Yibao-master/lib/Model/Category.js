var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var catSchema = new Schema({
	name : String,  //类别名
	status : String,
	parent:{type : Schema.Types.ObjectId, ref : 'Category'},  //该类别的父类别
	createTime :  {type: Date, default: Date.now},
	editTime :  {type: Date, default: Date.now}
},{
	strict : false
});

// validations for user schema

var Category = mongoose.model('Category', catSchema);


// validate before saving
// `保存`用户前的检测
Category.schema.pre('save', function(next) {
	var category = this;
	category.editTime = new Date();
	next();
});


Category.create = function(obj) {
	var category = new Category(obj);
	return category.save();
};
module.exports = Category;
