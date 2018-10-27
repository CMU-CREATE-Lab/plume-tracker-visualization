"use strict";

var map;
var canvasLayer;
var context;
var contextScale;
var resolutionScale;
var mapProjection;
var projectionScale = 2000;
var y_scale;

function initMap(div) {
  // Initialize Google Map
  resolutionScale = window.devicePixelRatio || 1;
  
  var mapOptions = {
    keyboardShortcuts: false,
    scaleControl: true,
    zoom: 13,
    center: new google.maps.LatLng(40.484963, -80.047903),
    styles: [
  {
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#000000"
      }
    ]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#777777"
      }
    ]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#000000"
      }
    ]
  },
  {
    "featureType": "administrative",
    "elementType": "labels.icon",
    "stylers": [
      {
        "color": "#5d5d5d"
      },
      {
        "visibility": "on"
      }
    ]
  },
  {
    "featureType": "administrative.country",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "color": "#4b6878"
      }
    ]
  },
  {
    "featureType": "administrative.land_parcel",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "color": "#545454"
      },
      {
        "weight": 0.5
      }
    ]
  },
  {
    "featureType": "administrative.land_parcel",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#64779e"
      }
    ]
  },
  {
    "featureType": "administrative.province",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "color": "#7a7a7a"
      }
    ]
  },
  {
    "featureType": "landscape.man_made",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "color": "#959595"
      },
      {
        "weight": 1
      }
    ]
  },
  {
    "featureType": "poi",
    "stylers": [
      {
        "visibility": "simplified"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#121212"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "labels.icon",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#939393"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#1d2c4d"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry.fill",
    "stylers": [
      {
        "color": "#252525"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#5d5d5d"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#1f1f1f"
      }
    ]
  },
  {
    "featureType": "road.arterial",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#585858"
      },
      {
        "weight": 1
      }
    ]
  },
  {
    "featureType": "road.arterial",
    "elementType": "labels.icon",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#535353"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "weight": 0.5
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "labels.icon",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#929292"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#292929"
      }
    ]
  },
  {
    "featureType": "transit",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "transit",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#98a5be"
      }
    ]
  },
  {
    "featureType": "transit",
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#1d2c4d"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#0e1626"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#4e6d70"
      }
    ]
  }
]

  };
  map = new google.maps.Map(document.getElementById(div), mapOptions);

  // initialize the canvasLayer
  var canvasLayerOptions = {
    map: map,
    animate: true,
    updateHandler: repaintCanvasLayer,
    resolutionScale: resolutionScale
  };
  canvasLayer = new CanvasLayer(canvasLayerOptions);
  context = canvasLayer.canvas.getContext('2d');

  //window.addEventListener('resize', function () { google.maps.event.trigger(map, 'resize'); }, false);
}

function setupCanvasLayerProjection() {
  var canvasWidth = canvasLayer.canvas.width;
  var canvasHeight = canvasLayer.canvas.height;
  context.setTransform(1, 0, 0, 1, 0, 0);
  context.clearRect(0, 0, canvasWidth, canvasHeight);

  /* We need to scale and translate the map for current view.
   * see https://developers.google.com/maps/documentation/javascript/maptypes#MapCoordinates
   */
  mapProjection = map.getProjection();
  if (!mapProjection) return;
  /**
   * Clear transformation from last update by setting to identity matrix.
   * Could use context.resetTransform(), but most browsers don't support
   * it yet.
   */

  // scale is just 2^zoom
  // If canvasLayer is scaled (with resolutionScale), we need to scale by
  // the same amount to account for the larger canvas.
  contextScale = Math.pow(2, map.zoom) * resolutionScale / projectionScale;
  context.scale(contextScale, contextScale);

  /* If the map was not translated, the topLeft corner would be 0,0 in
   * world coordinates. Our translation is just the vector from the
   * world coordinate of the topLeft corder to 0,0.
   */
  var offset = mapProjection.fromLatLngToPoint(canvasLayer.getTopLeft());
  context.translate(-offset.x * projectionScale, -offset.y * projectionScale);
  
}


function paintPM25_2(site, time) {
  var rectLatLng = new google.maps.LatLng(site[0], site[1]);
  var worldPoint = mapProjection.fromLatLngToPoint(rectLatLng);
  var x = worldPoint.x * projectionScale;
  var y = worldPoint.y * projectionScale;

  var bar_width = 5;
  var bar_scale = 0.5;
  context.font = '4px Arial';

  // How many pixels per mile?
  var offset1mile = mapProjection.fromLatLngToPoint(new google.maps.LatLng(site[0] + 0.014457067, site[1]));
  var unitsPerMile = 1000 * (worldPoint.y - offset1mile.y);

  y_scale = site.flip_y ? -1 : 1;

  var color;
  var pm25 = site[time+2];
  var styleColor = ""
  if(pm25 < 15){
     color = interpolate([51, 204, 51], [255,255,51], (pm25)/15)
  } else if(pm25 < 40){
     styleColor = 'rgb(255,255,51)'
     color = interpolate([255,255,51],[255, 153,51],(pm25-15)/25)

  } else if(pm25 < 65) {
     styleColor = 'rgb(255, 153,51)'
     color = interpolate([255,153,58],[255, 58,58],(pm25-40)/25)

  } else if(pm25 < 150) {
     styleColor = 'rgb(255,58,58)'
     color = interpolate([255,58,58],[153, 0,56],(pm25-65)/85)
  } else if(pm25 > 200){
     styleColor = 'rgb(153,0,56)'
  }
  styleColor = 'rgb(' + color[0] + ',' + color[1] + "," +  color[2] + ')'
 console.log(styleColor); 
 if(pm25 > 0){

  context.style = styleColor;
  context.fillStyle = styleColor
  //context.strokeStyle = "black"
  
  //console.log("lat:" + site[0] + "long:" + site[1] + "so2:" + pm25) 
  context.beginPath();
  context.arc(x, y, 2 + (Math.sqrt(2*pm25)), 0, 2 * Math.PI, false);
  context.fill();
  timeSlider.animate()
  }
}
function interpolate(color1, color2, factor) {
  if (arguments.length < 3) { factor = 0.5; }
  var result = color1.slice();
  for (var i=0;i<3;i++) {
    result[i] = Math.round(result[i] + factor*(color2[i]-color1[i]));
  }
  return result;
};

function paintPM25(site, time) {
  var rectLatLng = new google.maps.LatLng(site[0], site[1]);
  var worldPoint = mapProjection.fromLatLngToPoint(rectLatLng);
  var x = worldPoint.x * projectionScale;
  var y = worldPoint.y * projectionScale;
	
  var bar_width = 5;
  var bar_scale = 0.5;
  context.font = '4px Arial';

  // How many pixels per mile?
  var offset1mile = mapProjection.fromLatLngToPoint(new google.maps.LatLng(site[0] + 0.014457067, site[1]));
  var unitsPerMile = 1000 * (worldPoint.y - offset1mile.y);

  y_scale = site.flip_y ? -1 : 1;

  var color = [0, 0, 0];
  var pm25 = site[time+2];
  var styleColor; 
  if(pm25 < 15){
     color = interpolate([51, 204, 51], [255,255,51], (pm25)/15)
  } else if(pm25 < 40){
     styleColor = 'rgb(255,255,51)' 
     color = interpolate([255,255,51],[255, 153,51],(pm25-15)/25)

  } else if(pm25 < 65) {
     color = interpolate([255,153,51],[255, 58,58],(pm25-40)/25)

  } else if(pm25 < 150) {
     color = interpolate([255,58,58],[153, 0,56],(pm25-65)/85)
  } else if(pm25 > 200){
     styleColor = 'rgb(153,0,56)'  
  }
  styleColor = 'rgb(' + color[0] + ',' + color[1] + "," +  color[2] + ')'
  if(pm25 > 0){

  context.style = styleColor;
  context.fillStyle = styleColor
  //console.log("lat:" + site[0] + "long:" + site[1] + "so2:" + pm25) 
  context.beginPath();
  context.arc(x, y, 2 + (Math.sqrt(2*pm25)), 0, 2 * Math.PI, false);
  context.fill();
  timeSlider.animate()
  }
}


function repaintCanvasLayer() {
  try {
    //console.log('repaint');
    setupCanvasLayerProjection();
    // Date.parse() can only reliably parse RFC2822 or ISO 8601 dates.
    // The result is that parsing the capture time from Time Machine results in undefined.
    // Chrome (unlike FireFox or IE) is more lenient and will parse it correctly though.
    var epochTime = timeSlider.getCurrentTime()

    if(isSO2){ 
    for(var i = 0; i < siteData.length; i++){
		var curDate = new Date((epochTime)); 

		var hours = parseInt(curDate.getHours());
                var offset = (curDate.getMinutes() -(curDate.getMinutes())%5)/5;//0;//((curDate.getMinutes())/5);
                //if(curDate.getMinutes() == 30){
		//    offset = 1

                //}
		var timeIndex = ((hours) * 12)+offset;
                //console.log(siteData[i])		
		paintPM25(siteData[i], timeIndex);

	}
    }
    if(!isSO2){
    for(var i = 0; i < pm25Data.length; i++){
                var curDate = new Date((epochTime));

                var hours = parseInt(curDate.getHours());
                var offset = 0;//((curDate.getMinutes())/5);
                if(curDate.getMinutes() == 30){
                    offset = 1

                }
                var timeIndex = ((hours) * 2)+offset;
                //console.log(siteData[i])              
                paintPM25_2(pm25Data[i], timeIndex);

        }
   }
   
    
  } catch(e) {
    //console.log(e);
  }
}
