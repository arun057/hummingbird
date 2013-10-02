var MongoClient = require('mongodb').MongoClient;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;

ImpressionProvider = function(host, port, db, username, password) {
  console.log("Connecting to: " + db);
  if( host == undefined )
     host = config.host;
  var server = new Server(host, port, {safe: false,  poolSize: 50, auto_reconnect: true, native_parser:true});
  var client = new MongoClient(server);
  this.db = client.db(db);
  client.open(function(error, client){
     this.db = client.db(db);
     //authenticate
     this.db.authenticate( username, password, function(error, result){
  	 	if( error ) console.log("Connection not established due to authentication: " + error);
  	 });
  });
  console.log("Connection established: " + db);
};


ImpressionProvider.prototype.getCollection= function(sr, callback) {
  if( sr == "AN" ) {
	  this.db.collection('impressions-appnexus', function(error, impression_collection) {
	    if( error ) callback(error);
	    else callback(null, impression_collection);
	  });
	}
   else if( sr == "DFP" ) {
	  this.db.collection('impressions-dfp', function(error, impression_collection) {
	    if( error ) callback(error);
	    else callback(null, impression_collection);
	  });
	}
   else {
   	  this.db.collection('impressions', function(error, impression_collection) {
	    if( error ) callback(error);
	    else callback(null, impression_collection);
	  });
	}
};

//find all impressions
ImpressionProvider.prototype.findAll = function(callback) {
    this.getCollection(function(error, impression_collection) {
      if( error ) callback(error);
      else {
        impression_collection.find().toArray(function(error, results) {
          if( error ) callback(error);
          else callback(null, results);
        });
      }
    });
};

//find all impressions
ImpressionProvider.prototype.getMinute = function(callback) {
    this.getCollection('impressions', function(error, impression_collection) {
    	if( error ) callback(error);
      	else {
    			impression_collection.aggregate(
                  { $group: {
				        _id: {
				            y: { '$year': '$created_at' },
				            m: { '$month': '$created_at' },
				            d: { '$dayOfMonth': '$created_at' },
				            h: { '$hour': '$created_at' },
				            i: { '$minute': '$created_at' },
				        },
				        count: { $sum : 1 }}},
				        function(error, results) {
				        	//console.log("In here: " + JSON.stringify(results));
      						JSON.stringify(results);
				});
		  }
    });
};

//save new impression
ImpressionProvider.prototype.save = function(impressions, callback) {
	if(impressions.SR == "NewCollection"){
		this.getCollection("DFP", function(error, impression_collection) {
	      if( error ) {
	        callback(error);
	        console.log(" Get Collection failed ");
	      }
	      else {
	        if( typeof(impressions.length)=="undefined")
	          impressions = [impressions];
	
	        for( var i =0;i< impressions.length;i++ ) {
	          impression = impressions[i];
	          impression.created_at = new Date();
	        }
	
	        impression_collection.insert(impressions, function(error, doc) {
	          if(error){
	            console.log("Insert ERROR!!!!!: "+ +JSON.stringify(error));
	           }
	          callback(null, impressions);
	        });
	      }
	    });
	}
	else{
		this.getCollection("impressions", function(error, impression_collection) {
	      if( error ) {
	        callback(error);
	        console.log(" Get Collection failed ");
	      }
	      else {
	        if( typeof(impressions.length)=="undefined")
	          impressions = [impressions];
	
	        for( var i =0;i< impressions.length;i++ ) {
	          impression = impressions[i];
	          impression.created_at = new Date();
	        }
	
	        impression_collection.insert(impressions, function(error, doc) {
	          if(error){
	            console.log("Insert ERROR!!!!!: "+ +JSON.stringify(error));
	           }
	          callback(null, impressions);
	        });
	      }
	    });
	}  
};

exports.ImpressionProvider = ImpressionProvider;