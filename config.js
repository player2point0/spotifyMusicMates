// config.js
const config = {
    app: {
      port: 8888
    },
    spotify:{
        my_client_id : "",
        my_client_secret : "",
        redirect_uri : 'http://localhost:8888/callback',
        scopes : 'user-read-recently-played user-read-currently-playing playlist-modify-public user-library-read'
    }

   };
   


   module.exports = config;