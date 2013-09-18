// Demo mode
//
// Replays a sample traffic log to give an idea of what real traffic
// would look like

var fs     = require('fs');
var Metric = require('./metric');

exports.run = function() {
  fs.readFile(__dirname + "/../data/sample_traffic.log", function(err, logFile) {
    if(err) { throw err; }

    var lines = logFile.toString().split("\n");

    function submitLine(lines) {
      var line = lines[0];
      if(!line) {
        // start over
        return submitLine(logFile.toString().split("\n"));
      }

      var ip = line.split(",")[3];
      var ip = ip.split(":")[1];
      var ip = ip.split('"')[1];
      //console.log(ip);
      var req = { params: {ip: ip}, headers: { referer: "/" } };
      if(Math.random() * 8 >= 7) { req.params.AP = "AN"; }
      if(Math.random() * 8 <= 7) { req.params.AP = "DFP"; }

      Metric.insert(req);
      setTimeout(function() {
        submitLine(lines.slice(1));
      }, Math.random() * 500);
    }

    submitLine(lines);
  });
};
