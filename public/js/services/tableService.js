angular.module('timeSheet').factory('tableService', ['$q', '$filter', '$timeout', 'timeSheetSocket', '$http', function($q, $filter, $timeout, timeSheetSocket, $http) {
    // upon login of new user, all other users will get a message, 
    //each user will perform a REST call to get 10 rows by his own crieria (filtering, sorting, etc.)
    function getPage(start, number, params) {
        var page = 0;
        var uri = "/filterAndSort";
        if (start > 0) {
            page = Math.ceil(start / number);
        }
        uri += "?page=" + page;
        if (params.search && params.search.predicateObject && params.search.predicateObject.$) {
            uri += "&predicate=" + params.search.predicateObject.$;
        }
        if (params.sort && params.sort.predicate) {
            uri += "&sortBy=" + params.sort.predicate;
            uri += "&sortDir=" + params.sort.reverse;
        }
        var deferred = $q.defer();
        $http.get(uri)
            .then(function(response) {
                deferred.resolve({ data: response.data.data, numberOfPages: response.data.numberOfPages });
            });
        return deferred.promise;
    }
    return {
        getPage: getPage
    };

}]);
