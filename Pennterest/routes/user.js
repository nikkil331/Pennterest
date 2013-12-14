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
        query = "SELECT u.FIRSTNAME, u.LASTNAME, u.USERID, u.PROFILEPICPATH FROM FOLLOWING f, USERS u WHERE f.FOLLOWER=" + id + " AND f.FOLLOWED = u.USERID";
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
        query = "SELECT B.BOARDNAME, " +
        		"MAX(C.CONTENTPATH) KEEP (DENSE_RANK FIRST ORDER BY C.CONTENTID) as CONTENTPATH  " +
        		"FROM BOARD B, CONTENT C, PIN P " +
        		"WHERE B.USERID=" + id + " AND B.BOARDNAME = P.BOARDNAME(+) AND " +
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
                    var query = "SELECT USERID, FIRSTNAME, LASTNAME, GENDER, BIO, AFFILIATION, " +
                    		"TO_CHAR(DOB, 'MM - DD - YYYY') AS DOB " +
                    		"FROM USERS WHERE USERID=" + id;
                    console.log(query);
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
	//console.log(req.query["userID"]);
	if( (typeof req.query.userID) != 'undefined') {
		get_profile(res, req.query["userID"]);
	}
	else if(req.session.user != null) {
		console.log(req.session.user);
		get_profile(res, req.session.user.USERID);
	}
	else {
		res.redirect('/login?err=2');
	}
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

				   
