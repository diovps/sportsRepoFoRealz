
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes');

var app = module.exports = express.createServer();
//var RedisStore = require('connect-redis')(express);
var mongoose = require('mongoose');
var Game = require('./models/game.js');


if(process.env.VCAP_SERVICES){
  var env = JSON.parse(process.env.VCAP_SERVICES);
  var mongo = env['mongodb-1.8'][0]['credentials'];
}
else{
  var mongo = {
    "hostname":"localhost",
    "port":3000,
    "db":"game_db"
  }
}

var generate_mongo_url = function(obj){
  obj.hostname = (obj.hostname || 'localhost');
  obj.port = (obj.port || 3000);
  obj.db = (obj.db || 'game_db');

  if(obj.username && obj.password){
    return "mongodb://" + obj.username + ":" + obj.password + "@" + obj.hostname + ":" + obj.port + "/" + obj.db;
  }
  else{
    return "mongodb://" + obj.hostname + "/" + obj.db;
  }
}

var mongourl = generate_mongo_url(mongo);

mongoose.connect(String(mongourl));
// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.bodyParser());
  //app.use(express.cookieParser());
  //app.use(express.session({secret : 'supersecretthing'}, {store: new RedisStore()}));
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
  app.get('/',routes.index);
  app.get('/',function(req,res){
    res.sendfile(_dirname+'/index.html');
  });
  
});


app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

app.post('/',function(req,res){
	console.log("Type: " + req.body.game["type"]);
	console.log("Number of Players: " + req.body.game["numplayers"]);
	console.log("Time: " + req.body.game["time"]);
	console.log("Address: " + req.body.game["address"]);
	
	var u = new Game({type : req.body.game['type'],numslots: 0,numplayers: req.body.game["numplayers"],time : req.body.game["time"], address : req.body.game["address"]});
	
	u.save(function(err) {
	
	});
	res.redirect('back');
});

// Routes

app.get('/', routes.index);
var port = (process.env.VMC_APP_PORT || 3000);

app.listen(port);

var io = require("socket.io").listen(app);

if(process.env.VMC_APP_PORT) {
    io.set('transports', [
	 'flashsocket',
	 'htmlfile',
	 'xhr-polling',
	 'jsonp-polling'
     ]);
}


   var sortTime = function(a,b){
        return a["numplayers"] - b["numplayers"];
   }
   
   var ObjectIds = new Array();

   Game.find({}, function(err,result){
        if(!err)
            var playerArray = result.sort(sortTime);
            var count = 0;

            playerArray.forEach(function(element){
                 ObjectIds[count] = element["_id"];
                 count++;
            });
    });

io.sockets.on('connection',function(socket){
	socket.emit("sayhello", {data: ObjectIds});
	socket.on("done",function(data){
	      console.log(data.slots);
	      Game.find({"_id": ObjectIds[data.id]},function(err,result){
	              if(!(result[0]["numslots"] >= result[0]["numplayers"])){
			    result[0]["numslots"]=data.slots;
			    result[0].save();	   
		      }
	      }); 
	}); 
});




