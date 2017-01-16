var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var compression = require('compression');
var multer = require('multer');
var cors = require('cors');
var hbs = require('hbs');
var Post = require('./lib/Model/Post');
var Tag = require('./lib/Model/Tag');
var Category = require('./lib/Model/Category');


var addons = require('./lib/addons.js');

var config = require('./config');

var routes = require('./routes/index');
var debug = require('./routes/debug');
var manager = require('./routes/manager');
var wechat = require('./routes/Wechat');
var sessionCtrl = require('./lib/sessionCtrl');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
hbs.registerHelper('breaklines', function(text) {
	text = hbs.Utils.escapeExpression(text);
	text = text.replace(/(\r\n|\n|\r)/gm, '<br>');
	return new hbs.SafeString(text);
});
    hbs.registerHelper('format', function(date) {
      var date_time = "";
      var year = date.getFullYear();
      var month = date.getMonth() + 1;
      var day = date.getDate();
      date_time = year + '-' + month + '-' + day;
      return date_time;
    });
app.engine('html', hbs.__express);



// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public/img', 'favcon.ico')));

var mongoose = require('mongoose');
mongoose.connect('mongodb://'+config.db.username+':'
				 +config.db.password+'@'+config.db.host+
				 ':'+config.db.port+'/'+config.db.dbname, config.db.options);
mongoose.connection.once('open',function() {
	console.log('[app.js] Database connect successfully.');
}).on('error', function(err) {
	console.log('[app.js] Database connect failed.');
	console.error(err);
});


app.use(logger('dev'));
app.use(cors());
app.use(bodyParser.json({limit:"5mb"}));
app.use(bodyParser.urlencoded({ extended: true,limit:"5mb" }));
app.use(cookieParser('yibao2015'));

//app.use(multer);
app.use(compression());
app.use(express.static(path.join(__dirname, 'public')));

app.use(addons);


app.get('/articlesByName/:tag_name',function(req,res){
  var tag=req.params.tag_name;
  Tag.findOne({name:tag}).then(function (tag) {
    Post.find({tags:{$all:[tag._id]}}).select("-content").populate('category').then(function (posts) {
      console.log(posts);
      res.render('tag_articles',{
        posts:posts,
        tag:tag.name,
      })
    })
  })
})

app.get('/articlesById/:_id',function(req,res){
  var id=req.params._id;
  Post.find({tags:{$all:[id]}}).select("-content").then(function (posts) {
      res.render('tag_articles',{
        posts:posts,
      })
    })
})
app.use('/', routes);
app.use('/debug', debug);
app.use('/manager', manager);
app.use('/wechat', wechat);

// catch 404 and forward to error handler
app.use('/',function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    console.log(err.stack);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}
// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  console.log(err.stack);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;
