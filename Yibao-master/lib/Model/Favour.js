/**
 * Created by tzr4032369 on 2015/10/26.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var FavourSchema = new Schema({
    user:{
	type:Schema.Types.ObjectId,
	ref : 'User'
    },
    feedid : {
	type:Schema.Types.ObjectId,
	ref : "Feed"
    },
    postid : {
	type:Schema.Types.ObjectId,
	ref : "Post"
    },
    createTime:{
	type: Date, default: Date.now
    },
    editTime:{
	type: Date, default: Date.now
    },
    type : String,
    owner : Schema.Types.ObjectId,
    ownerAvatar : String,
    ownerName : String
},{
    strict : false
});



var Favour = mongoose.model('Favour', FavourSchema);




// validate before saving
Favour.schema.pre('save', function(next) {
    var favour = this;
    favour.editTime = new Date();
    next();
});

Favour.create = function(obj) {
    var favour = new Favour(obj);
    return favour.save();
};

module.exports = Favour;
