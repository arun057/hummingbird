// Impressions
//
// Emits aggregates per interval for the number of requests
// with a query parameter ?events=impression

var Metric = require('../metric');

var impressions = Object.create(Metric.prototype);

impressions.name = 'impressions';
impressions.initialData = 0;
impressions.interval = 50; // ms
impressions.increment = function(request) {
  if(request.params.SR != "") {
    this.data += 1;
  }
};

module.exports = impressions;