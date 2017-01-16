var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/getUser', function(req, res, next) {
	var username = req.query.username;
	if(['you','joseph','bing', 'geller'].indexOf(username) != -1)
	    setTimeout(function(){
	        res.status(200).send(
			{
				username : username,
				age : (Math.random()*20 + 20) << 0,
				telephone : "1567854411",
				id : 3
			}
		);
	        
	    },2000);
		
	else 
		res.status(404).end();
});

module.exports = router;
