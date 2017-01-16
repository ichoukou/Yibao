/**
 * Created by tzr4032369 on 2015/10/26.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Schema = new Schema({
    follower:{type:Schema.Types.ObjectId, ref : 'User'},
    followed:{type:Schema.Types.ObjectId, ref : 'User'},
    followed_school:{type:Schema.Types.ObjectId, ref : 'School'},
    followTime:{type:Date,default:Date.now},    //开始关注的时间
},{
    strict : false
});



var Follow= mongoose.model('Follow', Schema);




// validate before saving
Follow.schema.pre('save', function(next) {
    var follow = this;
    follow._editTime = new Date();
    next();
});

Follow.create = function(obj) {
    var follow = new Follow(obj);
    return follow.save();
};

module.exports = Follow;
