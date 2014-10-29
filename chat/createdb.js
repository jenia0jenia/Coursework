var mongoose = require('lib/mongoose');
var async = require('async');

// 1. drop db
// 2. create db and save 3 users
// 3. close connection

async.series([
    open,
    dropDatabase,
    requireModels,
    createUsers
], function(err) {
    mongoose.disconnect();
    process.exit(err ? 255 : 0);
});

function open(callback) {
    mongoose.connection.on('open', callback);
}

function dropDatabase(callback) {
    var db = mongoose.connection.db;
    db.dropDatabase(callback);
}

function requireModels(callback) {
    require('models/user');

    async.each(Object.keys(mongoose.models), function(modelName, callback) {
        mongoose.models[modelName].ensureIndexes(callback);
    }, callback);
}