var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');

var indexRouter = require('./routes/index');
// var usersRouter = require('./routes/users');

var userRouter = require('./routes/userRouter');
var postCommentRouter = require('./routes/postCommentRouter');

var app = express();

var url = 'mongodb://localhost:{mongodb_port}/{yourdbs}';
var connect = mongoose.connect(url);// added

connect.then((db)=>{
  console.log('Successfully connected to testColab MongoDB');
},
  (err)=>{
    console.log('Failed to connect, Error : ', err);
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

var defaultRouter = express.Router();
defaultRouter.use('/users', userRouter);
defaultRouter.use('/posts', postCommentRouter);

// app.use('/users', usersRouter);

app.use('/api', defaultRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
