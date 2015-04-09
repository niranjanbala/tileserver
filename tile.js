var express = require('express');
var mapnik = require('mapnik');
var mercator = require('./modules/sphericalmercator');
var path = require('path');
var Step = require('step');
var querystring=require('querystring');

//Register Plugins

if (mapnik.register_default_input_plugins) mapnik.register_default_input_plugins();

var router = express.Router();
router.get('/:layer/tile.json',function(req,res) {
	var qs=querystring.stringify(req.query);
	var tileJson={
	'grids' : [ 'http://ec2-54-69-79-243.us-west-2.compute.amazonaws.com:4000/tile/sale/{z}/{x}/{y}.json?'+qs],
	'tilejson' : '2.1.0', 'scheme' : 'xyz', 'tiles' : [''], 'version' : '1.0.0'
	};
	var resString=req.query.callback + '('+ JSON.stringify(tileJson)+')';
	res.end(resString);
});
router.get('/:layer/:z(\\d+)/:x(\\d+)/:y(\\d+).:format', function(req,res){
	try {
	Step(
	function buildPostGis() {
		var map = new mapnik.Map(256,256, mercator.proj4);
		map.bufferSize = 0;
		map.load(path.join(__dirname, 'cityTile.xml'), {strict: true},this);
	},
	function buildMap(err, map){
		if(err) throw err;
		var layer = new mapnik.Layer('tile');
		var postgisBuilder = require('./modules/postgisBuilder');
		var postgis_settings=postgisBuilder.buildPostgis(req);
		layer.datasource = new mapnik.Datasource(postgis_settings);
		layer.styles = [req.query.layerName == 'raildata' ? 'rail' : 'point']; //get from config
		map.add_layer(layer);
		var bbox = mercator.xyz_to_envelope(parseInt(req.params.x),
			parseInt(req.params.y),
			parseInt(req.params.z), false);
		map.extent = bbox;
		if(req.params.format =='png') {
			var im = new mapnik.Image(map.width, map.height);
			map.render(im,this);
		} else {
			//Render UtfGrid
			var grid = new mapnik.Grid(map.width,map.height);
        	var options = {'layer': 0,'fields': ['listing_id','name','title','house_type','num_bedrooms','listing_type','sale_type','listing_category','expected_amount_inr','deposit_amount_inr','rent_maintenance','maintenance_charges','possession_from']};// Parameters
        	console.log(options);
        	try {
        	map.render(grid,options,this);
        	} catch(err2){
        		console.log(err2);
        		throw err2;
        	}
		}
	},
	function render(err,output){
		if(err) throw err;
		if(output instanceof mapnik.Image) {
			//Render Tile Image
			 res.writeHead(200, {'Content-Type': 'image/png'});
               	 	res.end(output.encodeSync('png'));

		} else {
			 var grid_utf = output.encodeSync('utf',{resolution:4});
			 var resString = req.query.callback + '('+ JSON.stringify(grid_utf)+')';
                        res.end(resString);
		}
	}
);
	} catch (err) {
   		res.writeHead(500, {'Content-Type': 'text/plain'});
      res.end(err.message);
	}
});
module.exports = router;
