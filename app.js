const express = require('express');
const app = express();
const config = require('./config.js');
const login = require('./controllers/login.js');
const axios = require("axios");
var request = require('request'); // "Request" library
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
var url = 'mongodb://127.0.0.1/spotifyMusicMates';
const User = require('./models/user.js');

mongoose.connect(url, {useNewUrlParser: true});
//Get the default connection
var db = mongoose.connection;
//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var stateKey = 'spotify_auth_state';

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({extended: true}));

app.use(express.static('public'));

app.listen(config.app.port, () => {
    console.log('Server is up and running on port number ' + config.app.port);
});

app.get("/", (req, res) => {
    res.sendFile(__dirname+"/public/views/index.html");
});

app.use(express.static(__dirname + '/public'))
   .use(cors())
   .use(cookieParser());

app.get('/compare', (req, res) => {
  res.sendFile(__dirname + '/public/views/compare.html');
});


app.post('/compare', async (req, res) => {
  //get usernames
  let username1 = req.body.username1;
  let username2 = req.body.username2;
  //get first user's songs
  let songs1 = await User.getSavedSongs(username1);
  //get second user's songs
  let songs2 = await User.getSavedSongs(username2);
  
  if(songs1 == null || songs2 == null)
  {
    res.send("user not found");
    return;
  } 

  //loop through one and check if in second
  let sharedSongs = [];

  for(let i = 0;i<songs1.length;i++)
  {
    for(let j = 0;j<songs2.length;j++)
    {
      if(songs1[i] == songs2[j])
      {
        sharedSongs.push(songs1[i]);
      }
    }
  }

  console.log(sharedSongs);

  //create playlist
  const createOptions = {
    method:'post',
    url: 'https://api.spotify.com/v1/users/'+username1+'/playlists',
    headers: { 'Authorization': 'Bearer ' + access_token,
      'Content-type' : application/json },
    params : {
      name: username1+" X "+username2, 
    },
    json: true
  };

  let playlist = await axios(createOptions);
  let playlistId = playlist.data.id;

  //add shared songs


});


app.get('/login', function(req, res) {

  var state = login.generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: config.spotify.my_client_id,
      scope: config.spotify.scopes,
      redirect_uri: config.spotify.redirect_uri,
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
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: config.spotify.redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(config.spotify.my_client_id + ':' + config.spotify.my_client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, async function(error, response, body) {
      if (!error && response.statusCode === 200) {

        var access_token = body.access_token,
            refresh_token = body.refresh_token;

      const userID = await login.getUserId(access_token, axios);
      //check if new user
      const newUser = await User.checkNewUser(userID);

      if(newUser)
      {
        const savedSongs = await login.getSavedSongs(access_token, axios);
        await User.addNewUser(userID, savedSongs);
      }
      
      res.send(userID + "new user "+newUser);

      }
       else {
        res.redirect('/#' +
          querystring.stringify({
            error: 'invalid_token'
          }));
      }
    });
  }
});

/*
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
*/