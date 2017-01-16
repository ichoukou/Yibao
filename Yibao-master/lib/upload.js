var q = require('q');
var co = require('co');
var oss = require('ali-oss');
var config = require('../config');
var Upload = this;

var store = oss({
    accessKeyId : config.oss.accessKeyId,
    accessKeySecret : config.oss.accessKeySecret,
    bucket : "yibao",
    region : config.oss.region
});
store.put = co.wrap(store.put);

// 上传图片接口
// POST /uploadImage
// b64 : Image file in base64 format
Upload.imageHandler = function(req,res,next) {
    console.log('enter imageHandler');
    var base64 = req.body.b64;
    var type = base64 == undefined ? null : base64.match(/^data:image\/jpeg;/) ? 'jpg' : base64.match(/^data:image\/png;/) ? 'png' : null; 
    if(!type)
	return res.status(403).send('image format error');

    base64 = base64.replace(/^data:image\/jpeg;base64,/, "").replace(/^data:image\/png;base64,/, "");

    var date = Date.now();
    var fileName = date + "." + type;

    console.log('upload filename : '+ fileName);
    store.put(fileName, new Buffer(base64,'base64')).then(function(obj) {
	console.log('upload success', obj);
	return res.f(0,{picUrl : obj.url});
    }).then(null, function(error) {
        next(error);
    });
    return true;
};

Upload.image = function(base64) {
    var d = q.defer();
    var type = base64 == undefined ? null : base64.match(/^data:image\/jpeg;/) ? 'jpg' : base64.match(/^data:image\/png;/) ? 'png' : null; 
    if(!type)
	d.reject('type error');

    base64 = base64.replace(/^data:image\/jpeg;base64,/, "").replace(/^data:image\/png;base64,/, "");

    var date = Date.now();
    var fileName = date + "." + type;
    var file = new Buffer(base64,'base64');
    store.put(fileName, file).then(function(obj) {
	d.resolve(obj.url);
    },function(err) {
	d.reject(err);
    });
    
    return d.promise;
};

Upload.imageBuffer = function(buffer) {
        var d = q.defer();

	var date = Date.now();
	var fileName = date + ".jpg";
	var file = buffer;
	store.put(fileName, file).then(function(obj) {
		d.resolve(obj.url);
	},function(err) {
		d.reject(err);
	});
	
	return d.promise;
}


Upload.voiceHandler = function(req,res,next) {
    if(req.busboy){
	req.busboy.on('file', function(fieldname, file, filename) {
	    console.log('busboy found a file : '+filename);
	    var fileChunks = [];
	    var fileBuffer;
	    file.on('data', function(data) {
		fileChunks.push(data);
	    });
	    file.on('end', function(end) {
		var date = Date.now();
		var fileName = date + ".amr";
		fileBuffer = Buffer.concat(fileChunks);
		store.put(fileName, fileBuffer).then(function(obj) {
		    console.log('upload Voice success : ',obj);
		    res.f(0, {path : obj.url});
		},function(err) {
		    console.log('OSS upload failed : ',err);
		});
	    });
	});
	req.pipe(req.busboy);
    }else{
	console.log('no busboy found');
    }

};



module.exports = Upload;
