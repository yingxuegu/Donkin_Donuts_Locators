var ddController = angular.module('ddCtrl', []);
/*
    This controller is responsible for map and markers. It has some functions about 
    getting ip address, rendering and geocoding
*/
ddController.controller("MapController", [ "$scope", "$http", "mySharedService", function($scope, $http, sharedService) {
    //get ip address
    $.get("http://ipinfo.io", function(response) {
        $scope.ip = response.ip;
        $scope.searchIP($scope.ip);
        }, "jsonp");
    //render icon for each Donkin's Donuts store
    var ddIcon = {
            iconUrl: 'img/DD_Store.png',
            iconSize: [40, 40], // size of the icon
        };
    //geocoding by Google api
    var geocodeAddress = function(geocoder) {
        var address = sharedService.address;
        geocoder.geocode({'address': address}, function(results, status) {
        if (status === google.maps.GeocoderStatus.OK) {
            $scope.center.lat = results[0].geometry.location.lat();
            $scope.center.lng = results[0].geometry.location.lng();
            console.log(results[0].geometry.location.lat());
            console.log(results[0].geometry.location.lng());        
            } else {
             alert('Geocode was not successful for the following reason: ' + status);
            }
        });
    };
                
    //give each point a popup    
    var addressPointsToMarkers = function(points) { 
        return points.map(function(ap) {
            var ddProperty = ap.properties;
            if(ddProperty.fullmenu >= 0.5) {
                ddProperty.fullmenutext = "Yes";
            }else{
                ddProperty.fullmenutext = "No";
            } 
            if(ddProperty.wifi >= 0.1) {
                ddProperty.wifitext = "Yes";
            }else{
                ddProperty.wifitext = "No";
            } 
            if(ddProperty.F24hours >= 0.4) {
                ddProperty.F24hourstext = "24 Hours";
            }else{
                ddProperty.F24hourstext = "5:00 am - 10 pm";
            } 
            if(ddProperty.drivethrough >= 0.2) {
                ddProperty.drivethroughtext = "Yes";
            }else{
                ddProperty.drivethroughtext = "No";
            } 
            return {
                  layer: 'realworld',
                  lat: ap.geometry.coordinates[1],
                  lng: ap.geometry.coordinates[0],
                  message: "Phone: " + ddProperty.biz_phone + '<br>' + "Address: " + 
                  ddProperty.e_address + ", " + ddProperty.e_city + ", " + ddProperty.e_state + 
                  "<br>" + "Zip Code: " + ddProperty.e_zip_full + "<br>" + "Full Menu: " + 
                  ddProperty.fullmenutext + "<br>" + "Wifi: " + ddProperty.wifitext + 
                  "<br>" + "Time: " + ddProperty.F24hourstext + "<br>" + "Drive Through: " +
                  ddProperty.drivethroughtext ,
                  icon: ddIcon
                };
              });
            };
        //get cilent geo location by ip
        $scope.searchIP = function(ip) {
            var url = "http://freegeoip.net/json/" + ip;
            $http.get(url).success(function(res) {
            $scope.center.lng = res.longitude;
            $scope.center.lat = res.latitude;
            //after get the address of client, then reload
            //$scope.init();
            });
        };

        $scope.changeLocation = function() {
                $scope.center.lat = 45;
                $scope.center.lng = 10;
        };
        //initialize map 
        $scope.init = function() {
              angular.extend($scope, {
                center: {
                    lat: 43.657284, 
                    lng: -70.268753,
                    zoom: 10
                },
                controls: {
                    fullscreen: {
                        position: 'topleft'
                    }
                },
                layers: {
                    baselayers: {
                        osm: {
                            name: 'OpenStreetMap',
                            type: 'xyz',
                            url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                        }
                    },
                    overlays: {
                        realworld: {
                            name: "Real world data",
                            type: "markercluster",
                            visible: true
                        }
                    }
                }
            });
            }; 
            //Filter features by selected checkbox and dropdown
            var featureFilter = function (feature) {
                var distanceLimitation = true;
                var wifi = true;
                var fullday = true;
                var fullmenu = true;
                var drivethrough = true;
                var ddlat ;
                var ddlng ;
                var distance;
                var centerLat = 45.761603;
                var centerLng = -68.4421806;
                //Filter by Wifi
                if(sharedService.wifi === true) {
                    wifi = (feature.properties.wifi >= 0.1);
                }
                //Filter by 24 Hours
                if(sharedService.fullday === true) {
                    fullday = (feature.properties.F24hours >= 0.8);
                }
                //Filter by drivethrough
                if(sharedService.drivethrough === true) {
                    drivethrough = (feature.properties.drivethrough >= 0.3);
                }
                //Filter by full menu
                if(sharedService.fullmenu === true) {
                    fullmenu = (feature.properties.fullmenu >= 0.6);
                }
                //Calculate distance between center point and other point
                var centerPoint  = L.latLng($scope.center.lat, $scope.center.lng);
                ddlat = feature.geometry.coordinates[1];
                ddlng = feature.geometry.coordinates[0];
                var objectPoint = L.latLng(ddlat, ddlng); 
                distance = centerPoint.distanceTo(objectPoint) * 0.000621371; 
                //Filter by distance
                if(distance > sharedService.distance) {
                    distanceLimitation = false;
                }
                return wifi && fullmenu && fullday && drivethrough && distanceLimitation;
            };
            $scope.features = null;
            
            //Load geojson data
            $http.get("data/New_England_dd.geojson").success(function(data) {
                sharedService.features = data.features;
                $scope.markers = addressPointsToMarkers(sharedService.features);
            });
            //listener for checkboxs
            $scope.$on('change', function() {
               var features = sharedService.features.filter(featureFilter);
               //add points to the map
               $scope.markers = addressPointsToMarkers(features);
            });
            //listener for search button
            $scope.$on('search', function() {
               var geocoder = new google.maps.Geocoder();
               geocodeAddress(geocoder); 
               var features = sharedService.features.filter(featureFilter);
               //add new Filtered markers
               $scope.markers = addressPointsToMarkers(features); 
               //change map center
               //$scope.init();
            }); 
            //initialize the map
            $scope.init();
    }]);
/*
    This controller is responsible for the interaction from dropdown button and checkboxs.
*/
ddController.controller('SearchController', ["$scope", "$http", "mySharedService", 
        function($scope, $http, sharedService){
            $scope.isCollapsed = true;
            $scope.isContactCollapsed = true;
            $scope.address = "";
            $scope.radius = 10000;
            $scope.wifiConfirmed = false;
            $scope.fullmenuConfirmed = false;
            $scope.fulldayConfirmed = false;
            $scope.drivethroughConfirmed = false;
            //Trigger the function when people hit search button
            $scope.search = function () {
                sharedService.address = $scope.address;
                //send search message
                sharedService.prepForBroadcast("search");
            };
            //Trigger the function when people change checkboxes
            $scope.featureChanged = function() {
                //update sharedService data
                sharedService.wifi = $scope.wifiConfirmed;
                sharedService.fullmenu = $scope.fullmenuConfirmed;
                sharedService.fullday = $scope.fulldayConfirmed;
                sharedService.drivethrough = $scope.drivethroughConfirmed;
                //send change message
                sharedService.prepForBroadcast("change");
            };
            //Trigger the function when people change the dropdown menu
            $scope.selectDistance = function () {
                sharedService.distance = $scope.radius;
                //send change message
                sharedService.prepForBroadcast("change");
            };
    }]);

    ddController.controller('DensityMapController', [ "$scope", "$http", function($scope, $http) {
            $scope.$on("leafletDirectiveGeoJson.mouseover", function(ev, leafletPayload) {
                stateMouseover(leafletPayload.leafletObject.feature, leafletPayload.leafletEvent);
            });

            $scope.$on("leafletDirectiveGeoJson.click", function(ev, leafletPayload) {
                stateClick(leafletPayload.leafletObject, leafletPayload.leafletEvent);
            });

            angular.extend($scope, {
                center: {
                    lat: 39.1232189,
                    lng: -94.8882723,
                    zoom: 4
                },
                controls: {
                    fullscreen: {
                        position: 'topleft'
                    }
                },
                legend: {
                    colors: [ '#bd0026', '#f03b20', '#fd8d3c', '#fecc5c', '#ffffb2', '#fff' ],
                    labels: [ '10000', '50000', '1000000', '100000000', '50000000', 'none' ]
                }
            });
            function stateClick(country, event) {
                country = country.feature;
                console.log(country.properties.name);
            }

            // Get a state paint color from 
            function getColor(density) {
                if(density < 10000) {
                    return "#bd0026";
                }else if (density >= 10000 && density < 50000){
                    return "#f03b20";
                }else if (density >= 50000 && density < 1000000){
                    return "#fd8d3c";
                }else if (density >= 100000 && density < 10000000){
                    return "#fecc5c";
                }else if (density >= 1000000 && density < 500000000){
                    return "#ffffb2";
                }
                return "#FFF";
            }

            function style(feature) {
               // console.log("feature: " + feature.properties.name);
                return {
                    fillColor: getColor(feature.properties.density),
                    weight: 2,
                    opacity: 1,
                    color: 'white',
                    dashArray: '3',
                    fillOpacity: 0.7
                };
            }

            // Mouse over function, called from the Leaflet Map Events
            function stateMouseover(feature, leafletEvent) {
                var layer = leafletEvent.target;
                layer.setStyle({
                    weight: 2,
                    color: '#666',
                    fillColor: 'white'
                });
                layer.bringToFront();
                $scope.selectedState = feature;
                if($scope.selectedState.properties.density) {
                    $scope.densityText = " person have one Donkin's Donuts store";
                }else {
                     $scope.selectedState.properties.densityDetail = "No Store in this state";
                }
                console.log(feature);
            }

            // Get the states geojson data from a JSON
            $http.get("data/us-states.geojson").success(function(data, status) {
                angular.extend($scope, {
                    geojson: {
                        data: data,
                        style: style,
                        resetStyleOnMouseout: true
                    },
                        selectedState: {}
                });
            });
        }]);