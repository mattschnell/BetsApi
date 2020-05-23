/* 	Node API

	Author: Louis Murerwa, Gregory Macharia, Dartmouth CS61, Spring 2020
	Add config.js file to root directory
	Run on localhost
	To run: node api.js
*/

var express=require('express');
let mysql = require('mysql');
//const bodyParser = require('body-parser'); //allows us to get passed in api calls easily
var app=express();
var bcrypt = require('bcrypt');
const saltRounds = 10;

// get config
var env = process.argv[2] || 'local'; //use localhost if enviroment not specified
var config = require('./config')[env]; //read credentials from config.js
var bodyParser = require('body-parser');
app.use(bodyParser.json());

//Database connection
app.use(function(req, res, next){
	global.connection = mysql.createConnection({
		host     : config.database.host,
		user     : config.database.user,
		password : config.database.password,
		database : config.database.schema
	});
	connection.connect();
	next();
});

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

// set up router
var router = express.Router();

// log request types to server console
router.use(function (req,res,next) {
	console.log("/" + req.method);
	next();
});

// set up routing
// calls should be made to /api/restaurants with GET/PUT/POST/DELETE verbs
// you can test GETs with a browser using URL http://localhost:3000/api/restaurants or http://localhost:3000/api/restaurants/30075445
// recommend Postman app for testing other verbs, find it at https://www.postman.com/






// start server running on port 3000 (or whatever is set in env)
app.use(express.static(__dirname + '/'));
app.use("/",router);
app.set( 'port', ( process.env.PORT || config.port || 3000 ));

app.listen(app.get( 'port' ), function() {
	console.log( 'Node server is running on port ' + app.get( 'port' ));
	console.log( 'Environment is ' + env);
});