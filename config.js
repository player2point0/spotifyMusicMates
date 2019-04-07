// config.js
const config = {
    app: {
      port: 8888
    },
    spotify:{
        my_client_id : "672aa60cb7aa4372905a8806f8411f9d",
        my_client_secret : "b91edfdc85864773aefd4bf8bcce77aa",
        redirect_uri : 'http://localhost:8888/callback',
        scopes : 'user-read-recently-played user-read-currently-playing playlist-modify-public user-library-read'
    }

   };
   


   module.exports = config;