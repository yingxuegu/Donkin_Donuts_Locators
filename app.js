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
                    $scope.clientLon = res.longitude;
                    $scope.clientLat = res.latitude;
                    //after get the address of client, then reload
                    $scope.init();
                });
            };

            $scope.init = function() {
              angular.extend($scope, {
                center: {
                    lat: $scope.clientLat,
                    lng: $scope.clientLon,
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
            $scope.init();
            console.log("check shared data: " + sharedService.haha);
            $scope.$on('search', function() {
               console.log("receive search message");
            }); 

            var featureFilter = function (feature) {
                //console.log("yes");
                //console.log(feature.properties.wifi);
                var wifi = true;
                var fullday = true;
                var fullmenu = true;
                var drivethrough = true;
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

                return wifi && fullmenu && fullday && drivethrough;
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

            $http.get("dunkin_donuts_valued.geojson").success(function(data) {
                //console.log(data.features);
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
                sharedService.prepForBroadcast("search");
            };
            $scope.featureChanged = function() {
                //console.log("change wifi comfirm data");
                sharedService.wifi = $scope.wifiConfirmed;
                sharedService.fullmenu = $scope.fullmenuConfirmed;
                sharedService.fullday = $scope.fulldayConfirmed;
                sharedService.drivethrough = $scope.drivethroughConfirmed;
                sharedService.prepForBroadcast("change");
            };
    }]);


