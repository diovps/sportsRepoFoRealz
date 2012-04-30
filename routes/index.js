
/*
 * GET home page.
 */
var Game = require('../models/game.js');

exports.index = function(req, res){
   
   var sortTime = function(a,b){
	return a["numplayers"] - b["numplayers"];
   }

   Game.find({}, function(err,result){
	if(!err)
	    var ObjectIds = new Array();
	    var playerArray = result.sort(sortTime);
	    var count = 0;
	   
            playerArray.forEach(function(element){
		 ObjectIds[count] = element["_id"];
		 count++;
	    });
	     
	    res.render('index', { title: 'Express', result: result,ObjectIds: ObjectIds})
   });
   //res.render('index', { title: 'Express', result: 'Error connecting to database'})
};


