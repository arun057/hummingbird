// Total views
//
// Sends total count per interval of time for every
// request made

var Metric = require('../metric');

var totalViews = Object.create(Metric.prototype);

totalViews.name = 'view_totals';
totalViews.initialData = 0;
totalViews.interval = 1000; // ms
totalViews.increment = function(request) {
	if(request.params.IP != "${USER_IP}") {
  		this.data += 1;
  	}
};

module.exports = totalViews;
