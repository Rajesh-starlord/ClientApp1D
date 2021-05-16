var express = require('express');
var path    = require('path');
var cors    = require('cors');
var csrf    = require('csurf');
var session = require('express-session');
var logger  = require('morgan');
var ejs     = require('ejs');
var flash   = require('express-flash');

var createError  = require('http-errors');
var bodyParser   = require('body-parser');
var cookieParser = require('cookie-parser');
var compression  = require('compression');
const fileUpload = require('express-fileupload');
//const helmet = require("helmet");
const { Authenticate } = require('./src/SecurityConfig/jwt-authentication');
var app = express();

/**** VIEW ENGINE SETUP ****/
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

/*** MIDDLEWARES ***/
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(compression());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
//var maxAge = new Date(Date.now() + 60 * 60 * 1000) // 1 hour
app.use(session({
    secret: 'starlord#6',
    name: 'session',
    saveUninitialized: true,
    proxy: true,
    resave: false,
    sameSite: 'lax',
    saveUninitialized: true,
    cookie:{
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge:1000*60*60*24
    }
}));

/***************** API ROUTERS *******************/
const ApiRouter = require('./routes/Api/userAccess');
const ApiPostRouter = require('./routes/Api/userpost');
const ApiProfileRouter = require('./routes/Api/userProfile');
const ApiRewardRouter = require('./routes/Api/rewards');
app.use('/api/', Authenticate, ApiRouter);
app.use('/api/', Authenticate, ApiPostRouter);
app.use('/api/', Authenticate, ApiRewardRouter);
app.use('/api/', Authenticate, ApiProfileRouter);

/*************************************************/

// enable files upload
app.use(fileUpload({
    createParentPath: true
}));

/*** PROTECT FROM CROSS SITE REQUEST FORGERY ***/
app.use(csrf());
app.use(function (req, res, next) {
  var token = req.csrfToken();
  res.locals.csrfToken = token;
  next();
});

//app.use(helmet());
app.use(flash())
app.use(function(req, res, next){
  /*** if there's a flash message in the session request,
  make it available in the response, then delete it. ***/
  res.locals.sessionFlash = req.session.sessionFlash;
  delete req.session.sessionFlash;
  next();
});
app.use(cors());
app.use(function(req, res, next){
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header('X-XSS-Protection', '1; mode=block');
  res.header('X-Frame-Options', 'deny');
  res.header('X-Content-Type-Options', 'nosniff');
  next();
});
app.disable("x-powered-by");

process.on('warning', e => console.warn(e.stack));
process.on('uncaughtException', function (err,next) {
  console.error('Uncaught Exception');
  console.error(err);
});

if (process.env.NODE_ENV !== 'production') {
  app.enable('trust proxy');
}

app.use((req,res,next)=>{
  res.locals.user = req.session.user;
  next();
});

/*=========================== ACCESS CONTROL =======================================*/
app.use("*",function(req,res,next){
  let path = req.originalUrl;
  if(path.includes('admin/')){
    if(req.session.user){
      let urls = req.session.user.authorizedURL;
      let filter = urls.filter(url => path.includes(url));
      if(filter.length > 0){
        next();
      }else{
        res.redirect('/access-denied');
      }
    }else{
      res.redirect('/');
    }
  }else{
    next();
  }
})

/*==============================================================================================*/

app.get('/favicon.ico', (req, res) => res.status(204));

/************************  ROUTER PATHS *************************/

var indexRouter = require('./routes/index');
var userRouter = require('./routes/user/userAccess');
var adminRouter = require('./routes/Admin/admin');
var adminManageUserRouter = require('./routes/Admin/manageusers');
var adminManageRewardRouter = require('./routes/Admin/managerewards');

app.use('/',indexRouter);
app.use('/',userRouter);
app.use('/admin',adminRouter);
app.use('/admin',adminManageUserRouter);
app.use('/admin',adminManageRewardRouter);

/*****************************************************************/

//catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  console.log("ENV:"+req.app.get('env'))
  // render the error page.
  // Expected errors always throw Error.
  // Unexpected errors will either throw unexpected stuff or crash the application.
  if (Object.prototype.isPrototypeOf.call(Error.prototype, err)) {
    return res.status(err.status || 500).render('err',{message:res.locals.message});
  }

  console.error('~~~ Unexpected error exception start ~~~');
  console.error(err);
  console.error('~~~ Unexpected error exception end ~~~');

  //return res.status(500).json({ error: '⁽ƈ ͡ (ुŏ̥̥̥̥םŏ̥̥̥̥) ु' });
  if(err.message == "invalid csrf token"){
    res.redirect('/');
  }else{
      res.status(500).render('err',{message:res.locals.message});
  }
});

module.exports = app;
