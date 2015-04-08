//URL parsing helper
var url = require('url');

module.exports.buildPostgis = function(req) {
	var params=req.params;
	var query=req.query;
	//console.log(params);
	var whereClause= query.layerName + ' WHERE 1=1';
	if(query.zone) {	
		whereClause+=" AND zone IN('"+query.zone+"')";
	}

	if(query.status && query.status != "all" ){
		whereClause+=" AND status IN('"+query.status+"')";
	}

	if(query.area && query.area != "all"){
		whereClause += " AND area IN ('"+query.area+"')";
	}
	Object.keys(req.query).forEach(function(key){
		if(key=='layerName' || key=='callback'){}else {
			whereClause += " AND "+key +" IN ('"+req.query[key]+"')";
		}
	});
	console.log(req.query);	
	console.log(whereClause);
	return  {
		'host' : 'mycfdbinstance.cacrqzjrklxy.us-west-2.rds.amazonaws.com',
		'dbname' : 'mycfdb',
		'table' : "( select the_geom, listing_id,name,title,house_type,num_bedrooms,listing_type,sale_type,listing_category,expected_amount_inr,deposit_amount_inr,rent_maintenance,maintenance_charges,possession_from from "+whereClause+") foo",
		'user' : 'gisuser',
		'password' : 'welcome001*',
		'type' : 'postgis',
		'initial_size' : '10',
                'row_limit' : '250',
		'asynchronous_request': 'true',
		'max_async_connection': '8',
		'estimate_extent' : '1',
		'extent' : '-20005048.4188,-9039211.13765,19907487.2779,17096598.5401'
	};
};
