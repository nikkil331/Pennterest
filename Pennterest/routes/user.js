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

function getFriendNames(results, displayed, viewer, connection, res){
        query = "SELECT u.FIRSTNAME, u.LASTNAME, u.USERID, u.PROFILEPICPATH FROM FOLLOWING f, USERS u WHERE f.FOLLOWER=" + displayed + " AND f.FOLLOWED = u.USERID";
          connection.execute(query,
                          [],
                          function(err, fresults){
                          if(err) {console.log(err);}
                          else{
                                  getBoardNames(results, fresults, displayed, viewer, connection, res);
                          }
          });
}

function getBoardNames(results, fresults, displayed, viewer, connection, res){
        query = "SELECT B.BOARDNAME, " +
        		"MAX(C.CONTENTPATH) KEEP (DENSE_RANK FIRST ORDER BY C.CONTENTID) as CONTENTPATH  " +
        		"FROM BOARD B, CONTENT C, PIN P " +
        		"WHERE B.USERID=" + displayed + " AND B.BOARDNAME = P.BOARDNAME(+) AND " +
        		"P.CONTENTID = C.CONTENTID(+) " +
        		"GROUP BY B.BOARDNAME";
        console.log(query);
          connection.execute(query,
                          [],
                          function(err, bresults){
                          if(err) {console.log(err);}
                          else{
                                  console.log(results);
                              res.render('user.ejs',
                                            {user : results, 
                                            boards: bresults,
                                            friends: fresults,
                                            viewer: viewer
                                            }
                                    );
                                  connection.close();
                          }
          });
}

function get_profile(res, displayed, viewer) {
          oracle.connect(connectData, function(err, connection) {
            if ( err ) {
                    console.log(err);
            } else {
                    var query = "SELECT USERID, FIRSTNAME, LASTNAME, GENDER, BIO, AFFILIATION, PROFILEPICPATH, " +
                    		"TO_CHAR(DOB, 'MM - DD - YYYY') AS DOB " +
                    		"FROM USERS WHERE USERID=" + displayed;
                    console.log(query);
                      connection.execute(query,
                                      [],
                                      function(err, results){
                                      console.log(results);
                                      if(err) {console.log(err);}
                                      else{
                                          getFriendNames(results, displayed, viewer, connection, res);
                                      }
                      });
            }
          }); // end oracle.connect
        }
exports.follow = function(req, res){
	if(req.session.user == null){
		res.redirect('/login?err=2');
		return;
	}
	var followed = req.body.followed;
	var follower = req.session.user.USERID;
	oracle.connect(connectData, function(err, connection){
		if(err) {console.log(err);}
		else{
			var query = "INSERT INTO FOLLOWING (FOLLOWED, FOLLOWER) VALUES " +
					"('" + followed + "', '" + follower + "')";
			console.log(query);
			connection.execute(query, [], function(err, results){
				if(err) {console.log(err);}
				else{
					res.end();
					connection.close();
				}
			});
		}
	});
}
exports.user = function(req, res){
	if( (typeof req.query.userID) != 'undefined' && req.session.user != null) {
		get_profile(res, req.query["userID"], req.session.user.USERID);
	}
	else if(req.session.user != null) {
		console.log(req.session.user);
		get_profile(res, req.session.user.USERID, req.session.user.USERID);
	}
	else {
		res.redirect('/login?err=2');
	}
};

exports.addNewBoard = function(req, res){
		if(req.session.user == null){
			res.redirect('/login?err=2');
			return;
		}
        var boardName = req.body.boardName;
        var userID = req.session.user.USERID;
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
                                	res.end();
                                	connection.close();
                                        console.log("board already exists for user");
                                }
                        }
                });
         });
}
function addBoard(req, res, connection, boardName, userID){
        var query = "INSERT INTO BOARD (BOARDNAME,USERID) VALUES ('"+ boardName + "' , " + userID + ")";
        connection.execute(query, [], function(err, results){
                if(err) {console.log(err + " second err");}
                else{
                        console.log("new board made!");
                        connection.close();
                        res.redirect('/user?userID=' + userID);
                }
        });
}

				   
