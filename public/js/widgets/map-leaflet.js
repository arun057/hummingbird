$.fn.hummingbirdMap = function(socket, options) {
  if(this.length == 0) { return; }

  this.each(function() {
    new Hummingbird.Map($(this), socket, options);
  });

  return this;
};

if(!Hummingbird) { var Hummingbird = {}; }

Hummingbird.Map = function(element, socket, options) {
	  this.element = element;
	  this.socket = socket;
	
	  var defaults = {
	    averageOver: 1, // second
	    ratePerSecond: 2,
	    decimalPlaces: 0,
	    maxPlaces: 100,
	    defaultEvent: "Others"
	  };
	
	  this.options = $.extend(defaults, options);
	
	  this.defaultZoom = $(window).height() > 760 ? 5 : 4;
	
	  var zoomFactor = Math.round(Math.log(window.devicePixelRatio || 1) / Math.LN2);
  
	  var color = new L.TileLayer('http://{s}.tiles.mapbox.com/v3/placeiq.map-8v9ayqgr/{z}/{x}/{y}.png', {minZoom: 4, maxZoom: 18});
	  var grey = new L.TileLayer('http://{s}.tiles.mapbox.com/v3/placeiq.map-8kxlh0ef/{z}/{x}/{y}.png', {minZoom: 4, maxZoom: 18});
	  var satellite = new L.TileLayer('http://{s}.tiles.mapbox.com/v3/placeiq.map-trgmcjhu/{z}/{x}/{y}.png', {minZoom: 4, maxZoom: 18});
		
	  var baseMaps = {
			"Satellite": satellite,
		    "Color": color,
		    "Grey": grey
	  };
		  	
	  this.map = new L.Map('map_container', {
		  layers: [color], 
		  center: new L.LatLng(39.833333, -98.583333), 
		  zoom: [zoomFactor], 
		  minZoom: 4,  
		  maxZoom: 18 
	  });
    
      this.key = function(d) { return [d.latitude, d.longitude, d.type].join(','); };
	  this.data = [];
	  this.eventTypes = {};
	  
	  /*var svg = d3.select(this.map.getPanes().overlayPane).append("svg.map");
	  this.layer = svg.append("g")*/
	  /* Initialize the SVG layer */
	  this.map._initPathRoot();
	  this.layer= d3.select(this.map.getPanes().overlayPane).select("svg");
	  
	  new L.Control.GeoSearch({
        provider: new L.GeoSearch.Provider.OpenStreetMap({
        }),
        zoomLevel: 13,
      }).addTo(this.map);
    
	  this.transform = function(d) {
	    d = this.map.latLngToLayerPoint(new L.LatLng(d.latitude, d.longitude));
	    return "translate(" + Math.floor(d.x) + "," + Math.floor(d.y) + ")";
	  };
	
	  this.map.on("move", (function() {
	    this.layer.selectAll("g").attr("transform", this.transform.bind(this));
	  }).bind(this));
	
	  this.map.on("resize", (function() {
	    this.layer.selectAll("g").attr("transform", this.transform.bind(this));
	  }).bind(this));
	
	  this.legend = $("<div class='legend'></div>");
	  this.element.append(this.legend);
	
	  this.initialize(options);
};


Hummingbird.Map.prototype = new Hummingbird.Base();

$.extend(Hummingbird.Map.prototype, {
  name: "map",

  onMessage: function(value, average) {
    
    if(value && value.length > 0) {
      var self = this;

      for(var i in value) {
        var geo = value[i];

        if(typeof(geo.latitude) == "undefined") { continue; }
        if( typeof(geo.LI) == "undefined" || !geo.LI || geo.CC == "" ) { continue; }
        else
        	geo.label = geo.LI;
        	
        if(geo.event == "DFP" && dfp_pt.indexOf(geo.PT) == -1)	{
			dfp_pt.push(geo.PT);
		}
		else if(geo.event == "AN" && dfp_pt.indexOf(geo.PT) == -1)	{
			an_pt.push(geo.PT);
		}
		
		//Filters on dashboard
		if(document.getElementById('URL_AP').value != "ALL"){
			if(document.getElementById('URL_AP').value != geo.event){
				break;
			}
			else if(document.getElementById('URL_PT').value != "ALL"){
				if(document.getElementById('URL_PT').value != geo.PT){
					break;
				}
			}
		}

        // Remove duplicates
        for(var i = 0, len = this.data.length; i < len; i++) {
          if(this.key(geo) == this.key(this.data[i])) {
            this.data.splice(i, 1);
            break;
          }
        }

        this.data.push(geo);

        if(this.data.length > this.options.maxPlaces) {
          this.data.shift();
        }

        if(!this.pageIsVisible()) {
          // Don't render anything, but remove the object from this.data after 5s
          setTimeout(function() {
            if(!self.pageIsVisible()) {
              for(var i = 0, len = self.data.length; i < len; i++) {
                if(self.data[i] && self.key(geo) == self.key(self.data[i])) {
                  self.data.splice(i, 1);
                }
              }
            }
          }, 5000);

          return;
        }

        var elements = this.layer.selectAll("g").data(this.data, this.key);
        elements.enter()
          .append("svg:g")
          .attr("class", function(d) {
            var event = d.event || self.options.defaultEvent;
            self.addToLegend(event);
            return event;
          })
          .attr("transform", this.transform.bind(this))
          .call(
            function(newElement) {
              newElement.append("svg:circle")
                .classed("radius", true)
                .attr("r", 20)
                .transition()
                .ease("exp")
                .delay(1000)
                .duration(1000)
                .attr("r", 3);

              newElement.append("svg:circle")
                .classed("point", true)
                .transition()
                .attr("r", 4);

              newElement.append("path")
                .classed("label", true)
                .attr("transform", "scale(0.8) translate(0, 10)")
                .transition()
                .attr("d", function(d) { return Hummingbird.Map.bubble(d.label.length * 5 + 15, 12); })
                .attr("transform", "scale(1) translate(0, -5)")

              newElement.append("text")
                .classed("label", true)
                .attr("transform", "scale(0.8) translate(0, 2)")
                .transition()
                .attr("transform", "scale(1) translate(0, -13)")
                .text(function(d) { return d.label; });
              })
          .transition()
          .delay(2000)
          .attr("to_remove", (function(d) {
            for(var i = 0, len = this.data.length; i < len; i++) {
              if(this.key(d) == this.key(this.data[i])) {
                this.data.splice(i, 1);
                break;
              }
            }
          }).bind(this))
          .attr("transform", (function(d) { return this.transform(d) + " scale(0)" }).bind(this))
          .remove();

        elements.exit()
          .transition()
          .attr("transform", (function(d) { return this.transform(d) + " scale(0)" }).bind(this))
          .remove();

      }
    }
  },

  addToLegend: function(type) {
    if(!this.eventTypes[type]) {
      this.eventTypes[type] = true;

      $("<div><span></span></div>").addClass(type).append(type).appendTo(this.legend);
    }
  }

});

Hummingbird.Map.bubble = function(textWidth, textHeight, angle, notch, direction) {
    var bg;

    if (textWidth == null) textWidth = 200;
    if (textHeight == null) textHeight = 152;
    if (direction == null) direction = -1;
    if (angle == null) angle = 3;
    if (notch == null) notch = 4;

    var d = direction;

    var l = function(x, y) {
      return " l " + x + ", " + y;
    }

    var a = function (rx, ry, direction, x, y) {
      var sweep = (direction == -1) ? 1 : 0;
      return " a " + rx + ", " + ry + ", 0, 0, " + sweep + ", " + x + ", " + y;
    }

    // Starts out at the bottom point; uses relative line segments
    bg = "M0,0";
    bg += l(-1 * notch, d * notch);
    bg += l((textWidth - notch - angle) / -2, 0);
    bg += a(angle, angle, d, -1 * angle, d * angle);
    bg += l(0, d * (textHeight - angle));
    bg += a(angle, angle, d, angle, d * angle);
    bg += l(textWidth - angle + notch, 0);
    bg += a(angle, angle, d, angle, -1 * d * angle);
    bg += l(0, -1 * d * (textHeight - angle));
    bg += a(angle, angle, d, -1 * angle, -1 * d *  angle);
    bg += l((textWidth - notch - angle) / -2, 0);
    bg += l(-1 * notch, -1 * d * notch);
    bg += "Z"
    return bg;
  }
