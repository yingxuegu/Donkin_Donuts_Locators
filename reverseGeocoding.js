var GoogleMapsAPI = require( "googlemaps" );

var publicConfig = {
  key: 'AIzaSyDqQI2Xj8eoRNIRGRIOH210qTMJZWoGqL4',
  stagger_time:       1000, // for elevationPath
  encode_polylines:   false,
  secure:             true, // use https
};
var gmAPI = new GoogleMapsAPI(publicConfig);


// reverse geocode API
var reverseGeocodeParams = {
  "latlng":        "44.910254, -68.676588",
  "result_type":   "postal_code",
  "language":      "en",
  "location_type": "APPROXIMATE"
};

gmAPI.reverseGeocode(reverseGeocodeParams, function(err, result){
  console.log(err);
  console.log(result.results[0].formatted_address);
});