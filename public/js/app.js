'use strict';

angular
    .module('timeSheet', [
        'ngCookies',
        'ngResource',
        'ngSanitize',
        'btford.socket-io'
    ])
    .value('nickName', 'anonymous');