var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var express = require("express");
var bodyParser = require('body-parser');
var readingTime = require('reading-time');
var request = require('request');
var cheerio = require('cheerio');
require('dotenv').config()
var secret = process.env.AUTH_SECRET;
var app = express();
var apiRoutes = express.Router();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

mongoose.connect('mongodb://localhost/learney');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("Connected to MongoDB server.");
});

var userSchema = mongoose.Schema({
  firstname: String,
  lastname: String,
  email: String,
  password: String
});
var learneySchema = mongoose.Schema({
  name: String,
  field: String,
  deadline: Date,
  branches: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Branch'
  }],
  user_id: String
});
var branchSchema = mongoose.Schema({
  name: String,
  entries: [{
    type: mongoose.Schema.ObjectId,
    ref: 'BranchEntry'
  }],
});
var linkSchema = mongoose.Schema({
  name: String,
  description: String,
  url: String,
  readingTime: Number,
  finished: Boolean,
});

var User = mongoose.model('User', userSchema);
var Learney = mongoose.model('Learney', learneySchema);
var Branch = mongoose.model('Branch', branchSchema);
var BranchEntry = mongoose.model('BranchEntry', linkSchema);

function handleErrors() {
  err = "";
  if (err) {
    res.json({
      status: "error",
      error: "An unknown error occurred."
    });
    console.log(err);
  }
}

function printError(errorCode, res) {
  var errorMessage
  switch (errorCode) {
    case 500:
      errorMessage = 'The entered auth token is invalid or expired.';
      break;
    default:
      errorMessage = 'An unknown error occurred.';
      break;
  }
  res.json({
    status: 'error',
    error: errorMessage
  });
}

apiRoutes.post('/login', function(req, res) {
  User.findOne({
    email: req.body.email,
    password: req.body.password
  }, function(err, user) {
    if (err) return console.error(err);
    try {
      res.json({
        status: "OK",
        authToken: jwt.sign({
          id: user._id
        }, secret)
      });
    } catch (err) {
      console.log(err);
      res.json({
        status: "error",
        error: "The provided user credentials do not match."
      });
    }
  });
});

apiRoutes.post('/createUser', function(req, res) {
  new User({
    username: req.body.username,
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    email: req.body.email,
    password: req.body.password
  }).save(function(err, user) {
    handleErrors();
    res.json({
      status: "OK"
    });
  });
});

apiRoutes.post('/getUserDetails', function(req, res) {
  User.count({
    _id: jwt.verify(req.body.token, secret).id
  }, function(err, count) {
    if (count > 0) {
      var db_learneys;
      Learney.find({
        user_id: jwt.verify(req.body.token, secret).id
      }, 'name field', function(err, learney) {
        handleErrors();
        db_learneys = learney;
        User.findOne({
          _id: jwt.verify(req.body.token, secret).id
        }, function(err, user) {
          handleErrors();
          res.json({
            status: "OK",
            username: user.username,
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            learneys: db_learneys
          });
        });
      });
    } else {
      printError(500, res);
    }
  });
});

apiRoutes.post('/createLearney', function(req, res) {
  User.count({
    _id: jwt.verify(req.body.token, secret).id
  }, function(err, count) {
    if (count > 0) {
      new Learney({
        name: req.body.name,
        field: req.body.field,
        deadline: req.body.deadline,
        branches: [],
        user_id: jwt.verify(req.body.token, secret).id
      }).save(function(err, user) {
        handleErrors();
        res.json({
          status: "OK"
        });
      });
    } else {
      printError(500, res);
    }
  });
});

apiRoutes.post('/createBranch', function(req, res) {
  User.count({
    _id: jwt.verify(req.body.token, secret).id
  }, function(err, count) {
    if (count > 0) {
      new Learney({
        name: req.body.name,
        field: req.body.field,
        deadline: req.body.deadline,
        branches: [],
        user_id: jwt.verify(req.body.token, secret).id
      }).save(function(err, user) {
        handleErrors();
        res.json({
          status: "OK"
        });
      });
    } else {
      printError(500, res);
    }
  });
});

apiRoutes.post('/createEntry', function(req, res) {
  User.count({
    _id: jwt.verify(req.body.token, secret).id
  }, function(err, count) {
    if (count > 0) {
      request(req.body.url, function(error, response, html) {
        if (!error && response.statusCode == 200) {
          new BranchEntry({
            name: req.body.name,
            description: req.body.description,
            url: req.body.url,
            readingTime: Math.round(readingTime(cheerio.load(html).text()).minutes),
            finished: false,
          }).save().then(function(entry) {
            Branch.update({
              _id: req.body.branch_id
            }, {
              $push: {
                entries: entry._id
              }
            }).then(function(inner_entry) {
              console.error(err);
              res.json({
                status: "OK"
              });
            });
          });
        }
      });
    }
  });
});

apiRoutes.post('/getLearney', function(req, res) {
  User.count({
    _id: jwt.verify(req.body.token, secret).id
  }, function(err, count) {
    if (count > 0) {
      Learney.findOne({
        user_id: jwt.verify(req.body.token, secret).id,
        _id: req.body.learney_id
      }).populate({
        path: 'branches',
        populate: {
          path: 'entries'
        }
      }).exec(function(err, result) {
        console.error(err);
        res.json({
          status: "OK",
        });
      });
    } else {
      printError(500, res);
    }
  });
});

function removeUser(db_username) {
  User.remove({
    username: db_username
  }, function(err) {
    if (err) return handleError(err);
    console.log("User " + db_username + " removed from database.");
  });
}

function clearLearneys() {
  Learney.remove({}, function(err) {
    if (err) return handleError(err);
    console.log("Learneys cleared.");
  });
}

function clearBranches() {
  Branch.remove({}, function(err) {
    if (err) return handleError(err);
    console.log("Branches cleared.");
  });
}

function clearEntries() {
  BranchEntry.remove({}, function(err) {
    if (err) return handleError(err);
    console.log("Entries cleared.");
  });
}

function getAllUsers() {
  User.find(function(err, users) {
    if (err) return console.error(err);
    console.log("Content of collection 'User' is:");
    console.log(users);
  });
}

function getAllLearneys() {
  Learney.find(function(err, learneys) {
    if (err) return console.error(err);
    console.log("Content of collection 'Learney' is:");
    console.log(learneys);
  });
}

function getAllBranches() {
  Branch.find(function(err, branches) {
    if (err) return console.error(err);
    console.log("Content of collection 'Branch' is:");
    console.log(branches);
  });
}

function getAllEntries() {
  BranchEntry.find(function(err, entries) {
    if (err) return console.error(err);
    console.log("Content of collection 'Entry' is:");
    console.log(entries);
  });
}

app.use('/api', apiRoutes);
app.listen(8080);
