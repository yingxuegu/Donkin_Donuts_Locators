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
            iconSize: [50, 50], // size of the icon
        };
    //geocoding by Google api
    var geocodeAddress = function(geocoder) {
        var address = sharedService.address;
        geocoder.geocode({'address': address}, function(results, status) {
        if (status === google.maps.GeocoderStatus.OK) {
            sharedService.searchLat = results[0].geometry.location.lat();
            sharedService.searchLng = results[0].geometry.location.lng();
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
            sharedService.searchLng = res.longitude;
            sharedService.searchLat = res.latitude;
            //after get the address of client, then reload
            $scope.init();
            });
        };
        //initialize map 
        $scope.init = function() {
              angular.extend($scope, {
                center: {
                    lat: sharedService.searchLat,
                    lng: sharedService.searchLng,
                    zoom: 10
                },
                events: {
                    map: {
                        enable: ['moveend', 'popupopen'],
                        logic: 'emit'
                    },
                    marker: {
                        enable: [],
                        logic: 'emit'
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
                var centerPoint  = L.latLng(sharedService.searchLat, sharedService.searchLng);
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
            $http.get("data/dunkin_donuts_valued.geojson").success(function(data) {
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
               $scope.init();
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