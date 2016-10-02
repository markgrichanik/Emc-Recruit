angular.module('timeSheet').controller('ModalInstanceCtrl', ['$scope', '$uibModalInstance', 'timeSheetSocket', function($scope, $uibModalInstance, timeSheetSocket) {
    $scope.user = {};
    $scope.user.start = true;
    $scope.imgSrc = "img/unnamed.jpg";
    $scope.$watch("user", function() {
        $scope.errorLog = null;
    }, true);

    $scope.imageUpload = function(element) {
        var reader = new FileReader();
        reader.onload = $scope.imageIsLoaded;
        reader.readAsDataURL(element.files[0]);
    }

    $scope.imageIsLoaded = function(e) {
        $scope.$apply(function() {
            $scope.imgSrc = e.target.result;
        });
    }

    $scope.submit = function() {
        var timeToAdd = {
            id: $scope.user.id,
            firstName: $scope.user.firstName,
            lastName: $scope.user.lastName,
            created: new Date(),
            img: $scope.imgSrc,
            start: $scope.user.start
        };
        timeSheetSocket.emit('new user', timeToAdd);
    }

    $scope.$on('socket:broadcast', function(event, data) {
        if (data.error) {
            $scope.$apply(function() {
                $scope.errorLog = data;
            });
        } else {
            $uibModalInstance.close();
            return data;
        }
    });

    $scope.ok = function() {
        $uibModalInstance.close($scope.selected.item);
    };

    $scope.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };
}]);
