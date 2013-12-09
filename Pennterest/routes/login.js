var connectData = {
		"hostname": "cis550zne.cbh8gmdnynf7.us-east-1.rds.amazonaws.com",
		"user": "zne",
		"password": "jacksonf",
		"database": "PENNZNE"
	};

var oracle =  require("oracle");


exports.login = function(req, res){
	if (false /*usr logged in*/) {
		res.redirect('/home');
	}
	else {
		res.render('login', { });
	}
};