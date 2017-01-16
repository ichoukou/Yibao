
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var messageSchema = new Schema({

	isRead : {type : Boolean, default : false},
	sender : {
		_id : {
			type : Schema.Types.ObjectId,
			ref : 'User'
		},
		role : String,
		nickname : String,
		photo : String
	},
	accepter : {
		_id : {
			type : Schema.Types.ObjectId,
			ref : 'User'
		}
	},
	messageType : String,
	content : Schema.Types.Mixed,
	createTime : {type : Date, default : Date.now},
	editTime : {type : Date, default : Date.now}
},{
	strict : false
});

// validations for user schema

var Message = mongoose.model('Message', messageSchema);




// validate before saving
Message.schema.pre('save', function(next) {
	var message = this;
	message.editTime = new Date();
	next();
});

Message.create = function(obj) {
	var message = new Message(obj);
	return message.save();
};

module.exports = Message;
