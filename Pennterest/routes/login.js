var connectData = {
		"hostname": "cis550zne.cbh8gmdnynf7.us-east-1.rds.amazonaws.com",
		"user": "zne",
		"password": "jacksonf",
		"database": "PENNZNE"
	};

var oracle =  require("oracle");
var crypto = require('crypto');
var account = require("../node_modules/account-manager");

exports.login = function(req, res){
	if (req.session.user != null) {
		res.redirect('/home');
	}
	else {
		if (req.query.err == "1") {
			res.render('login', { errmsg: "Invalid email address or password" });
		}
		else {
			res.render('login', { });
		}
		
	}
};

exports.postLogin = function(req, res){
	if (req.param('email') != null && req.param('pass') != null) {
		// attempt manual login //
		account.manualLogin(req.param('email'), req.param('pass'), function(e, u){
			if (!u){
				res.redirect('/login?err=1');
				//res.send(e, 400);
			}
			else {
				req.session.user = u;
				if (req.param('remember-me') === 'true'){
					res.cookie('user', u.user, { maxAge: 900000 });
					res.cookie('pass', u.pass, { maxAge: 900000 });
				}
				res.redirect('/home')
				//res.send(u, 200);
			}
		});
	}
};