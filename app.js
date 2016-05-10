var dd = angular.module('ddLocators', ['ui.bootstrap', 'leaflet-directive']);

dd.controller("MarkersClustering10000MarkersController", [ "$scope", "$http", "mySharedService", function($scope, $http, sharedService) {
    //get ip address by jquery
    $.get("http://ipinfo.io", function(response) {
        $scope.ip = response.ip;
        $scope.searchIP($scope.ip);
        }, "jsonp");
    var ddIcon = {
            iconUrl: 'DD_Store.png',
            iconSize: [50, 50], // size of the icon
        };
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
            
            console.log("check shared data: " + sharedService.haha);


            $scope.$on('search', function() {
               $scope.init();
               console.log("receive search message");
               console.log("reload: " + sharedService.searchLat + " " + sharedService.searchLng);
               //$scope.init();
            }); 



            var featureFilter = function (feature) {
                //console.log("yes");
                //console.log(feature.properties.wifi);
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

                if(sharedService.wifi === true) {
                    wifi = (feature.properties.wifi >= 0.1);
                }
                if(sharedService.fullday === true) {
                    fullday = (feature.properties.F24hours >= 0.8);
                }
                if(sharedService.drivethrough === true) {
                    drivethrough = (feature.properties.drivethrough >= 0.3);
                }
                if(sharedService.fullmenu === true) {
                    fullmenu = (feature.properties.fullmenu >= 0.6);
                }
                ddlat = feature.geometry.coordinates[1];
                ddlng = feature.geometry.coordinates[0];
                distance = google.maps.geometry.spherical.computeDistanceBetween(new google.maps.LatLng(centerLat,centerLng), 
                    new google.maps.LatLng(ddlat,ddlng)) * 0.000621371; 

                if(distance > 100) {
                    distanceLimitation = false;
                }

                return wifi && fullmenu && fullday && drivethrough && distanceLimitation;
            };

            $scope.$on('change', function() {
               //console.log("receive change message");
               //console.log("sharedService features");
               //console.log(sharedService.features);
               var features = sharedService.features.filter(featureFilter);
               //console.log("change type: " + typeof features);
               //console.log("new features");
               //console.log(features);
              //$scope.features = features;
               //$scope.markers = null;
               $scope.markers = addressPointsToMarkers(features);
            }); 

            $scope.features = null;

            $scope.init();

            $http.get("dunkin_donuts_valued.geojson").success(function(data) {
                console.log(data.features);
                sharedService.features = data.features;
                //console.log("original type: " + typeof sharedService.features);
                $scope.markers = addressPointsToMarkers(sharedService.features);
            });
           

            

        }]);

    dd.factory('mySharedService', function($rootScope) {
        var sharedService = {};
        sharedService.haha = 'haha';
        sharedService.wifi = false;
        sharedService.fullmenu = false;
        sharedService.fullday = false;
        sharedService.drivethrough = false;
        sharedService.message = "";
        sharedService.feature = null;
        sharedService.prepForBroadcast = function(msg) {
            this.message = msg;
            this.broadcastItem();
        };
        sharedService.broadcastItem = function() {
            $rootScope.$broadcast(this.message);
        };
        return sharedService;
    });


    dd.controller('SearchController', ["$scope", "$http", "mySharedService", 
        function($scope, $http, sharedService){
            $scope.isCollapsed = true;
            $scope.address = "";
            $scope.wifiConfirmed = false;
            $scope.fullmenuConfirmed = false;
            $scope.fulldayConfirmed = false;
            $scope.drivethroughConfirmed = false;
            $scope.search = function () {
                //console.log("hit search button");
                var geocoder = new google.maps.Geocoder();
                geocodeAddress(geocoder);
                
            };
            $scope.featureChanged = function() {
                //console.log("change wifi comfirm data");
                sharedService.wifi = $scope.wifiConfirmed;
                sharedService.fullmenu = $scope.fullmenuConfirmed;
                sharedService.fullday = $scope.fulldayConfirmed;
                sharedService.drivethrough = $scope.drivethroughConfirmed;
                sharedService.prepForBroadcast("change");
            };

            
            var geocodeAddress = function(geocoder) {
                var address = $scope.address;
                geocoder.geocode({'address': address}, function(results, status) {
                  if (status === google.maps.GeocoderStatus.OK) {
                    sharedService.searchLat = results[0].geometry.location.lat();
                    sharedService.searchLng = results[0].geometry.location.lng();
                    console.log(results[0].geometry.location.lat());
                    console.log(results[0].geometry.location.lng());
                    sharedService.prepForBroadcast("search");
                  } else {
                    alert('Geocode was not successful for the following reason: ' + status);
                  }
                });
            };
            
    }]);


