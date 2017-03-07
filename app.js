var express = require('express')
  , http = require('http')
  , passport = require('passport')
  , util = require('util')
  , bodyParser = require("body-parser")
  , cookieParser = require("cookie-parser")
  , logger = require("express-logger")

  , LinkedInStrategy = require('passport-linkedin').Strategy;

var app = express();

// configure Express

app.use(bodyParser.urlencoded({extended: true }));
app.set("view engine","ejs");

app.use(require("express-session")({
  secret: "just starting with the mean development",
  resave: false,
  saveUninitialized: false
}));

app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(logger({path: "/path/to/logfile.txt"}));
app.use(cookieParser());
app.use(require('express-method-override')('method_override_param_name'));


// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(__dirname + '/public'));

var LINKEDIN_API_KEY = "8130vgef5l3q80";
var LINKEDIN_SECRET_KEY = "xYIUmGyVCSbCm9KS";

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});


passport.use(new LinkedInStrategy({
    consumerKey: LINKEDIN_API_KEY,
    consumerSecret: LINKEDIN_SECRET_KEY,
    callbackURL: "http://localhost:3000/auth/linkedin/callback"
  },
  function(token, tokenSecret, profile, done) {
    console.log(token, tokenSecret, profile);
    // asynchronous verification, for effect...
    process.nextTick(function () {
     // return linked in profile
      return done(null, profile);
    });
  }
));

app.get('/', function(req, res){
  res.render('index', { user: req.user });
});

app.get('/account', ensureAuthenticated, function(req, res){
  res.render('account', { user: req.user });
});

app.get('/login', function(req, res){
  res.render('login', { user: req.user });
});

// linked in authentication
app.get('/auth/linkedin',
  passport.authenticate('linkedin'),
  function(req, res){
    // The request will be redirected to LinkedIn for authentication, so this
    // function will not be called.
  });

// authentication callback
app.get('/auth/linkedin/callback',
  passport.authenticate('linkedin', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

// to check if user is logged in
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login');
}
