/**
 * Created by tzr4032369 on 2015/10/18.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var feedSchema = new Schema({
	createTime :  {type: Date, default: Date.now},
	editTime :  {type: Date, default: Date.now},
	picUrl : String,
	content : String,
	kudoNum : {type : Number, default : 0 },
	favourNum : {type : Number, default : 0 },
	commentNum : {type : Number, default : 0 },
	viewNum : {type : Number, default : 0 },
    tag :String,
    owner : {
		type:Schema.Types.ObjectId, ref : 'User'
	},
    ownerAvatar : String,
    ownerName : String,
    ownerRole : String
},{
	strict : false
});

// validations for user schema

var Feed = mongoose.model('Feed', feedSchema);




// validate before saving
Feed.schema.pre('save', function(next) {
	var feed = this;
	feed.editTime = new Date();
	next();
});

Feed.create = function(feedobj) {
	var feed = new Feed(feedobj);
	return feed.save();
};

module.exports = Feed;
