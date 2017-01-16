/**
 * Created by tzr4032369 on 2015/10/22.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
//TMD����ҪVS�������������ܲ��ˣ�
// var bcrypt=require('bcrypt');
var ManagerSchema = new Schema({
   name: {
       unique:true,
       type:String
   },
   password:{
        type:String
   }
},{
    strict : false
});

// validations for user schema

var Manager = mongoose.model('Manager', ManagerSchema);




// validate before saving

//����manager���룬ʹ��bcrypt����
Manager.schema.pre('save', function(next) {
    var manager = this;
    //bcrypt.genSalt(10,function(err,salt){
    //    if(err)
    //        return next(err)
    //    bcrypt.hash(manager.password,salt,function(err,hash){
    //        if(err)
    //            return next(err)
    //        manager.password=hash;
    //        next();
    //    })
    //})
    manager._editTime = new Date();
    next();
});

////�������ƥ�亯��
//ManagerSchema.methods = {
//    comparePassword: function(_password, cb) {
//        bcrypt.compare(_password, this.password, function(err, isMatch) {
//            if (err) return cb(err)
//
//            cb(null, isMatch)
//        })
//    }
//}
Manager.create = function(obj) {
    var manager = new Manager(obj);
    return manager.save();
};

module.exports = Manager;
