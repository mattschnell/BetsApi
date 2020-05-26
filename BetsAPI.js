/* 	Node API demo
	Author: Tim Pierson, Dartmouth CS61, Spring 2020

	Add config.js file to root directory
	To run: nodemon api.js <local|sunapee>
	App will use the database credentials and port stored in config.js for local or sunapee server
	Recommend Postman app for testing verbs other than GET, find Postman at https://www.postman.com/
*/

var express=require('express');
let mysql = require('mysql');
const bodyParser = require('body-parser'); //allows us to get passed in api calls easily
var app=express();

// get config
var env = process.argv[2] || 'local'; //use localhost if enviroment not specified
var config = require('./config')[env]; //read credentials from config.js


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
router.get("/",function(req,res){
	res.send("Yo!  This my API.  Call it right, or don't call it at all!");
});

// GET - read data from database, return status code 200 if successful
router.get("/api/Bets",function(req,res){
	// get all restaurants (limited to first 10 here), return status code 200
	global.connection.query('SELECT * FROM Bets_sp20.Bets LIMIT 10', function (error, results, fields) {
		if (error) throw error;
		res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
	});
});

router.get("/api/restaurants/:id",function(req,res){
	console.log(req.params.id);
	//read a single restaurant with RestauantID = req.params.id (the :id in the url above), return status code 200 if successful, 404 if not
	global.connection.query('SELECT * FROM nyc_inspections.Restaurants WHERE RestaurantID = ?', [req.params.id],function (error, results, fields) {
		if (error) throw error;
		res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
	});
});

// PUT - UPDATE data in database, make sure to get the ID of the row to update from URL route, return status code 200 if successful
router.put("/api/restaurants/:id",function(req,res){
	console.log(req.body);
	res.send(JSON.stringify({"status": 200, "error": null, "response": "here on a put -- update restaurant with RestaurantID=" + req.params.id}));
});

// POST -- create new bet, return status code 200 if successful
router.post("/api/Bets/:Username/:Password",function(req,res){
	console.log(req.body);
	var adminID = null;
	var password = null;
	var username = null;
	global.connection.query('select Username, Password from Admins where Username = ?', [req.params.Username], function (error, results, fields) {
		if (error) throw error;
		Object.keys(results).forEach(function(key) {
			password = results[key].Password;
			username = results[key].Username;
			});

	global.connection.query('select AdminID from Admins where Username = ?', [req.params.Username], function (error, results, fields) {
			if (error) throw error;
				adminID = results[0].AdminID;

		if (password == null || username == null) {
			res.send(JSON.stringify({"status": 200, "error": null, "response": "Wrong username and password"}));
		}
		else {
			// need to make this a bcrypt.compare() to use the hashed one
			if (req.params.Password == password && username == req.params.Username) {
				global.connection.query('insert into Bets(BetName, BetDescription, ExpiryTime, PayoutRatio, Status, TypeID, CreatedBy, EventID) values (?, ?, ?, ?, ?, ?, ?, ?)', [req.body.BetName, req.body.BetDescription, req.body.ExpiryTime, req.body.PayoutRatio, req.body.Status, req.body.TypeID, adminID, req.body.EventID], function (error, fields) {
					if (error) throw error;
					res.send(JSON.stringify({"status": 201, "erorr": null, "response": "added bet: " + req.body.BetName}));
				});
			}
			else {
				res.send(JSON.stringify({"status": 201, "erorr": null, "response": "Wrong username and password"}));
			}
		}
});
});
});

// POST -- create a new event
router.post("/api/Events/:Username/:Password",function(req,res){
	console.log(req.body);
	var adminID = null;
	var password = null;
	var username = null;
	global.connection.query('select Username, Password from Admins where Username = ?', [req.params.Username], function (error, results, fields) {
		if (error) throw error;
		Object.keys(results).forEach(function(key) {
			password = results[key].Password;
			username = results[key].Username;
			});

	global.connection.query('select AdminID from Admins where Username = ?', [req.params.Username], function (error, results, fields) {
			if (error) throw error;
				adminID = results[0].AdminID;

		if (password == null || username == null) {
			res.send(JSON.stringify({"status": 200, "error": null, "response": "Wrong username and password"}));
		}
		else {
			if (req.params.Password == password && username == req.params.Username) {
				global.connection.query('insert into Events(EventName, EventDescription, StartTime, Status, CategoryID, CreatedBy) values (?, ?, ?, ?, ?, ?)', [req.body.EventName, req.body.EventDescription, req.body.StartTime, req.body.Status, req.body.CategoryID, adminID], function (error, fields) {
					if (error) throw error;
					res.send(JSON.stringify({"status": 201, "erorr": null, "response": "added event: " + req.body.EventName}));
				});
			}
			else {
				res.send(JSON.stringify({"status": 201, "erorr": null, "response": "Wrong username and password"}));
			}
		}
});
});
});


// DELETE -- delete restaurant with RestaurantID of :id, return status code 200 if successful
router.delete("/api/restaurants/:id",function(req,res){
	res.send(JSON.stringify({"status": 200, "error": null, "response": "here on a delete -- remove restaurant with RestaurantID=" + req.params.id}));
});




// start server running on port 3000 (or whatever is set in env)
app.use(express.static(__dirname + '/'));
app.use("/",router);
app.set( 'port', ( process.env.PORT || config.port || 3000 ));

app.listen(app.get( 'port' ), function() {
	console.log( 'Node server is running on port ' + app.get( 'port' ));
	console.log( 'Environment is ' + env);
});
