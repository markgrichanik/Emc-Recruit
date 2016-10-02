'use strict';
angular.module('timeSheet')
.factory('timeSheetSocket', function (socketFactory) {
      var socket = socketFactory();
      socket.forward('broadcast');
      return socket;
  });
