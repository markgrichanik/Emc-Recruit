<<<<<<< HEAD
var app = angular.module('timeSheet', ['ui.bootstrap', 'btford.socket-io', 'smart-table']).value('nickName', 'anonymous');

app.controller('AppCtrl', ['$scope', 'timeSheetSocket', 'nickName', '$uibModal', 'tableService', '$timeout', function($scope, timeSheetSocket,  nickName, $uibModal, tableService, $timeout) {
=======
var app = angular.module('timeSheet', ['ui.bootstrap', 'btford.socket-io', 'smart-table']);

app.controller('AppCtrl', ['$scope', 'timeSheetSocket', '$uibModal', 'tableService', '$timeout', function($scope, timeSheetSocket, $uibModal, tableService, $timeout) {
>>>>>>> origin/master
    var localTableState = { search: {}, sort: {}, pagination: { start: 0, number: 0 } };
    $scope.emptyTable = true;

    $scope.displayed = [];
    //smart table pipe function, will call getPage and will render the table on the screen
    $scope.callServer = function callServer(tableState, ctrl) {
        $scope.isLoading = true;

        if (!$scope.stCtrl && ctrl) {
            $scope.stCtrl = ctrl;
        }

        if (!tableState && $scope.stCtrl) {
            $scope.stCtrl.pipe();
            return;
        }

        var pagination = tableState.pagination;
        var start = pagination.start || 0; // This is NOT the page number, but the index of item in the list that you want to use to display the table.
        var number = pagination.number || 10; // Number of entries showed per page.

        tableService.getPage(start, number, tableState).then(function(result) {
            $scope.displayed = result.data;
            tableState.pagination.numberOfPages = result.numberOfPages; //set the number of pages so the pagination can update
            $scope.isLoading = false;
            if (tableState != localTableState) { //not first run
                angular.copy(tableState, localTableState);
            }
            $scope.emptyTable = true;
            if (result.data.length > 0) {
                $scope.emptyTable = false;
            }
        });

    };
    //render data from db
    $scope.init = function() {
        $scope.callServer(localTableState);
    }

    $scope.openModal = function() {
        var modalInstance = $uibModal.open({
            templateUrl: 'views/addUserModal.html',
            controller: 'ModalInstanceCtrl',
            size: 'lg'
        });

        modalInstance.result.then(function() {
          //nothing to do, all the responsability on the service
        }, function() {
            console.log('Modal dismissed at: ' + new Date());
        });
    };

    $scope.$on('socket:broadcast', function(event, data) {
        console.log('got a message', JSON.stringify(data));
        if (data.error) {
            $scope.$apply(function() {
                $scope.errorLog = data;
            });
        } else {
            return $scope.callServer();
        }
    });
}]);
