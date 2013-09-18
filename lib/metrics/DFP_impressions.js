// Impressions
//
// Emits aggregates per interval for the number of requests
// with a query parameter ?events=impression

var Metric = require('../metric');

var DFP_impressions = Object.create(Metric.prototype);

DFP_impressions.name = 'DFP_impressions';
DFP_impressions.initialData = 0;
DFP_impressions.interval = 50; // ms
DFP_impressions.increment = function(request) {
  if(request.params.AP != "DFP") {
    this.data += 1;
  }
};

module.exports = DFP_impressions;