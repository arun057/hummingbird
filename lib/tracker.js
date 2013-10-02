var http = require('http');
var url = require('url');
var dgram = require('dgram');
var Metric = require('./metric');
var pixel = require('./pixel');
//var history = require('./history');
var impressiondb = require('./mongodb').ImpressionProvider;
var impressionProvider = new ImpressionProvider(config.mongo_host, config.mongo_port, config.mongo_db, config.mongo_username, config.mongo_password );

var pixelHandler = function(req, res) {
  console.log(" - " + req.url);
  res.writeHead(200, pixel.headers);
  res.end(pixel.data);

  req.params = url.parse(req.url, true).query;
  //console.log(JSON.stringify(req.params));
  if(req.params.IP != "${USER_IP}" && (req.url.match(/^\/tracking_pixel/))) {
	  Metric.insert(req);
	  
	  impressionProvider.save({
	  	    PT: req.params.PT,
	        CI: req.params.CI,
	        LI: req.params.LI,
	        IP: req.params.IP,
	        OI: req.params.OI,
	        LI: req.params.LI,
	        PI: req.params.PI,
	        LT: req.params.LA,
	        LG: req.params.LO,
	        AI: req.params.AI,
	        DM: req.params.DM,
	        DS: req.params.DS,
	        DI: req.params.DI,
	        MM: req.params.MM,
	        MO: req.params.MO,
	        AP: req.params.AP,
	        UM: req.params.UM,
	        UO: req.params.UO,
	        RI: req.params.RI,
	        AU: req.params.AU,
	        CC: req.params.CC
	    }, function( error, docs) {
	        if(error)
	           console.log("Error on insert: " + JSON.stringify(error));
	    });
	}
};

exports.listen = function(server, address) {
  console.log("In tracker --- listener");

  if(typeof(server) === "number") {
    var port = server;
    http.createServer(pixelHandler).listen(port, address);
  } else {
    // Attach to an existing server
    var oldListeners = server.listeners('request');
    server.removeAllListeners('request');

    server.on('request', function(req, res) {
      if(req.url.match(/^\/tracking_pixel/)) {
        console.log("Request came in");
        pixelHandler(req, res);
      } else {
        for (var i = 0, l = oldListeners.length; i < l; i++) {
          oldListeners[i].call(server, req, res);
        }
      }
    });
  }
};


exports.listenUdp = function(port, address) {
  var server = dgram.createSocket("udp4");

  server.on("message", function (message, rinfo) {
    var data;
    try {
      data = JSON.parse(message.toString());
    } catch(e) {
      return console.log("Error parsing UDP message: " + e.message);
    }

    Metric.insert({ip: data.ip, params: data});
  });

  server.on("listening", function () {
    var address = server.address();
    console.log("Udp server listening " +
        address.address + ":" + address.port);
  });

  server.bind(port, address);

};
