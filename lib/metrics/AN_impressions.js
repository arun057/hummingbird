// Impressions
//
// Emits aggregates per interval for the number of requests
// with a query parameter ?events=impression

var Metric = require('../metric');

var AN_impressions = Object.create(Metric.prototype);

AN_impressions.name = 'AN_impressions';
AN_impressions.initialData = 0;
AN_impressions.interval = 50; // ms
AN_impressions.increment = function(request) {
  if(request.params.AP != "AN") {
    this.data += 1;
  }
};

module.exports = AN_impressions;