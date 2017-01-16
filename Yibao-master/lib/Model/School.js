/**
 * Created by tzr4032369 on 2015/10/25.
 */


var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schoolSchema = new Schema({
    name:{type:String},
    district:{type:String},
    picture:{type:String},
    profile:{type:String},
    FavourNum:Number,
    category:{type:Schema.Types.ObjectId, ref : 'Category'},   //高校所属的类别
},{
    strict : false
});

// validations for user schema

var School = mongoose.model('School', schoolSchema);




// validate before saving
School.schema.pre('save', function(next) {
    var school = this;
    school._editTime = new Date();
    next();
});

School.create = function(obj) {
    var school = new School(obj);
    return school.save();
};

module.exports = School;
