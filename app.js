/**
 * This is an example of a basic node.js script that performs
 * the Authorization Code oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 */

var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var querystring = require('querystring');

var client_id = '0dc431a2682b462e93cd00fbf8295447'; // Your client id
var client_secret = '3c29e4ee31b242758532b7c12cffe4a5'; // Your client secret
var redirect_uri = 'http://spotlistr.herokuapp.com/callback'; // Your redirect uri

// Reddit API settings
var reddit_client_id = 'x_1EWGYnLKmEZA';
var reddit_client_secret = 'N6csZ5eNC_js63V5GxxRXTEn2UY';
var reddit_redirect_uri = 'http://spotlistr.herokuapp.com/reddit-oauth-callback';

// Change the redirect URI if we are developing
// To set NODE_ENV in Windows: SET NODE_ENV=development
//        NODE_ENV in *nix/OSX: export NODE_ENV=development
if (process.env.NODE_ENV === "development") {
  redirect_uri = 'http://localhost:8888/callback';
}

var app = express();

app.use(express.static(__dirname + '/dist'));

app.get('/login', function(req, res) {

  // your application requests authorization
  var scope = 'user-read-private playlist-read playlist-read-private playlist-modify playlist-modify-private';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri
    }));
});

app.get('/callback', function(req, res) {

  // your application requests refresh and access tokens
  var code = req.query.code;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    form: {
      code: code,
      redirect_uri: redirect_uri,
      grant_type: 'authorization_code',
      client_id: client_id,
      client_secret: client_secret
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

      // we can also pass the tokens to the browser to make requests from there
      res.redirect('/#/splash/' + access_token + '/' + refresh_token);
    }
  });
});

app.get('/reddit-oauth-callback', function(req, res) {

  if (req.query.error) {
    // TODO: Handle error
  }

  var code = req.query.code,
      state = req.query.state;

  var authOptions = {
    url: 'https://ssl.reddit.com/api/v1/access_token',
      form: {
        code: code,
        redirect_uri: reddit_redirect_uri,
        grant_type: 'authorization_code',
    },
    headers: { 'Authorization': 'Basic ' + (new Buffer(reddit_client_id + ':' + reddit_client_secret).toString('base64')) },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token,
          refresh_token = body.refresh_token;

      res.redirect('/#/search/multireddit/' + access_token + '/' + refresh_token);
    }
  });
});

app.get('/refresh_token', function(req, res) {

  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.send({
        'access_token': access_token
      });
    }
  });
});

app.get('/reddit/api/multi/mine/:access_token', function(req, res) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type");

  // http://www.reddit.com/dev/api#GET_api_multi_mine
  var options = {
    url: 'https://oauth.reddit.com/api/multi/mine.json',
    headers: {
      'Authorization': 'bearer ' + req.params.access_token,
      'user-agent': makeRedditApiUserHeader()
    }
  };

  // use the access token to access the Spotify Web API
  request.get(options, function(error, response, body) {
    res.send(body);
  });
});

app.get('/reddit/refresh_token/:access_token/:refresh_token', function(req, res) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type");

  var options = {
    url: 'https://ssl.reddit.com/api/v1/access_token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(reddit_client_id + ':' + reddit_client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: req.params.refresh_token
    },
    json: true,
  };

  console.log(options);

  request.post(options, function(error, response, body) {
    console.log(body);
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.send({
        'access_token': access_token
      });
    }
  });
});

var makeRedditApiUserHeader = function() {
  return 'Spotlistr/1.8.1';
}

var port = Number(process.env.PORT || 8888);
app.listen(port, function() {
  console.log("Listening on " + port);
});
