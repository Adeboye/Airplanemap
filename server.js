var http = require('http');

var fs = require('fs');

var path = require('path');

var mime = require('mime');

var mssql = require("mssql");
var index;
var lastupdate = new Date();
var lastupdated = lastupdate.setYear(2000);
var connection;
var myresult;
var myresult2;


//var cache = {};

var server = http.createServer(function(request, response) {
	var filePath = false;

	if (request.url == '/') 
	{
		filePath = 'public/airplanemap.html';
	}
    else 
    {
		filePath = 'public' + request.url;
	}

	var absPath = './' + filePath;
	serveStatic(response, absPath);
}).listen(3000, function() {
	console.log("Server listening on port 3000");
})

var io = require('socket.io').listen(server);


var config = {
	user: 'fydpuser',
	password: 'fydp1234',
	server: 'NIKHIL\\FYDP',
	database: 'master',

	options: {
		// trustedConnection : false,
		encrypt : false
	}
};

io.sockets.on('connection', function (socket) {
 	console.log('Socket connection handling established');
    //while(true){//look for a cleaner way to constantly poll the database infinitely
    //console.log('Inside the loop');
    connection = new mssql.Connection(config);
    console.log('New SQL connection');

    connection.connect(function (err) {
		if(err) {
			console.error('error connecting' + err.stack);
			return;
		}
		else{
			console.log('Database is working');
		}

		var request = new mssql.Request(connection);
    	airplanemapinit(request, socket);
    	var interval = setInterval(function(){checkupdate(request, socket);}, 4000);

    	socket.on('disconnect',function (socket) {
    		console.log('CLEaring the interval');
    		clearInterval(interval);
    	})
    });
    
    socket.on('disconnect', function(socket){
       connection.close();
       console.log('got disconnected');
    })

    socket.on('error', function(err) {
    	if(err.description) throw err.description;
    	else throw err;
    });
});

function handler (req,res) {
	fs.readFile(__dirname + '/airplanemap.html',
	function (err, data) {
		if(err) {
			res.writeHead(500);
			return res.end('Error loading airplanemap.html');
			console.log(err.stack);
		}

		res.writeHead(200);
		res.end(data);
	});
}

var airplanemapinit = function (request, socket) {
	console.log('i am in init');
	console.log(request);
	request.query('select * from Passenger_Information', function (err, results) {
	    if(results.length > 0) {
	    	for(var i = 0; i < results.length; i++)	{
	    		myresult2 = results[i];
	    		console.log(myresult2['FirstName']);
	    		console.log(results.length);
	    		socket.emit('update', results[i]);
	    	}
	    }
	    else {
	    	console.log('No data in table');
	    	return;
	    }	
	})
}

function checkupdate(request, socket) {
	   request.query('SELECT [Seat_ID],[Number_of_Baggage],[NumOfClaimBag],[TS] FROM [master].[dbo].[Passenger_Information] WHERE TS = (select max(TS) from [master].[dbo].[Passenger_Information])', function (err, results) {
	   		console.log('I made it here');
            
	    	if(err) {
				console.error(err.stack);
				return;
			}
	        
	        index = results.length -1;
	        //console.log(results.length);
	        myresult = results[0];
	       
	        //console.log('last update date ' + lastupdated);
	       // console.log('current date' + myresult['TS']);

	        if(results.length > 0) {
		    	if(myresult['TS'] > lastupdated) {
		    	  //console.log('My result data ' + myresult['FirstName']);
	              socket.emit('newdata', myresult);
	              console.log('just emitted data');
	              lastupdated = myresult['TS'];
		    	}
		    	else {
		    		console.log('no data');
		    		return;
		    	}
			}
			else {
				console.log('no results');
				return;
			}
		})
}



function send404 (response) {
	 response.writeHead(404, {'Content-Type': 'text/plain'});
	 response.write('Error 404: resource not found');
	 response.end();
}

function sendFile (response, filePath, fileContents) {
	response.writeHead(
		200,
		{"Content-Type": mime.lookup(path.basename(filePath))}
		);
	response.end(fileContents);
}

function serveStatic(response, absPath) {
		fs.exists(absPath, function (exists) {
			if (exists) {
				fs.readFile(absPath, function (err, data) {
					if(err) {
						send404(response);
					} else {
					  sendFile(response, absPath, data);
					}
				});
			} else {
				send404(response);
			}
		});
}
