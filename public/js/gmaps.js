var tileSource = new ol.source.XYZ({});
var railSource = new ol.source.XYZ({});

var gridSource = new ol.source.TileUTFGrid({
  url: 'http://ec2-54-69-79-243.us-west-2.compute.amazonaws.com:4000/tile/sale/tile.json?layerName=apartments&status='+$("#status").val()+'&area='+$("#area").val(),
});

var railGridSource = new ol.source.TileUTFGrid({
  url: 'http://ec2-54-69-79-243.us-west-2.compute.amazonaws.com:4000/tile/sale/tile.json?layerName=raildata',
})

tileSource.setUrl('http://ec2-54-69-79-243.us-west-2.compute.amazonaws.com:4000/tile/sale/{z}/{x}/{y}.png?layerName=apartments&status='+$("#status").val()+'&area='+$("#area").val());

$("#railCheck").change(function(){
  if($(this).is(":checked")) {
        railSource.setUrl('http://ec2-54-69-79-243.us-west-2.compute.amazonaws.com:4000/tile/sale/{z}/{x}/{y}.png?layerName=raildata')
        railGridLayer.setSource(railGridSource);
  } else {
    railSource.setUrl('');
  }
        
});

$("#area,#status").change(function(){
  tileSource.setUrl('http://ec2-54-69-79-243.us-west-2.compute.amazonaws.com:4000/tile/sale/{z}/{x}/{y}.png?layerName=apartments&status='+$("#status").val()+'&area='+$("#area").val());
  gridSource = new ol.source.TileUTFGrid({
    url: 'http://ec2-54-69-79-243.us-west-2.compute.amazonaws.com:4000/tile/sale/tile.json?layerName=apartments&status='+$("#status").val()+'&area='+$("#area").val(),
  });
  gridLayer.setSource(gridSource);
});
var gmap = new google.maps.Map(document.getElementById('gmap'), {
  disableDefaultUI: true,
  keyboardShortcuts: false,
  draggable: false,
  disableDoubleClickZoom: true,
  scrollwheel: false,
  streetViewControl: false,

});
var view = new ol.View({
  // make sure the view doesn't go beyond the 22 zoom levels of Google Maps
  maxZoom:21
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
  source:  tileSource
});
var railLayer = new ol.layer.Tile({
  source : railSource
})


var gridLayer = new ol.layer.Tile({source: gridSource});

var railGridLayer = new ol.layer.Tile({ source : railGridSource})


var olMapDiv = document.getElementById('olmap');
var map = new ol.Map({
  layers: [tileLayer,gridLayer,railLayer,railGridLayer],
  target: olMapDiv,
  view: view,
  zoom:14,

});


//Creating Bubble
var infoElement = document.getElementById('property-info');
var apartmentElement = document.getElementById('apartment-name');
var cityElement = document.getElementById('city-name');

var infoOverlay = new ol.Overlay({
  element: infoElement,
  stopEvent: false,
  offset:[15,15]
});
map.addOverlay(infoOverlay);

var displayPropertyInfo = function(coordinate) {
  var viewResolution = /** @type {number} */ (view.getResolution());
  gridSource.forDataAtCoordinateAndResolution(coordinate, viewResolution,
      function(data) {
        olMapDiv.style.cursor = data ? 'pointer' : '';  
        if (data) {
          if($("#railCheck").is(":checked")){
            console.log(data['f_code_desc']);
            apartmentElement.innerHTML = "<b>Apartment:</b>" + data['hovertext'];
          }else {
            apartmentElement.innerHTML = "<b>Apartment:</b>" + data['hovertext'].replace("Bangalore","");
            cityElement.innerHTML = "<b>City:</b>" + 'Bangalore';  
          }
          
        }
        infoOverlay.setPosition(data ? coordinate : undefined);
        
      });
};

map.on('pointermove', function(evt) {
  if (evt.dragging) {
    return;
  }

  var coordinate = map.getEventCoordinate(evt.originalEvent);
  displayPropertyInfo(coordinate);
});

map.on('click', function(evt) {
  displayPropertyInfo(evt.coordinate);
});
view.setCenter(ol.proj.transform([ 77.6309395,12.9539974 ], 'EPSG:4326', 'EPSG:3857'));
view.setZoom(10);

olMapDiv.parentNode.removeChild(olMapDiv);
gmap.controls[google.maps.ControlPosition.TOP_LEFT].push(olMapDiv);