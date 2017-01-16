/**
 * Created by tzr4032369 on 2015/10/25.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var commentSchema = new Schema({
    commented : {type : Schema.Types.ObjectId, ref : 'Feed'},
    owner:{type : Schema.Types.ObjectId, ref : 'User'},
    ownerName : String,
    ownerAvatar : String,
    createTime : {type: Date, default: Date.now},
    editTime :  {type: Date, default: Date.now},
    content : String
},{
    strict : false
});

// validations for user schema

var Comment = mongoose.model('Comment', commentSchema);


// validate before saving
Comment.schema.pre('save', function(next) {
    var comment = this;
    comment.editTime = new Date();
    next();
});

Comment.create = function(obj) {
    var comment = new Comment(obj);
    return comment.save();
};

module.exports = Comment;
