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
    center: new google.maps.LatLng(40.484963, -80.047903)
  };
  map = new google.maps.Map(document.getElementById(div), mapOptions);

  // initialize the canvasLayer
  var canvasLayerOptions = {
    map: map,
    animate: false,
    //updateHandler: repaintCanvasLayer,
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
  console.log("HERERE");
  console.log(mapProjection);
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



function paintPM25(site) {
  console.log(site)
  var rectLatLng = new google.maps.LatLng(site[0], site[1]);
  console.log(site[0], site[1])
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


  // If a site has 2 devices, take the average
  /*var numSites = 2;
  if (siteDouble) {
    var pm25_2 = getData(siteDouble, channel, epochTime);
    if (pm25_2 !== null && isFinite(pm25_2)) {
      if (pm25 === null || !isFinite(pm25)) {
        pm25 = 0;
        numSites -= 1;
      }
      pm25 = Math.round((pm25 + pm25_2) / numSites);
    }
  }*/
  var pm25 = site[5];
  console.log(x, y);
  /*if (site[5] !== null && site[5] !== 0) {
    context.fillStyle = 'rgba(' + "200, 200, 0" + ', 1)';
    context.fillRect(x - bar_width, y, bar_width, -bar_scale * pm25 * y_scale);
    context.strokeStyle = 'black';
    context.lineWidth = 1.0 / contextScale;
    context.strokeRect(x - bar_width, y, bar_width, -bar_scale * pm25 * y_scale);
    context.fillText(pm25, x - bar_width - 0.1, y + y_scale * 2.2 + 1.5);
  }*/


  context.style = 'black';
  context.beginPath();
  context.arc(x, y, pm25 * 0.1, 0, 2 * Math.PI, false);
  context.fill();


}
