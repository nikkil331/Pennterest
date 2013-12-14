/*
 * user.js: this represents when someone
 * navigates to www.oursite.com/users. Not 100% 
 * sure why it was generated in this skeleton code.
 */

/*
 * GET users listing.
 */

var connectData = { 
		  "hostname": "cis550zne.cbh8gmdnynf7.us-east-1.rds.amazonaws.com", 
		  "user": "zne", 
		  "password": "jacksonf", 
		  "database": "PENNZNE" };
var oracle =  require("oracle");

function getFriendNames(results, id, connection, res){
	query = "SELECT u.FIRSTNAME, u.LASTNAME, u.USERID FROM FOLLOWING f, USERS u WHERE f.FOLLOWER=" + id + " AND f.FOLLOWED = u.USERID";
  	connection.execute(query,
  			[],
  			function(err, fresults){
  			if(err) {console.log(err);}
  			else{
  				getBoardNames(results, fresults, id, connection, res);
  			}
  	});
}

function getBoardNames(results, fresults, id, connection, res){
	query = "SELECT BOARDNAME FROM BOARD WHERE USERID=" + id;
  	connection.execute(query,
  			[],
  			function(err, bresults){
  			if(err) {console.log(err);}
  			else{
  				console.log(results);
  		    	res.render('user.ejs',
  		    			{user : results, 
		    			boards: bresults,
		    			friends: fresults
		    			}
  				  );
  				connection.close();
  			}
  	});
}

function get_profile(res,id) {
	  oracle.connect(connectData, function(err, connection) {
	    if ( err ) {
	    	console.log(err);
	    } else {
	    	query = "SELECT * FROM USERS WHERE USERID=" + id;
	      	connection.execute(query,
	      			[],
	      			function(err, results){
	      			console.log(results);
	      			if(err) {console.log(err);}
	      			else{
	      		    	getFriendNames(results, id, connection, res);
	      			}
	      	});
	    }
	  }); // end oracle.connect
	}

exports.user = function(req, res){
  get_profile(res, 109);
};

exports.addNewBoard = function(req, res){
	var boardName = req.body.boardName;
	var userID = req.body.userID;
	console.log("boardName = " + boardName);
	console.log("userID = " + userID);
	oracle.connect(connectData, function(err, connection){
		var query = "SELECT b.BOARDNAME FROM BOARD b WHERE b.USERID = '" + userID + 
		"' AND b.BOARDNAME= '" + boardName + "'";
		console.log(query);
		connection.execute(query, [], function(err, results){
			if(err) {console.log(err + " first err");}
			else{
				//new content
				if(results.length == 0){
					console.log("new content");
					addBoard(req, res, connection, boardName, userID);
				}
				//old content, use pinExisting()
				else{
					console.log("board already exists for user");
				}
			}
		})
 	})
}
function addBoard(req, res, connection, boardName, userID){
	var query = "INSERT INTO BOARD (BOARDNAME,USERID) VALUES ('"+ boardName + "' , " + userID + ")";
	connection.execute(query, [], function(err, results){
		if(err) {console.log(err + " second err");}
		else{
			console.log("new board made!");
		}
	});
}




