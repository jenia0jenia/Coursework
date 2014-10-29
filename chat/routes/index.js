var checkAuth = require('middleware/checkAuth');

module.exports = function(app) {

    app.get('/', require('./frontpage').get);

    app.get('/userconfig', require('./userconfig').get);
    app.post('/userconfig', require('./userconfig').post);

    app.get('/login', require('./login').get);
    app.post('/login', require('./login').post);

    app.post('/logout', require('./logout').post);

    app.get('/room', checkAuth, require('./room').get);

};
