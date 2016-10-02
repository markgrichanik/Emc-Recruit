angular.module('timeSheet').filter('startOrFinishFilter', function() {
    return function(input) {
        return input ? 'start' : 'end';
    };
});
