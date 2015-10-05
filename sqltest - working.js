var mysql = require("mysql");
var index;

var connection = mysql.createConnection({
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

	console.log('connected as id' + connection.threadId);

	/*connection.query('INSERT INTO map SET ?', post, function (err, results){
		if(err){
		console.error(err.stack);
		return;
	    }*/

    connection.query('SELECT name, baggageno, destination, ts FROM map where ts = (select max(ts) from map);', function (err, results, fields) {
    	// body...
    	if(err){
		console.error(err.stack);
		return;
		}
        
        if(results.length > 0){
            index = results.length -1;
            console.log(results.length);
        	var myresult = results[0];
	    	console.log('results ' + myresult['name'] + ' ' + myresult['baggageno'] + ' ' + myresult['destination'] + ' ' + myresult['ts']);
	    	if(Object.prototype.toString.call(myresult['name']) === '[object Date]')
	    	{
	    		console.log('true');
	    	}
	    	else
	    	{
	    		console.log('false');
	    	}
		}
		else
		{
			console.log('no results');
		}
	})
});

