/**
 * Created by tzr4032369 on 2015/10/26.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Schema = new Schema({
    user : {type:Schema.Types.ObjectId, ref : 'User'},
    feed : {type:Schema.Types.ObjectId, ref : 'Feed'},
    post : {type:Schema.Types.ObjectId, ref : 'Post'},
    createTime :  {type: Date, default: Date.now},
    editTime :  {type: Date, default: Date.now},
    zanType : String    //点赞的类型 feed or post
},{
    strict : false
});



var Dianzan = mongoose.model('Dianzan', Schema);


// validate before saving
Dianzan.schema.pre('save', function(next) {
    var dianzan = this;
    dianzan.editTime = new Date();
    next();
});

Dianzan.create = function(obj) {
    var dianzan = new Dianzan(obj);
    return dianzan.save();
};

module.exports = Dianzan;
