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
		    " AND c.CONTENTID = ct.CONTENTID(+) AND ct.TAGID = t.TAGID(+) AND p.PINID = pr.PINID(+)" +
		    " GROUP BY c.CONTENTPATH, u.FIRSTNAME, p.BOARDNAME, p.CAPTION, p.PINID, t.TAG)" +
		    " GROUP BY PINID, CONTENTPATH, FIRSTNAME, BOARDNAME, CAPTION, RATING ORDER BY PINID DESC)" +
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
	    					" AND p.CONTENTID = ct2.CONTENTID(+) AND ct2.TAGID = t.TAGID(+) AND p.PINID = pr.PINID(+)" +
	    					" GROUP BY c.CONTENTPATH, u.FIRSTNAME, p.BOARDNAME, p.CAPTION, p.PINID, t.TAG" +
	    					" ORDER BY p.PINID) " +
					" GROUP BY PINID, CONTENTPATH, FIRSTNAME, BOARDNAME, CAPTION, RATING ORDER BY PINID DESC) " +
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
	    			"AND c.CONTENTID = ct.CONTENTID(+) AND ct.TAGID = t.TAGID(+) AND p.PINID = pr.PINID(+)" +
	    			" GROUP BY c.CONTENTPATH, u.FIRSTNAME, p.BOARDNAME, p.CAPTION, p.PINID, t.TAG) " +
	    			" GROUP BY PINID, CONTENTPATH, FIRSTNAME, BOARDNAME, CAPTION, RATING ORDER BY PINID DESC)" +
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
  getPins_db(res, 109);
};

//adds new rating
exports.update = function(req, res){
	console.log("updating...");
	oracle.connect(connectData, function(err, connection) {
	    if ( err ) {
	    	console.log(err);
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
	var description = req.body.description;
	tags = getTags(description);
	console.log(tags);
	var contentid;
	oracle.connect(connectData, function(err, connection) {
	    if ( err ) {
	    	console.log(err);
	    } else {
	    	var query = "SELECT CONTENTID FROM PIN WHERE PINID = " + req.body.pinID;
	    	console.log(query);
	    	connection.execute(query,
	    		[],
	    		function(err, results){
	    			if(err) {console.log(err);}
	    			else{
	    				console.log("now to pin...");
	    				var data = {"contentid":results[0]["CONTENTID"], "userid":req.body.userID, "boardname":req.body.boardName, 
	    						"description":req.body.description, "tags":tags, "connection":connection, "response":res};
	    				pinContent(data);
	    			}
	    		});
	    	}
		});
}

function getTags(description){
	var alphanumeric = new RegExp('[0-9a-zA-z]');
	var tags = [];
	for(var i = 0; i < description.length; i++){
		var c = description.charAt(i);
		if(c == "#"){
			var tag = "";
			i++;
			c = description.charAt(i);
			while(alphanumeric.test(c)){
				tag = tag +  c;
				i++;
				c = description.charAt(i);
			}
			tags.push(tag);
			i--;
		}
	}
	return tags;
}

function pinContent(data){
	var query = "INSERT INTO PIN (USERID, CONTENTID, BOARDNAME, CAPTION, PINID) VALUES" +
	" (" + data["userid"] + ", " + data["contentid"] + ", \'" + data["boardname"] + 
	"\', '" + data["description"] + "' " + ", seq_pin_id.nextval)";
	console.log(query);
	data["connection"].execute(query, [], 
		function(err, results){
			if(err) { console.log(err); }
			else{
				if(data["tags"].length > 0){
					console.log("tags.length > 0");
					addTags(data);
				}
			}
		});
}

function addTags (data){
	console.log('adding tags...');
	for(var i = 0; i < data["tags"].length; i++){
		getTagId(data, i);
	}
}

function getTagId(data, index){
	console.log('getting tag ids...');
	query = "SELECT TAGID FROM TAG WHERE TAG='" + data["tags"][index] + "'";
	console.log(query);
	data["connection"].execute(query, [], 
	function(err, results){
		if(err) {console.log(err);}
		if(results.length > 1){
			insertContentTag(data, results[0]["TAGID"]);
		}
		else{
			insertTag(data, data["tags"][index]);
		}
	});
}

function insertContentTag (data, tagid){
	console.log('inserting content tag');
	query = "INSERT INTO CONTENTTAG (TAGID, CONTENTID) VALUES (" + tagid +
			", " + data["contentid"] + ")";
	console.log(query);
	data["connection"].execute(query,
			[],
	function(err,insertRes){
		if(err) {console.log(err);}
		data["connection"].close();
		data["response"].end();
	});
}

function insertTag(data, tag){
	query = "INSERT INTO TAG (TAGID, TAG) VALUES (seq_tag_id.nextval, '" +
	tag + "')";
	console.log(query);
	data["connection"].execute(query,
	[],
	function(err, insertRes){
		if(err) {console.log(err);}
		else{
			query = "INSERT INTO CONTENTTAG (TAGID, CONTENTID) VALUES (" + 
			"(SELECT seq_tag_id.currval FROM dual), " + data["contentid"];
			console.log(query);
			data["connection"].execute(query,
			[],
			function(err, results){
				if(err) { console.log(err); }
				data["connection"].close();
	    		data["response"].end();
			});
		}
	});
}






