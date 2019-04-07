//Require Mongoose
var mongoose = require('mongoose');

//Define a schema
var Schema = mongoose.Schema;

var userSchema = new Schema({
  username: String,
  songs: [String]
});

UserModel = mongoose.model('UserModel', userSchema );

module.exports.checkNewUser = async (id) =>{

    let result = false;

    await UserModel.findById(id, (err, user) => {
        if(err) throw err;

        if(user === null) result = true;
    });

    return result;
};

module.exports.addNewUser = async (id, songs) =>{

    await UserModel.create({ _id: id, username: id, songs: songs}, (err) => {
        if(err)throw err
    });
};

module.exports.getSavedSongs = async (id) => {

    return await UserModel.findById(id, (err, user) => {
        if(err) throw err;

        if(user != null) return user.songs;
        else return user;
    });
};