var mysql = require("mysql");
var socketio = require('socket.io');
var io;
var index;
var lastupdate = new Date();
var connection;
var myresult;
var a;


exports.listen = function (server) {

        connection = mysql.createConnection({
		host : 'localhost',
		user : 'root',
		password : 'uofwaterloo',
		database : 'airplanemap'
	});

	connection.connect(function (err) {
		if(err) {
			console.error('error connecting' + err.stack);
			return;
		}
		//TODO - Reestablish connection on error or check for error event somehow
	});

	io = socketio.listen(server);
    console.log('success');

    io.sockets.on('connection', function(socket) {
    	console.log('Socket connection handling established');
    	//while(true){//look for a cleaner way to constantly poll the database infinitely
    		//console.log('Inside the loop');
    	   setInterval(function(){checkupdate(socket);}, 4000);
    	   socket.on('disconnect', function(socket){
    	   	 console.log('got disconnected');
    	   })
    	//}
    })
   
	function checkupdate(socket) {
	   connection.query('SELECT name, baggageno, destination, seatno, ts FROM map where ts = (select max(ts) from map)', function (err, results, fields) {
	   		console.log('I made it here');
	    	if(err) {
				console.error(err.stack);
				return;
			}
	        
	        index = results.length -1;
	        console.log(results.length);
	        myresult = results[0];

	        if(results.length > 0) {
		    	if(myresult['ts'] > lastupdate) {
		    	  console.log('My result data ' + myresult['name']);
		    	  var data = JSON.parse(myresult);
	              socket.emit('newdata', data);
	              lastupdate = myresult['ts'];
		    	}
		    	else {
		    		console.log('no data');
		    		return;
		    	}
			}
			else {
				console.log('no results');
			}
		})
	}
}