/**
 * New node file
 */

var oracle = require("oracle");
var connectData = {
	"hostname": "cis550zne.cbh8gmdnynf7.us-east-1.rds.amazonaws.com",
	"user": "zne",
	"password": "jacksonf",
	"database": "PENNZNE"
};
	
exports.getBoardContent = function(req, res){
	var boardName = req.query["boardName"];
	var buserID = req.query["buserID"]; //board owner's id
	var suserID = req.query["suserID"]; //session owner's id
	oracle.connect(connectData, function(err, connection){
		if(err) {console.log(err);}
		else{
			var query =
			"SELECT PINID, CONTENTPATH, FIRSTNAME, USERID, BOARDNAME, CAPTION, RATING, " +
			"LISTAGG(TAG, ' #') WITHIN GROUP (ORDER BY TAG) as tags FROM " +
			"(SELECT c.CONTENTPATH, u.FIRSTNAME, u.USERID, p.BOARDNAME, p.CAPTION, p.PINID, t.TAG, AVG(pr.RATING) as RATING " +
			"FROM PIN p, CONTENT c, USERS u, CONTENTTAG ct, TAG t, PINRATING pr " +
			"WHERE p.USERID=" + buserID + " AND p.CONTENTID = c.CONTENTID AND p.BOARDNAME='" + boardName +
			"' AND u.USERID=" +buserID +
			" AND c.CONTENTID = ct.CONTENTID(+) AND ct.TAGID = t.TAGID(+) AND p.PINID = pr.PINID(+)" +
			" GROUP BY c.CONTENTPATH, u.FIRSTNAME, u.USERID, p.BOARDNAME, p.CAPTION, p.PINID, t.TAG)" +
			" GROUP BY PINID, CONTENTPATH, FIRSTNAME, USERID, BOARDNAME, CAPTION, RATING ORDER BY PINID DESC";
			console.log(query);
			connection.execute(query, [], function(err, cresults){
				if(err) {console.log(err);}
				else{
					console.log(cresults);
					query = "SELECT BOARDNAME FROM BOARD WHERE USERID=" + suserID;
					console.log(query);
				  	connection.execute(query,
				  			[],
				  			function(err, bresults){
				  			if(err) {console.log(err);}
				  			else{
				  		    	res.render('board.ejs',
				  		    			{userID : suserID,  
				  		    			 boards : bresults,
				  		    			 pins: cresults,
				  		    			 boardName: boardName
				  		    			}
				  				  );
				  				connection.close();
				  			}
							   });
				}
			});
		}
	});
};

