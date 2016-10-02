#!/usr/bin/env node



global.express = require('express');
global.mongoose = require('mongoose');
global.app = express();
global.server = require('http').Server(app);
global.io = require('socket.io')(server);
global.ONE_HOUR = 60 * 60 * 1000;
global.TWENTY_FOUR_HOURS = ONE_HOUR * 24;
global.port = 2015;

global.TimeSheetSchema = mongoose.Schema({
    id: Number,
    created: Date,
    firstName: String,
    lastName: String,
    start: Boolean,
    // img: { data: Buffer, contentType: String },
    search: [String]
});
// tell express where to serve static files from
app.use(express.static(__dirname + '/public'));

//upon server exit, we have to close mongoDB connection
server.on('close', function() {
    mongoose.connection.close();
    process.exit();
});

process.on('SIGINT', function() {
    server.close();
});


var lib= require('../lib/main.js');
lib.startServer();
