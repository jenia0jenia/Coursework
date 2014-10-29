/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var config = require('config');
var log = require('lib/log')(module);
var mongoose = require('lib/mongoose');
var HttpError = require('error').HttpError;

var app = express();

app.engine('ejs', require('ejs-locals'));
app.set('views', __dirname + 'template');
app.set('view engine', 'ejs');

app.use(express.favicon()); // /favicon.ico

if (app.get('env') == 'devepolment') {
} else {
    app.use(express.logger('default'));
}

app.use(express.bodyParser()); /* считывает формы,
присланные методом POST, json и после данные доступны в req.body
этот meddleware передаёт данные дальше через next() */

app.use(express.cookieParser('be quiet'));

var sessionStore = require('lib/sessionStore');

app.use(express.session({
    secret: config.get('session:secret'), // цифровая подпись -  длинный уникальный ключ
    key: config.get('session:key'),
    cookie: config.get('session:cookie'),
    store: sessionStore
}));

app.use(require('middleware/sendHttpError'));
app.use(require('middleware/loadUser'));

app.use(app.router); // позволяет удобным образом говорить: какие запросы и как будут обработаны

require('routes')(app);


app.use(express.static(path.join(__dirname, 'public'))); /* если
никакие medddleware запрос не обработали, то управление перейдёт к нему */

app.use(function(err, req, res, next) {
    // NODE_ENV = 'production'
    if (typeof err == 'number') { // next(404);
        err = new HttpError(err);
    }

    if (err instanceof HttpError) {
        res.sendHttpError(err);
    } else {
        if (app.get('env') == 'development') {
            express.errorHandler()(err, req, res, next);
        } else {
            log.error(err);
            err = new HttpError(500);
            res.sendHttpError(err);
        }
    }
});

var server = http.createServer(app);
server.listen(config.get('port'), function(){
    log.info('Express server listening on port ' + config.get('port'));
});
var io = require('socket')(server);
app.set('io', io);