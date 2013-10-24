// Demo mode
//
// Replays a sample traffic log to give an idea of what real traffic
// would look like

var fs     = require('fs');
var Metric = require('./metric');

exports.run = function() {
  fs.readFile(__dirname + "/../data/happy_face.log", function(err, logFile) {
    if(err) { throw err; }

    var lines = logFile.toString().split("\n");

    function submitLine(lines) {
      var line = lines[0];
      if(!line) {
        // start over
        return submitLine(logFile.toString().split("\n"));
      }

      /*var ip = line.split(",")[3];
      var ip = ip.split(":")[1];
      var ip = ip.split('"')[1];
      
      var lt = line.split(",")[2];
      var lt = lt.split(":")[1];
      var lt = lt.split('"')[1];
      
      var lg = line.split(",")[15];
      var lg = lg.split(":")[1];
      var lg = lg.split('"')[1];
     
      console.log("IP" + ip);
      console.log("LT" + lt);
      console.log("LG" + lg);
      console.log(ip);
      var req = { params: {ip: ip}, headers: { referer: "/" } };
      req.params.LA=lt;
      req.params.LO=lg;
      req.params.CC="Impression";
      if(Math.random() * 8 >= 7) { req.params.AP = "AN"; }
      if(Math.random() * 8 <= 7) { req.params.AP = "DFP"; }*/
      
      
      var ip = "198.228.200.32";
      var lt = line.split(",")[1];
      var lg = line.split(",")[0];
      var req = { params: {ip: ip}, headers: { referer: "/" } };
      req.params.LA = lt;
      req.params.LO = lg;
      req.params.CC="Impression";
      if(Math.random() * 8 >= 7) { req.params.AP = "AN"; }
      if(Math.random() * 8 <= 7) { req.params.AP = "DFP"; }


      Metric.insert(req);
      setTimeout(function() {
        submitLine(lines.slice(1));
      }, Math.random() * 1000);
    }

    submitLine(lines);
  });
};
