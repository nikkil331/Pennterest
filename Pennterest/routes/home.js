/**
 * New node file
 */
var pins = [];

var connectData = { 
		  "hostname": "cis550zne.cbh8gmdnynf7.us-east-1.rds.amazonaws.com", 
		  "user": "zne", 
		  "password": "jacksonf", 
		  "database": "PENNZNE" };

var oracle =  require("oracle");
var pins;
var name;

function getPins_db(res, id) {
	  oracle.connect(connectData, function(err, connection) {
	    if ( err ) {
	    	console.log(err);
	    } else {
	    	//user's first 5 pins
	    	var userPins = "(SELECT * FROM " +
		    "(SELECT c.CONTENTPATH, u.FIRSTNAME, p.BOARDNAME FROM PIN p, CONTENT c, USERS u " +
		    "WHERE p.USERID=" +id+ " AND p.CONTENTID = c.CONTENTID AND u.USERID=" +id +
						" ORDER BY p.PINID) WHERE ROWNUM <= 5)";
	    	//first 10 pins tagged with user's interests
	    	var interestsPins = "(SELECT * FROM (SELECT c.CONTENTPATH, u.FIRSTNAME, p.BOARDNAME FROM PIN p, CONTENTTAG t, " +
			"INTERESTED i, USERS u, CONTENT c WHERE p.CONTENTID = t.CONTENTID AND i.TAGID = t.TAGID" +
			" AND i.USERID =" + id + " AND p.CONTENTID = c.CONTENTID AND u.USERID = p.USERID ORDER BY p.PINID) " +
					"WHERE ROWNUM <= 10)";
	    	//first 10 pins of people the user is following
	    	var followedsPins = "(SELECT * FROM (SELECT c.CONTENTPATH, u.FIRSTNAME, p.BOARDNAME FROM PIN p," +
	    			"CONTENT c, USERS u, FOLLOWING f WHERE f.FOLLOWER = " +id + " AND p.USERID = f.FOLLOWED " +
	    					"AND p.CONTENTID = c.CONTENTID AND u.USERID = f.FOLLOWED) WHERE ROWNUM <= 10)";
	    	var query = "( " + userPins + " UNION " + interestsPins + " ) UNION " + followedsPins;
		  	
	    	connection.execute(query, 
		  			   [], 
		  			   function(err, results) {
		  	    if ( err ) {
		  	    	console.log(err);
		  	    } else {
		  	    	pins = results;
		  	    	query = "SELECT FIRSTNAME FROM USERS WHERE USERID =" + id
				  	connection.execute(query,
				  			[],
				  			function(err, results){
				  		if(err){
				  			console.log(err);
				  		} else{
				  			name = results[0].FIRSTNAME;
				  			render(res);
				  			
				  		}
				  	});
			    }
			  }); 
		  }
		
	});
		  	
}

function render(res){
	res.render('home.ejs',
			   { user: name,
			     pins: pins }
		  );
}

exports.home = function(req, res){
  getPins_db(res, 1);
};