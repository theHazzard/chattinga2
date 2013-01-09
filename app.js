
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , UsrModels = require('./models/UserModel')
  , ChatModels = require('./models/ChatModel') 
  , app = express()
  , io = require('socket.io')
  , http = require('http').createServer(app)
  , sio = io.listen(http)
  , path = require('path')
  , passport = require('passport')
  , FacebookStrategy = require('passport-facebook').Strategy
  , TwitterStrategy = require('passport-twitter').Strategy
  , mongoose = require('mongoose')
  , config = require('./config')
  , MemoryStore = express.session.MemoryStore
  , sessionStore = new MemoryStore()
  , Session = express.session.Session
  , cookie = require('express/node_modules/cookie')
  , parseSignedCookie = require('express/node_modules/connect').utils.parseSignedCookies;

console.log(UsrModels);
mongoose.connect('localhost', 'test');

passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  UsrModels.Usuario.findById(id, function(err, user) {
    done(err, user);
  });
});

sio.set('authorization', function (data, accept) {
   if (data.headers.cookie) {
        var cki = parseSignedCookie(cookie.parse(data.headers.cookie),'M1Sup3rS3cretP@ssw0rd');
        data.sessionID = cki['express.sid'];
        sessionStore.get(data.sessionID, function (err, session) {
            if (session){
              UsrModels.Usuario.findById(session['passport'].user, function(err, user) {
                if (err){ accept('Error', false); };
                if (user){
                  data.user = user
                  return accept(null, true);
                } else {
                  return accept('No se encontro el usuario', false);
                };
              });
            };
        });
    } else {
       return accept('No cookie transmitted.', false);
    }
});

sio.sockets.on('connection', function (socket) {
  ChatModels.Chat.Ultimos20(function (comments){
    console.log(comments);
    socket.emit('history',comments);
  });
  socket.on('mensaje',function(message){
    ChatModels.Chat.Crear(socket.handshake.user._id, message, function (cht){
      console.log(cht);
      sio.sockets.emit('nMensaje',{nombre: socket.handshake.user.NombreUsuario, picture: socket.handshake.user.Foto, mensaje: cht});
    });
  });
});

passport.use(new TwitterStrategy({
    consumerKey: config.twit.consumerKey,
    consumerSecret: config.twit.consumerSecret,
    callbackURL: "http://localhost:3000/auth/twitter/callback"
  },
  function(token, tokenSecret, profile, done) {
    UsrModels.Usuario.findOrCreate(profile, function(err, user) {
      if (err) { return done(err); }
      done(null, user);
    });
  }
));

passport.use(new FacebookStrategy({
    clientID: config.fb.appId,
    clientSecret: config.fb.appSecret,
    callbackURL: "http://localhost:3000/auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    UsrModels.Usuario.findOrCreate(profile, function(err, user) {
      if (err) { return done(err); }
      done(null, user);
    });
  }
));

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('M1Sup3rS3cretP@ssw0rd'));
  app.use(express.session({store: sessionStore
        , secret: 'M1Sup3rS3cretP@ssw0rd'
        , key: 'express.sid'}));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
  app.use(require('stylus').middleware(__dirname + '/public'));
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/users', user.findById);

//RUTAS LOGIN TWITTER
app.get('/auth/twitter', passport.authenticate('twitter'));
app.get('/auth/twitter/callback', 
  passport.authenticate('twitter', { successRedirect: '/',
                                     failureRedirect: '/login' }));
//////////////////////////////

//RUTAS LOGIN FACEBOOK
app.get('/auth/facebook', passport.authenticate('facebook'));
app.get('/auth/facebook/callback', 
  passport.authenticate('facebook', { successRedirect: '/',
                                      failureRedirect: '/login' }));
//////////////////////////////
app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

http.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
