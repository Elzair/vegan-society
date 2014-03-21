var http     = require('http')
  , io       = require('socket.io')
  , koa      = require('koa')
  , logger   = require('koa-logger')
  , parse    = require('co-body')
  , route    = require('koa-route')
  , serve    = require('koa-static')
  , stylus   = require('koa-stylus')
  , main     = require('./routes/main')
  ;

// Create koa app
var app = koa();

// middleware
app.use(logger());
app.use(stylus('./public'));
app.use(serve('./public'));

// Route middleware
app.use(route.get('/', main.main));

// Create HTTP Server
http.createServer(app.callback()).listen(3000);
console.log('Server listening on port 3000');
