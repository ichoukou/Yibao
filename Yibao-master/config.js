var config = this;

// @xiaofeng :  isCoding这是多此一举的，而且不利于顺着起来理解
var isCoding = process.env.VCAP_SERVICES ? true : false;
var debugMode = false;
var dbInfo;

dbInfo = {
    host: debugMode ? "localhost":"182.92.149.223",
    name: "yibao",
    password: "123456",
    port: debugMode ? 27017 : 27999,
    username: "yibaoAdmin"
};

config.db = {
    host: dbInfo.host,
    port: dbInfo.port,
    dbname: dbInfo.name,
    username: dbInfo.username,
    password: dbInfo.password,
	options : {
		db: { native_parser: true },
		server: { poolSize: 6 }
	}
};

config.oss = {
	accessKeyId : "jkwuX79beR6ekg9z",
	accessKeySecret : "II2yxcciTqa2aVkxA57v1J4o4Ljke5",
	region : "oss-cn-beijing",
	host : "oss-cn-beijing.aliyuncs.com"
};

exports.wxClient = {
	appid : "wxb3538a646e5844c6",
	appsec : "3eb3baac886565c40742842933040fca"
};

module.exports = config;


