var pg = require ('pg');
var amqp = require('amqplib/callback_api');
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var url = 'mongodb://allapurnima:ice12345@ds151909.mlab.com:51909/iceteam';
pg.defaults.ssl = true;
var pl;
var express = require('express');

var app = express();
const PORT = process.env.PORT || 6000;

app.listen(PORT, () => {
    console.log(`Our app is running on port ${ PORT }`);
});

pg.connect(process.env.DATABASE_URL, function(err, client) {
    if(err) {
        console.log(err);
    }
    client.on('notification', function(msg) {
        if (msg.name === 'notification' && msg.channel === 'watchers') {
            pl = JSON.parse(msg.payload);
			
            console.log("*========*");
            Object.keys(pl).forEach(function (key) {
                console.log(key, pl[key]);
				//y=JSON.stringify(key,pl[key]);
				//y=JSON.parse(msg.payload);
			
				
 
				// insert into mlab database
				var insertDocument = function(db, callback) {
				   db.collection('Microservice').insertOne( {
					  "event":{
						  
						  key : pl[key]
					  }
				   }, function(err, result) {
					assert.equal(err, null);
					console.log("Inserted a json object into mlab 'Microservice' collection.");
					callback();
				  });
				};

				MongoClient.connect(url, function(err, db) {
				  assert.equal(null, err);
				  insertDocument(db, function() {
					  db.close();
				  });
				});
            });
			 amqp.connect('amqp://uzoryisw:YoZBZlxwbUzyUTLe5nkxdBMBTtTfUxqu@salamander.rmq.cloudamqp.com/uzoryisw', function(err, conn) {
  conn.createChannel(function(err, ch) {
    var q = 'SalesforceQ';
	//var p1;
	  //var x=JSON.parse(msg.payload);
       var msg1 ={};
       msg1=JSON.parse(msg.payload);
	   msg2=JSON.stringify(msg1);
    ch.assertQueue(q, {durable: false});
    // Note: on Node 6 Buffer.from(msg) should be used ..
    ch.sendToQueue(q, new Buffer(msg2));
    console.log(" [x] Sent %s", msg2);
  });
  //setTimeout(function() { conn.close(); process.exit(0) }, 500);
});
            console.log("-========-");
        }
    });
    client.query("LISTEN watchers");
});

