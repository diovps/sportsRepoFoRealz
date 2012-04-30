var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var GameSchema = new Schema({
	type: String,
	numslots: Number,
	numplayers: String,
	address: String,
	time: String,
});

var Game = mongoose.model('Game',GameSchema);

module.exports = Game;
	
