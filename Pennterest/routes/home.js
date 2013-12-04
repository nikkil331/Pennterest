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
	  oracle.connect(connectData, function(err, connection) {
	    if ( err ) {
	    	console.log(err);
	    } else {
	    	//user's first 5 pins
	    	var userPins = "(SELECT * FROM " +
	    			"(SELECT CONTENTPATH, FIRSTNAME, BOARDNAME, CAPTION, AVG(RATING) as RATING," +
	    			"  LISTAGG(TAG, ' #') WITHIN GROUP (ORDER BY TAG) as tags FROM " +
		    "(SELECT c.CONTENTPATH, u.FIRSTNAME, p.BOARDNAME, p.CAPTION, p.PINID, t.TAG, pr.RATING " +
		    "FROM PIN p, CONTENT c, USERS u, CONTENTTAG ct, TAG t, PINRATING pr " +
		    "WHERE p.USERID=" +id+ " AND p.CONTENTID = c.CONTENTID AND u.USERID=" +id +
		    " AND ct.CONTENTID = c.CONTENTID AND t.TAGID = ct.TAGID AND pr.PINID = p.PINID)" +
		    " GROUP BY PINID, CONTENTPATH, FIRSTNAME, BOARDNAME, CAPTION ORDER BY PINID)" +
		    " WHERE ROWNUM <= 5)";
	    	console.log(userPins);
	    	//first 10 pins tagged with user's interests
	    	var interestsPins = "(SELECT * FROM " +
	    			"(SELECT CONTENTPATH, FIRSTNAME, BOARDNAME, CAPTION, AVG(RATING) as RATING," +
	    			" LISTAGG(TAG, ' #') WITHIN GROUP (ORDER BY TAG) as tags FROM " +
	    			"(SELECT c.CONTENTPATH, u.FIRSTNAME, p.BOARDNAME, p.CAPTION, p.PINID, t.TAG, pr.RATING " +
	    			"FROM PIN p, CONTENTTAG ct1, CONTENTTAG ct2, TAG t, INTERESTED i, USERS u, CONTENT c, PINRATING pr " +
	    			"WHERE p.CONTENTID = ct1.CONTENTID AND i.TAGID = ct1.TAGID AND i.USERID =" + id +
	    					" AND p.CONTENTID = c.CONTENTID AND u.USERID = p.USERID" +
	    					" AND ct2.CONTENTID = p.CONTENTID AND t.TAGID = ct2.TAGID AND pr.PINID = p.PINID" +
	    					" ORDER BY p.PINID) " +
					" GROUP BY PINID, CONTENTPATH, FIRSTNAME, BOARDNAME, CAPTION ORDER BY PINID) " +
					" WHERE ROWNUM <= 10)";
	    	console.log(interestsPins);
	    	//first 10 pins of people the user is following
	    	var followedsPins = "(SELECT * FROM " +
	    			"(SELECT CONTENTPATH, FIRSTNAME, BOARDNAME, CAPTION, AVG(RATING) as RATING," +
	    			"  LISTAGG(TAG, ' #') WITHIN GROUP (ORDER BY TAG) as tags FROM " +
	    			"(SELECT c.CONTENTPATH, u.FIRSTNAME, p.BOARDNAME, p.CAPTION, p.PINID, t.TAG, pr.RATING " +
	    			"FROM PIN p, CONTENT c, USERS u, FOLLOWING f, CONTENTTAG ct, TAG t, PINRATING pr " +
	    			"WHERE f.FOLLOWER = " +id + " AND p.USERID = f.FOLLOWED " +
	    			"AND p.CONTENTID = c.CONTENTID AND u.USERID = f.FOLLOWED " +
	    			"AND ct.CONTENTID = c.CONTENTID AND ct.TAGID = t.TAGID AND pr.PINID = p.PINID) " +
	    			" GROUP BY PINID, CONTENTPATH, FIRSTNAME, BOARDNAME, CAPTION ORDER BY PINID)" +
	    			" WHERE ROWNUM <= 10) ";
	    	console.log(followedsPins);
	    	var query = "( " + userPins + " UNION " + interestsPins + " ) UNION " + followedsPins;
		  	
	    	connection.execute(query, 
		  			   [], 
		  			   function(err, results) {
		  	    if ( err ) {
		  	    	console.log(err);
		  	    } else {
		  	    	res.render('home.ejs',
		  	    			{ pins: results }
		  			  );
			    }
			  }); 
		  }
		
	});
		  	
}


exports.home = function(req, res){
  getPins_db(res, 1);
};


