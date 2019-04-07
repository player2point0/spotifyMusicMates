module.exports.loadPage = function(){
  return "/public/views/login.html";
};

module.exports.generateRandomString = (length) =>{
  let text = '';
  let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

module.exports.getUserId = async (access_token, axios) =>{

  const options = {
    url: 'https://api.spotify.com/v1/me',
    headers: { 'Authorization': 'Bearer ' + access_token },
    json: true
  };

  const result = await axios(options);

  return result.data.id;
};

module.exports.getSavedPlaylists = async (access_token, axios, offset) =>{

  const options = {
    url: 'https://api.spotify.com/v1/me/playlists',
    headers: { 'Authorization': 'Bearer ' + access_token },
    params: {
      limit: 50,
      offset: offset
    },
    json: true
  };

  const result = await axios(options);

  return result;
};

module.exports.getSavedSongs = async (access_token, axios) =>{

  //get limit 
  const limitOptions = {
    url: 'https://api.spotify.com/v1/me/tracks',
    headers: { 'Authorization': 'Bearer ' + access_token },
    params: {
      limit: 1,
      offset: 0
    },
    json: true
  };

  const limitResult = await axios(limitOptions);
  const limit = limitResult.data.total;

  //generate enough promises
  let offset = 0;
  let songPromises = [];
  
  while(offset <= limit)
  {
    songPromises.push(getSongAtOffset(access_token, axios, offset));
    offset += 50;    
  }

  let songsArr = await Promise.all(songPromises);  //returns an array of response

  let songIds = [];

  for(let i = 0;i<songsArr.length;i++)
  {
    let songsResponse = songsArr[i].data.items;

    for(let j = 0;j<songsResponse.length;j++)
    {
      let songId = songsResponse[j].track.id;
      songIds.push(songId);
    }
  }

  return songIds;
};

function getSongAtOffset(access_token, axios, offset)
{
  const options = {
    method:'get',
    url: 'https://api.spotify.com/v1/me/tracks',
    headers: { 'Authorization': 'Bearer ' + access_token },
    params : {
      limit: 50,
      offset: offset 
    },
    json: true
  };

  return new Promise((resolve, reject) => {
  
    const result = axios(options);

    resolve(result);
  });
}