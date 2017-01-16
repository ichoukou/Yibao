// 用于微信 各种 access token的存取
var Token = require('./Model/Token');
var Q = require('q');
var token = this;
token.readFactory = function(tokenName) {
	return function(cb) {
		Token.findOne({varName:tokenName}).then(function(record) {
			if(!record) return cb(null, null);
			return cb(null, record.token, record.time);
		});
	};
};

token.writeFactory = function(tokenName) {
	return function(t,cb) {
		Token.findOneAndUpdate({
			varName : tokenName
		},{
			$set : {"token" : t, "time" : new Date() }
		},{
			upsert: true, new : true
		}).then(function(t) {
			cb();
		}).then(null, function(err) {
			cb(err);
		});
	};
};


token.read = function(tokenName) {
	var d = Q.defer();
	Token.findOne({varName : tokenName}).then(function(record) {
		if(!record)   d.resolve();
		else  d.resolve(record.token);
	}).then(null,function(err) {
		d.reject(err);
	});
	return d.promise;
};

token.write = function(tokenName,t) {
	return Token.findOneAndUpdate({
		varName : tokenName
	},{
		$set : {"token" : t, "time" : new Date() }
	},{
		upsert: true, new : true
	});
};

token.add = function(tokenName, t) {
	var d = Q.defer();
	Token.findOne({varName:tokenName}).then(function(record) {
		if(!record){
			return token.write(tokenName,t);
		}
		d.resolve();
	}).then(function() {
		d.resolve();
	});
	return d.promise;
};



module.exports = token;
