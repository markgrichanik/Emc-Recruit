// server.js

// Import all our dependencies
var express = require('express');
var mongoose = require('mongoose');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var ONE_HOUR = 60 * 60 * 1000;
var TWENTY_FOUR_HOURS = ONE_HOUR * 24;
// tell express where to serve static files from
app.use(express.static(__dirname + '/public'));
var port = 2015;
mongoose.connect("mongodb://localhost/EmcDB");
//upon server exit, we have to close mongoDB connection
server.on('close', function() {
    mongoose.connection.close();
    process.exit();
});

process.on('SIGINT', function() {
    server.close();
});

var TimeSheetSchema = mongoose.Schema({
    id: Number,
    created: Date,
    firstName: String,
    lastName: String,
    start: Boolean,
    // img: { data: Buffer, contentType: String },
    search: [String]
});
//we are saving the search criteria for future use (filtering mainly)
TimeSheetSchema.pre('save', function(next) {
    this.search = [this.id];
    var searchIfAvaliable = [
        this.created,
        this.firstName,
        this.lastName,
        this.start
    ];
    for (var i = 0; i < searchIfAvaliable.length; i++) {
        this.search.push(searchIfAvaliable[i]);
    }
    next();
});
// creating indexes for faster search
TimeSheetSchema.index({ search: 1 });
TimeSheetSchema.index({ id: 1 });
// create a model from the timeSheet schema
var TimeSheet = mongoose.model('TimeSheet', TimeSheetSchema);
// allow CORS
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-type,Accept,X-Access-Token,X-Key');
    if (req.method == 'OPTIONS') {
        res.status(200).end();
    } else {
        next();
    }
});


/*||||||||||||||||||||||ROUTES|||||||||||||||||||||||||*/
// route for our index file
app.get('/', function(req, res) {
    //send the index.html in our public directory
    res.sendfile('index.html');
});

//This route produces a list of timesheets as filterd by 'first' query
app.get('/firstName', function(req, res) {
    //Find
    TimeSheet.find({
        'firstName': req.query.firstName.toLowerCase()
    }).exec(function(err, msgs) {
        //Send
        res.json(msgs);
    });
});

app.get('/lastName', function(req, res) {
    //Find
    TimeSheet.find({
        'lastName': req.query.lastName.toLowerCase()
    }).exec(function(err, msgs) {
        //Send
        res.json(msgs);
    });
});

app.get('/filterAndSort', function(req, res) {
    var per_page = 10;
    var andArray = [];
    var searchFor = null;
    if (req.query.predicate) {
        var predicate = req.query.predicate.toLowerCase();
    }
    if (req.query.sortBy) {
        var sortingBy = req.query.sortBy;
    }
    if (req.query.sortDir) {
        var sortDirection = req.query.sortDir;
    }
    if (!req.query.page) {
        var page = 0;
    } else {
        var page = req.query.page;
    }

    if (predicate) {
        var searchTerms = predicate.split(" ");

        searchTerms.forEach(function(searchTerm) {
            andArray.push({
                search: {
                    $regex: searchTerm,
                    $options: 'i'
                }
            });
        });
        searchFor = { $and: andArray };
    }
    var sortDB = getSortingForMongo(sortingBy, sortDirection);
    //getting table from db, on error we are sending error message back to client
    TimeSheet.find(searchFor).
    limit(per_page).
    skip(per_page * page).
    sort(sortDB).
    exec(function(err, times) {
        if (err) {
            return res.status(400).send({
                message: { error: true, msg: err }
            });
        } else {
            if (times.length == 0) {
                res.json({ data: times, numberOfPages: 0 });
            }
            var searchForCounter = {};
            if (searchFor) {
                searchForCounter = searchFor;
            }
            // in order to know how many rows exists according to our query
            // we have to call 'Count' with our predicates
            TimeSheet.count(searchForCounter, function(err, c) {
                if (c > 0) {
                    res.json({ data: times, numberOfPages: Math.ceil(c / per_page) });
                }
            });
        }
    });
});

/*||||||||||||||||||END ROUTES|||||||||||||||||||||*/

var getSortingForMongo = function(field, direction) {
        if (field && direction == "false") {
            return "-" + field;
        } else if (field) {
            return field;
        } else {
            return {};
        }
    }
    /*||||||||||||||||SOCKET|||||||||||||||||||||||*/
    //Listen for connection
io.on('connection', function(socket) {
    //Globals
    var defaultTimeSheet = 'general'; // for future development, each manager can see only it's own employees, etc..
    //Listens for new user
    socket.on('new user', function(data) {
        if (validateNewUserRequest(data)) {
            TimeSheet.findOne({ id: data.id }, 'start', { sort: { created: -1 } }, function(err, user) {
                if (err) {
                    io.sockets.emit('broadcast', { error: true, msg: err });
                }
                //check if user is in shift and tries to get in once again
                if (user && data.start && user.start) {
                    console.log("found user : " + user.start);
                    io.sockets.emit('broadcast', { error: true, msg: "User already in shift" });

                } else {
                    var addedTime = new TimeSheet(data);
                    //Call save to insert the timesheet
                    addedTime.save(function(err, savedTime) {
                        if (err) {
                            io.sockets.emit('broadcast', { error: true, msg: "couldnt save user" });
                        } else {
                            io.sockets.emit('broadcast', { error: false, msg: savedTime });
                        }
                    });

                }
            });
        }
    });
});
/*||||||||||||||||||||END SOCKETS||||||||||||||||||*/
var validateNewUserRequest = function(data) {
    if (!data.firstName || !data.lastName || !data.created) {
        io.sockets.emit('broadcast', { error: true, msg: "Invalid input" });
        return false;
    }
    return true;
}
server.listen(port);
console.log('Please open localhost:' + port +' in order to view time sheet');
