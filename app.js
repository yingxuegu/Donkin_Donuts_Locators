var dd = angular.module('ddLocators', ['ui.bootstrap', 'leaflet-directive']);

dd.controller('CollapseDemoCtrl', function ($scope) {
  $scope.isCollapsed = true;
});



dd.controller("MarkersClustering10000MarkersController", [ "$scope", "$http", function($scope, $http) {

            //get ip address by jquery
            $.get("http://ipinfo.io", function(response) {
                    $scope.ip = response.ip;
                    //alert($scope.ip);
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
                    ddProperty.fullmenu = "Yes";
                }else{
                    ddProperty.fullmenu = "No";
                } 

                if(ddProperty.wifi >= 0.1) {
                    ddProperty.wifi = "Yes";
                }else{
                    ddProperty.wifi = "No";
                } 

                if(ddProperty.F24hours >= 0.4) {
                    ddProperty.F24hours = "24 Hours";
                }else{
                    ddProperty.F24hours = "5:00 am - 10 pm";
                } 

                if(ddProperty.drivethrough >= 0.2) {
                    ddProperty.drivethrough = "Yes";
                }else{
                    ddProperty.drivethrough = "No";
                } 


                return {
                  layer: 'realworld',
                  lat: ap.geometry.coordinates[1],
                  lng: ap.geometry.coordinates[0],
                  message: "Phone: " + ddProperty.biz_phone + '<br>' + "Address: " + 
                  ddProperty.e_address + ", " + ddProperty.e_city + ", " + ddProperty.e_state + 
                  "<br>" + "Zip Code: " + ddProperty.e_zip_full + "<br>" + "Full Menu: " + 
                  ddProperty.fullmenu + "<br>" + "Wifi: " + ddProperty.wifi + 
                  "<br>" + "Time: " + ddProperty.F24hours + "<br>" + "Drive Through: " +
                  ddProperty.drivethrough ,
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
            } ; 

            $scope.init();



            $http.get("dunkin_donuts_valued.geojson").success(function(data) {
               // console.log(data.features);
                var features = data.features;
                $scope.markers = addressPointsToMarkers(features);
            });
        }]);


