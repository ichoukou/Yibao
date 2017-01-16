var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var tokenSchema = new Schema({
	varName : String,
	token : Schema.Types.Mixed, 
	time : {type: Date, default: Date.now}
});

// validations for token schema

var Token = mongoose.model('Token', tokenSchema);
module.exports = Token;
