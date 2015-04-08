var gmap = new google.maps.Map(document.getElementById('gmap'), {
  disableDefaultUI: true,
  keyboardShortcuts: false,
  draggable: false,
  disableDoubleClickZoom: true,
  scrollwheel: false,
  streetViewControl: false
});

var view = new ol.View({
  // make sure the view doesn't go beyond the 22 zoom levels of Google Maps
  maxZoom: 21
});

view.on('change:center', function() {
  var center = ol.proj.transform(view.getCenter(), 'EPSG:3857', 'EPSG:4326');
  gmap.setCenter(new google.maps.LatLng(center[1], center[0]));
});
view.on('change:resolution', function() {
  gmap.setZoom(view.getZoom());
});

var callback = function(infoLookup) {
    var msg = "";
    if (infoLookup) {
      console.log(infoLookup);     
    }
};
var tileLayer = new ol.layer.Tile({
  source:  new ol.source.XYZ({
    url:'http://ec2-54-69-79-243.us-west-2.compute.amazonaws.com:4000/tile/sale/{z}/{x}/{y}.png'
  }),

});

var gridSource = new ol.source.TileUTFGrid({
  url: 'http://ec2-54-69-79-243.us-west-2.compute.amazonaws.com:4000/tile/sale/tile.json',
  //preemptive: false
});

var gridLayer = new ol.layer.Tile({source: gridSource});


var olMapDiv = document.getElementById('olmap');
var map = new ol.Map({
  layers: [tileLayer,gridLayer],
  target: olMapDiv,
  view: view
});
var displayCountryInfo = function(coordinate) {
  var viewResolution = /** @type {number} */ (view.getResolution());
  gridSource.forDataAtCoordinateAndResolution(coordinate, viewResolution,
      function(data) {
        if (data) {
          console.log(data);
        }
      });
};
map.on('pointermove', function(evt) {
  if (evt.dragging) {
    return;
  }
  var coordinate = map.getEventCoordinate(evt.originalEvent);
  displayCountryInfo(coordinate);
});

map.on('click', function(evt) {
  displayCountryInfo(evt.coordinate);
});
view.setCenter([0, 0]);
view.setZoom(1);


olMapDiv.parentNode.removeChild(olMapDiv);
gmap.controls[google.maps.ControlPosition.TOP_LEFT].push(olMapDiv);