#! /usr/bin/env node

// Import all our dependencies
global.express = require('express');
global.mongoose = require('mongoose');
global.app = express();
global.server = require('http').Server(app);
global.io = require('socket.io')(server);
global.ONE_HOUR = 60 * 60 * 1000;
global.TWENTY_FOUR_HOURS = ONE_HOUR * 24;
global.PORT = 2015;




var lib= require('./server.js');
lib.startServer();