/**
 * New node file
 */


var connectData = { 
		  "hostname": "cis550zne.cbh8gmdnynf7.us-east-1.rds.amazonaws.com", 
		  "user": "zne", 
		  "password": "jacksonf", 
		  "database": "PENNZNE" };

var oracle =  require("oracle");

function getPins_db(res, id) {
	var pinResults = {};
	var boardResults = {};
	oracle.connect(connectData, function(err, connection) {
		if ( err ) {
			console.log(err);
	    } else {
	    	//user's first 5 pins
	    	var userPins = "(SELECT * FROM " +
	    			"(SELECT PINID, CONTENTPATH, FIRSTNAME, BOARDNAME, CAPTION, RATING," +
	    			"  LISTAGG(TAG, ' #') WITHIN GROUP (ORDER BY TAG) as tags FROM " +
		    "(SELECT c.CONTENTPATH, u.FIRSTNAME, p.BOARDNAME, p.CAPTION, p.PINID, t.TAG, AVG(pr.RATING) as RATING " +
		    "FROM PIN p, CONTENT c, USERS u, CONTENTTAG ct, TAG t, PINRATING pr " +
		    "WHERE p.USERID=" +id+ " AND p.CONTENTID = c.CONTENTID AND u.USERID=" +id +
		    " AND ct.CONTENTID = c.CONTENTID AND t.TAGID = ct.TAGID AND pr.PINID = p.PINID" +
		    " GROUP BY c.CONTENTPATH, u.FIRSTNAME, p.BOARDNAME, p.CAPTION, p.PINID, t.TAG)" +
		    " GROUP BY PINID, CONTENTPATH, FIRSTNAME, BOARDNAME, CAPTION, RATING ORDER BY PINID)" +
		    " WHERE ROWNUM <= 5)";
	    	console.log(userPins);
	    	//first 10 pins tagged with user's interests
	    	var interestsPins = "(SELECT * FROM " +
	    			"(SELECT PINID, CONTENTPATH, FIRSTNAME, BOARDNAME, CAPTION, RATING," +
	    			" LISTAGG(TAG, ' #') WITHIN GROUP (ORDER BY TAG) as tags FROM " +
	    			"(SELECT c.CONTENTPATH, u.FIRSTNAME, p.BOARDNAME, p.CAPTION, p.PINID, t.TAG, AVG(pr.RATING) as RATING " +
	    			"FROM PIN p, CONTENTTAG ct1, CONTENTTAG ct2, TAG t, INTERESTED i, USERS u, CONTENT c, PINRATING pr " +
	    			"WHERE p.CONTENTID = ct1.CONTENTID AND i.TAGID = ct1.TAGID AND i.USERID =" + id +
	    					" AND p.CONTENTID = c.CONTENTID AND u.USERID = p.USERID" +
	    					" AND ct2.CONTENTID = p.CONTENTID AND t.TAGID = ct2.TAGID AND pr.PINID = p.PINID" +
	    					" GROUP BY c.CONTENTPATH, u.FIRSTNAME, p.BOARDNAME, p.CAPTION, p.PINID, t.TAG" +
	    					" ORDER BY p.PINID) " +
					" GROUP BY PINID, CONTENTPATH, FIRSTNAME, BOARDNAME, CAPTION, RATING ORDER BY PINID) " +
					" WHERE ROWNUM <= 10)";
	    	console.log(interestsPins);
	    	//first 10 pins of people the user is following
	    	var followedsPins = "(SELECT * FROM " +
	    			"(SELECT PINID, CONTENTPATH, FIRSTNAME, BOARDNAME, CAPTION, RATING, " +
	    			"  LISTAGG(TAG, ' #') WITHIN GROUP (ORDER BY TAG) as tags FROM " +
	    			"(SELECT c.CONTENTPATH, u.FIRSTNAME, p.BOARDNAME, p.CAPTION, p.PINID, t.TAG, AVG(pr.RATING) as RATING " +
	    			"FROM PIN p, CONTENT c, USERS u, FOLLOWING f, CONTENTTAG ct, TAG t, PINRATING pr " +
	    			"WHERE f.FOLLOWER = " +id + " AND p.USERID = f.FOLLOWED " +
	    			"AND p.CONTENTID = c.CONTENTID AND u.USERID = f.FOLLOWED " +
	    			"AND ct.CONTENTID = c.CONTENTID AND ct.TAGID = t.TAGID AND pr.PINID = p.PINID" +
	    			" GROUP BY c.CONTENTPATH, u.FIRSTNAME, p.BOARDNAME, p.CAPTION, p.PINID, t.TAG) " +
	    			" GROUP BY PINID, CONTENTPATH, FIRSTNAME, BOARDNAME, CAPTION, RATING ORDER BY PINID)" +
	    			" WHERE ROWNUM <= 10) ";
	    	console.log(followedsPins);
	    	var query = "( " + userPins + " UNION " + interestsPins + " ) UNION " + followedsPins;
		  	
	    	connection.execute(query, 
		  			   [], 
		  			   function(err, presults) {
		  	    if ( err ) {
		  	    	console.log(err);
		  	    } else {
		  	    	query = "SELECT BOARDNAME FROM BOARD WHERE USERID=" + id;
		  	    	connection.execute(query,
		  	    			[],
		  	    			function(err, bresults){
		  	    			if(err) {console.log(err);}
		  	    			else{
		  	    		    	res.render('home.ejs',
		  	    		    			{userID : id,  
		  	    		    			 boards : bresults,
		  	    		    			 pins: presults }
		  	    				  );
		  	    				connection.close();
		  	    			}
		  	    	});
			    }
			  }); 
	    	
		  }
	});
		  	
}


exports.home = function(req, res){
  getPins_db(res, 1);
};

//adds new rating
exports.update = function(req, res){
	oracle.connect(connectData, function(err, connection) {
	    if ( err ) {
	    	console.log(err + " first error");
	    } else {
	    	var query = "SELECT PINID, USERID FROM PINRATING" +
	    			" WHERE PINID = " + req.body.pinID + " AND USERID = " + req.body.userID;
	    	connection.execute(query, [], 
	    			function(err, results) {
		  	    		if ( err ) {
		  	    			console.log(err + " second error");
		  	    		} else {
		  	    			var insertRating;
		  	    			if(results.length > 0){
		  	    				insertRating = "UPDATE PINRATING SET RATING = " + req.body.rating + 
		  	    				" WHERE PINID = " + req.body.pinID + " AND USERID = " + req.body.userID;
		  	    			}
		  	    			else{
		  	    				insertRating = "INSERT INTO PINRATING (USERID, PINID, RATING) VALUES " +
		  	    				"(" + req.body.userID + ", " + req.body.pinID + ", " + req.body.rating + ")";
		  	    			} 
		  	    			console.log(insertRating);
		  	    			connection.execute(insertRating, 
		    				[],
		    				function(err, results) {
		    					if ( err ) {
		    						console.log(err + " third error");
		    					}
		    					else{
		    						connection.close();
		    					}
		    				});
		  	    		}
		  	    	});
	    	}
	    });
		res.end();
	}

//adds new pin
exports.addPin = function(req, res){
	oracle.connect(connectData, function(err, connection) {
	    if ( err ) {
	    	console.log(err + " first error");
	    } else {
	    	var query = "SELECT CONTENTID FROM PIN WHERE PINID = " + req.body.pinID;
	    	console.log(query);
	    	connection.execute(query,
	    			[],
	    			function(err, cid){
	    			if(err) {console.log(err);}
	    			else{
	    				console.log(cid);
	    				query = "INSERT INTO PIN (USERID, CONTENTID, BOARDNAME, CAPTION) VALUES" +
		    			" (" + req.body.userID + ", " + cid[0]["CONTENTID"] + ", \'" + req.body.boardName + 
		    			"\', '" + req.body.description + "')";
	    				console.log(query);
	    				connection.execute(query,
	    						[],
	    						function(err, results){
	    							if(err) {console.log(err);}
	    							else{
	    								connection.close();
	    								res.end();
	    							}
	    						});
	    				}
	    			});
	    	}
	});
}



