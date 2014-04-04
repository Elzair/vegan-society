var http     = require('http')
  //, io       = require('socket.io')
  , koa      = require('koa')
  , logger   = require('koa-logger')
  , route    = require('koa-route')
  , serve    = require('koa-static')
  , stylus   = require('koa-stylus')
  , routes   = require('./routes')
  ;

// Create koa app
var app = koa();

// middleware
app.use(logger());
app.use(stylus(__dirname + '/public'));
app.use(serve(__dirname + '/public'));

// Route middleware
app.use(route.get('/', routes.index));
app.use(route.get('/locations/:id', routes.location));
app.use(route.get('/search', routes.search));

// Create HTTP Server
http.createServer(app.callback()).listen(3000);
console.log('Server listening on port 3000');