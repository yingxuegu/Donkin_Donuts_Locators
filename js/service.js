var ddService = angular.module('ddService', []);
//This service is used to share data and communicate between MapController and Service Controller.    
ddService.factory('mySharedService', function($rootScope) {
    var sharedService = {};
    sharedService.wifi = false;
    sharedService.address = "";
    sharedService.fullmenu = false;
    sharedService.fullday = false;
    sharedService.drivethrough = false;
    sharedService.message = "";
    sharedService.feature = null;
    sharedService.distance = 10000;
    sharedService.prepForBroadcast = function(msg) {
        this.message = msg;
        this.broadcastItem();
    };
    sharedService.broadcastItem = function() {
        $rootScope.$broadcast(this.message);
    };
    return sharedService;
});
