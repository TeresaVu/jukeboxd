/**
 * This is an example of a basic node.js script that performs
 * the Authorization Code oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/documentation/web-api/tutorials/code-flow
 */

var express = require('express');
var request = require('request');
var crypto = require('crypto');
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
require('dotenv').config();

var client_id = process.env.CLIENT_ID;
var client_secret = process.env.CLIENT_SECRET; // Your secret
// var redirect_uri = 'http://ec2-18-117-145-1.us-east-2.compute.amazonaws.com:8888/callback'; // Your redirect uri
// var redirect_uri = 'https://jukeboxd-aut8l2do9-teresa-vus-projects.vercel.app/callback'; // Your redirect uri
// var redirect_uri = 'http://localhost:8888/callback'; // Your redirect uri
var redirect_uri = process.env.REDIRECT_URI; // Your redirect uri

const mysqlssh = require('mysql-ssh');
const fs = require('fs');
const bodyParser = require('body-parser');

var CONFIG = require('./db_config.json');

const generateRandomString = (length) => {
  return crypto
  .randomBytes(60)
  .toString('hex')
  .slice(0, length);
}

var stateKey = 'spotify_auth_state';

var app = express();

app.use(express.static(__dirname + '/public'))
   .use(cors())
   .use(cookieParser());
app.use(bodyParser.json());

// Establishing MySQL SSH connection
var dbClient = null;

mysqlssh.connect(
  {
    host: CONFIG.sshhost,
    user: CONFIG.sshuser,
    password: CONFIG.sshpassword
  },
  {
    host: CONFIG.dbhost,
    user: CONFIG.dbuser,
    password: CONFIG.dbpassword,
    database: CONFIG.dbname
  }
)
.then(client => {
  console.log('MySQL SSH connection established');
  dbClient = client;
})
.catch(err => {
  console.log('Error establishing MySQL SSH connection:', err);
});

// Middleware to ensure MySQL SSH connection is established before processing requests
app.use(function(req, res, next) {
  if (dbClient) {
    req.dbClient = dbClient;
    next();
  } else {
    res.status(500).send('MySQL SSH connection not established');
  }
});

var stateKey = 'spotify_auth_state';

var app = express();

app.use(express.static(__dirname + '/public'))
   .use(cors())
   .use(cookieParser());
app.use(bodyParser.json());

app.get('/login', function(req, res) {

  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  var scope = "streaming \
      user-read-email \
      user-read-private";
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
});

app.get('/callback', function(req, res) {

  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect('/player.html#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        Authorization: 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {

        var access_token = body.access_token,
            refresh_token = body.refresh_token;

        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        // use the access token to access the Spotify Web API
        request.get(options, function(error, response, body) {
          console.log(body);
        });

        // we can also pass the token to the browser to make requests from there
        res.redirect('/player.html#' +
          querystring.stringify({
            access_token: access_token,
            refresh_token: refresh_token
          }));
      } else {
        res.redirect('/player.html#' +
          querystring.stringify({
            error: 'invalid_token'
          }));
      }
    });
  }
});

app.get('/refresh_token', function(req, res) {

  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 
      'content-type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64')) 
    },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token,
          refresh_token = body.refresh_token;
      res.send({
        'access_token': access_token,
        'refresh_token': refresh_token
      });
    }
  });
});

app.post('/adduser', function(req, res) {
  // Assuming you're using body-parser middleware to parse request bodies
  // Make sure to install body-parser package if not already installed with npm install body-parser
  const userData = req.body;

    dbClient.query('SELECT COUNT(1) FROM User WHERE userID = ?', [userData.id], function (err, results, fields) {
      if (err) throw err;
      if (results[0]['COUNT(1)'] === 0) {
        var sql = "INSERT INTO User(username, userID) VALUES (?, ?)";
        req.dbClient.query(sql, [userData.display_name, userData.id], function (err, result) {
          if (err) throw err;
          console.log("1 record inserted")
        })
      }

    });
   
 
});

app.post('/addcomment', function(req, res) {
  const commentData = req.body;
  
      dbClient.query('SELECT MAX(commentID) AS max FROM Comment;', function (err, results, fields) {
        
          if (err) throw err
  
          var commentID = results[0].max + 1;
          var sql = "INSERT INTO Comment(commentID, comment, userID, songID, songTimestamp) VALUES (?, ?, ?, ?, ?)";
          dbClient.query(sql, [commentID, commentData.comment, commentData.userID, commentData.songID, commentData.timestamp], function (err, result) {
            if (err) throw err;
          });
      });
  
});

app.get('/getcomments', function(req, res) {
  const commentData = req.query;
  console.log(commentData);

      if (commentData.display == "all") {

        var sql = "SELECT * FROM Comment WHERE songID = ?";
        dbClient.query(sql, [commentData.trackId], function (err, result) {
          if (err) throw err;
          res.json(result);
        });
      } else if (commentData.display == "own") {

        var sql = "SELECT * FROM Comment WHERE songID = ? AND userID = ?";
        dbClient.query(sql, [commentData.trackId, commentData.userID], function (err, result) {
          if (err) throw err;
          res.json(result);
        });

      } else {

        // Send JSON with no records
        var sql = "SELECT * FROM Comment WHERE 1 = 0";
        dbClient.query(sql, function (err, result) {
          if (err) throw err;
          res.json(result);
        });

      }

});


// Start the server
const port = process.env.PORT || 8888;

app.listen(port, () => {
  console.log('Server running on port', port);
});
