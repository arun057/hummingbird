// Locations
// from: https://github.com/Stackato-Apps/hummingbird/blob/master/lib/metrics/locations.js
// Sends individual requests, geolocated using ip address

var util   = require('util');
var geoip  = require('geoip');
var path   = require('path');
var Metric = require('../metric');
var http   = require('http');
var zlib   = require('zlib');
var fs     = require('fs');


var GEO_IP_DOWNLOAD = "http://geolite.maxmind.com/download/geoip/database/GeoLiteCity.dat.gz"

var cities;

var locations = Object.create(Metric.prototype);

locations.name = 'locations';
locations.initialData = [];
locations.interval = 100; // ms
locations.ignoreOnEmpty = true;

locations.increment = function(request) {
  var remoteAddress = this.ipFor(request);

  var location = cities.lookupSync(remoteAddress);

  if(location && location.latitude) {
    this.data.push({
      city:      location.city,
      region:    location.region,
      country:   location.country_code,
      CC:        request.params.CC,
      latitude:  request.params.LA,
      longitude: request.params.LO,
      event:     request.params.AP
    });
  }
};

locations.ipFor = function(request) {
  var ip;
  if(request.headers && request.headers['x-forwarded-for']) {
    ip = request.headers['x-forwarded-for'].split(', ').shift();
  } else if(request.connection && request.connection.remoteAddress) {
    ip = request.connection.remoteAddress;
  } else if(request.params && request.params.ip) {
    ip = request.params.ip;
  } else {
    ip = "127.0.0.1";
  }

  if(ip == "127.0.0.1") {
    //return "8.8.8.8"; // Mountain view, can be geolocated
    return "24.93.98.172";
  } else {
    return ip;
  }
};

// Try to load the binary geoip database.  If it is not available,
// try to download it from MaxMind and unzip it.
locations.load = function(callback) {
  var cityPath = path.normalize(__dirname + '/../../GeoLiteCity.dat');

  function setupCities() {
    try {
      cities = new geoip.City(cityPath);
      return callback(null);
    } catch(e) {
      return callback(new Error("Couldn't load geoip database " + cityPath));
    }
  }

  fs.stat(cityPath, function(notDownloaded) {
    if(notDownloaded) {
      console.log("Downloading GeoLiteCity.dat to " + cityPath);
      locations.downloadGzipData(GEO_IP_DOWNLOAD, cityPath, function(err) {
        if(err) { return callback(err); }

        setupCities();
      });
    } else {
      setupCities();
    }
  });
};

locations.downloadGzipData = function(url, path, callback) {
  http.get(url, function(res) {
    if(res.statusCode != "200") {
      return callback(new Error("HTTP error: " + res.statusCode));
    }

    var gunzip = zlib.createGunzip();
    var out = fs.createWriteStream(path);

    res.pipe(gunzip).pipe(out);

    gunzip.on('end', function(err) {
      callback(err);
    });
  });
};

module.exports = locations;