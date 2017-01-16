/**
 * Created by tzr4032369 on 2015/12/9.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var voteSchema = new Schema({
    voter : String,
    voted : String,
    createTime :  {type: Date, default: Date.now},
    editTime :  {type: Date, default: Date.now},
},{
    strict : false
});

// validations for user schema

var WechatVote = mongoose.model('WechatVote', voteSchema);




// validate before saving
// `保存`用户前的检测
WechatVote.schema.pre('save', function(next) {
    var vote = this;
    vote.editTime = new Date();
    next();
});

WechatVote.create = function(obj) {
    var vote = new WechatVote(obj);
    return vote.save();
};

module.exports = WechatVote;

