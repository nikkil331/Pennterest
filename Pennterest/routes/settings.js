/**
 * New node file
 */

var connectData = {
		"hostname": "cis550zne.cbh8gmdnynf7.us-east-1.rds.amazonaws.com",
		"user": "zne",
		"password": "jacksonf",
		"database": "PENNZNE"
	};

var oracle =  require("oracle");
exports.settings = function(req, res){
	if(req.session.user == null){
		res.redirect('/login?err=2');
		return;
	}
	oracle.connect(connectData, function(err, connection) {
		if ( err ) {
			console.log(err);
		} else {
			var query = "SELECT USERID, FIRSTNAME, LASTNAME, GENDER, BIO, AFFILIATION, EMAIL, " +
    		"PROFILEPICPATH, TO_CHAR(DOB, 'MM / DD / YYYY') AS DOB " +
    		"FROM USERS WHERE USERID=" + req.session.user.USERID;
			var start = new Date().getTime();
			connection.execute(query, [], function(err, results){
				if(err){console.log(err);}
				else{
					console.log("GET USER SETTINGS TIME: " + (new Date().getTime() - start));
					res.render('settings.ejs',
							{user: results}
							);
				}
			});
		}
	});
}

exports.change = function(req, res){
	oracle.connect(connectData, function(err, connection){
		if(err) {console.log(err);}
		else{
			var firstName = req.body.firstName;
			var lastName = req.body.lastName;
			var email = req.body.email;
			var dob = req.body.dob;
			var gender = req.body.gender;
			var bio = req.body.bio;
			var affiliation = req.body.affiliation;
			var profilepic = req.body.profilepic;
			var query = "UPDATE USERS " +
					"SET FIRSTNAME = '" + firstName +
					"', LASTNAME = '" + lastName +
					"', EMAIL = '" + email +
					"', DOB = TO_DATE('" + dob + "', 'MM/DD/YYYY')" +
					", GENDER = '" + gender +
					"', BIO = '" + bio +
					"', AFFILIATION = '" + req.body.affiliation +
					"', PROFILEPICPATH = '" + req.body.profilepic + 
					"' WHERE USERID = " + req.session.user.USERID;
			var start = new Date().getTime();
			connection.execute(query, [], function(err, results){
				if(err ){console.log(err);}
				else{
					console.log("UPDATE SETTINGS TIME: " + (new Date().getTime() - start));
					res.redirect("/user?userID=" + req.session.user.USERID);
					connection.close();
				}
			});
		}
	});
}